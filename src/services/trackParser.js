function getHaversineDistance(c1, c2) {
  const R = 6371000;
  const dLat = ((c2[0] - c1[0]) * Math.PI) / 180;
  const dLon = ((c2[1] - c1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1[0] * Math.PI) / 180) *
      Math.cos((c2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function parseTrackContent(content, filename) {
  const lower = content.toLowerCase();

  if (
    filename.endsWith('.geojson') ||
    filename.endsWith('.json') ||
    lower.includes('"type": "feature') ||
    lower.includes('"geometry"')
  ) {
    return parseGeoJson(content, filename);
  } else if (filename.endsWith('.kml') || lower.includes('<kml')) {
    return parseKml(content, filename);
  } else {
    return parseGpx(content, filename);
  }
}

function parseGpx(xmlString, filename) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  const points = [];
  const trkpts = doc.querySelectorAll('trkpt, rtept, wpt');

  trkpts.forEach((el) => {
    const lat = parseFloat(el.getAttribute('lat') || '');
    const lon = parseFloat(el.getAttribute('lon') || '');
    if (!isNaN(lat) && !isNaN(lon)) {
      points.push([lat, lon]);
    }
  });

  if (points.length === 0) {
    throw new Error('No GPS track points found in this GPX file.');
  }

  const nameEl = doc.querySelector('metadata > name, trk > name');
  const trackName = nameEl?.textContent || filename.replace(/\.[^/.]+$/, '');

  let totalDist = 0;
  for (let i = 1; i < points.length; i++) {
    totalDist += getHaversineDistance(points[i - 1], points[i]);
  }

  return {
    id: `track_${Date.now()}`,
    name: trackName,
    geometry: points,
    distanceMeters: Math.round(totalDist),
    format: 'gpx',
    importedAt: Date.now(),
  };
}

function parseGeoJson(jsonString, filename) {
  const json = JSON.parse(jsonString);
  const points = [];

  const extractCoords = (geom) => {
    if (!geom) return;
    if (geom.type === 'LineString' && Array.isArray(geom.coordinates)) {
      geom.coordinates.forEach((c) => {
        if (c.length >= 2) points.push([c[1], c[0]]);
      });
    } else if (geom.type === 'MultiLineString' && Array.isArray(geom.coordinates)) {
      geom.coordinates.forEach((line) => {
        line.forEach((c) => {
          if (c.length >= 2) points.push([c[1], c[0]]);
        });
      });
    }
  };

  if (json.type === 'FeatureCollection' && Array.isArray(json.features)) {
    json.features.forEach((f) => extractCoords(f.geometry));
  } else if (json.type === 'Feature') {
    extractCoords(json.geometry);
  } else {
    extractCoords(json);
  }

  if (points.length === 0) {
    throw new Error('No line coordinates found in GeoJSON file.');
  }

  let totalDist = 0;
  for (let i = 1; i < points.length; i++) {
    totalDist += getHaversineDistance(points[i - 1], points[i]);
  }

  return {
    id: `track_${Date.now()}`,
    name: json.name || filename.replace(/\.[^/.]+$/, ''),
    geometry: points,
    distanceMeters: Math.round(totalDist),
    format: 'geojson',
    importedAt: Date.now(),
  };
}

function parseKml(xmlString, filename) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  const coordEls = doc.querySelectorAll('coordinates');
  const points = [];

  coordEls.forEach((el) => {
    const text = el.textContent || '';
    const tuples = text.trim().split(/\s+/);
    tuples.forEach((t) => {
      const parts = t.split(',').map(Number);
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        points.push([parts[1], parts[0]]);
      }
    });
  });

  if (points.length === 0) {
    throw new Error('No coordinates found in KML file.');
  }

  let totalDist = 0;
  for (let i = 1; i < points.length; i++) {
    totalDist += getHaversineDistance(points[i - 1], points[i]);
  }

  const nameEl = doc.querySelector('Placemark > name, Document > name');
  return {
    id: `track_${Date.now()}`,
    name: nameEl?.textContent || filename.replace(/\.[^/.]+$/, ''),
    geometry: points,
    distanceMeters: Math.round(totalDist),
    format: 'kml',
    importedAt: Date.now(),
  };
}

export function downloadGeoJson(route, fromName = 'Start', toName = 'Destination') {
  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: route.name || `${fromName} to ${toName}`,
          distance_meters: route.distance,
          duration_seconds: route.duration,
        },
        geometry: {
          type: 'LineString',
          coordinates: route.geometry.map(([lat, lng]) => [lng, lat]),
        },
      },
    ],
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json;charset=utf-8' });
  triggerDownload(blob, `routex-route-${Date.now()}.geojson`);
}

export function downloadKml(route, fromName = 'Start', toName = 'Destination') {
  const coordsString = route.geometry.map(([lat, lng]) => `${lng},${lat},0`).join('\n          ');
  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${route.name || `${fromName} to ${toName}`}</name>
    <description>RouteX Navigation Export: ${(route.distance / 1000).toFixed(2)} km</description>
    <Placemark>
      <name>${route.name || 'Route'}</name>
      <LineString>
        <extrude>1</extrude>
        <tessellate>1</tessellate>
        <altitudeMode>clampToGround</altitudeMode>
        <coordinates>
          ${coordsString}
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;

  const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml;charset=utf-8' });
  triggerDownload(blob, `routex-route-${Date.now()}.kml`);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
