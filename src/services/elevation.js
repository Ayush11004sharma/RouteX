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

/**
 * Fetches elevation profile along a route geometry using Open-Meteo elevation API.
 */
export async function getRouteElevation(geometry, maxSamples = 40, signal) {
  if (!geometry || geometry.length < 2) return null;

  const cumulativeDistances = [0];
  let totalDist = 0;
  for (let i = 1; i < geometry.length; i++) {
    totalDist += getHaversineDistance(geometry[i - 1], geometry[i]);
    cumulativeDistances.push(totalDist);
  }

  const sampleIndices = [0];
  const stepCount = Math.min(maxSamples, geometry.length);
  const targetStepDist = totalDist / (stepCount - 1);

  let currentTarget = targetStepDist;
  for (let i = 1; i < geometry.length - 1; i++) {
    if (cumulativeDistances[i] >= currentTarget && sampleIndices.length < stepCount - 1) {
      sampleIndices.push(i);
      currentTarget += targetStepDist;
    }
  }
  sampleIndices.push(geometry.length - 1);

  const sampledCoords = sampleIndices.map((idx) => geometry[idx]);
  const sampledDistances = sampleIndices.map((idx) => Math.round(cumulativeDistances[idx]));

  const lats = sampledCoords.map((c) => Number(c[0]).toFixed(4)).join(',');
  const lngs = sampledCoords.map((c) => Number(c[1]).toFixed(4)).join(',');

  const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;

    const data = await res.json();
    const elevations = data.elevation;
    if (!Array.isArray(elevations) || elevations.length === 0) return null;

    let totalAscent = 0;
    let totalDescent = 0;
    let maxElevation = elevations[0];
    let minElevation = elevations[0];

    const points = elevations.map((elev, i) => {
      if (elev > maxElevation) maxElevation = elev;
      if (elev < minElevation) minElevation = elev;

      if (i > 0) {
        const delta = elev - elevations[i - 1];
        if (delta > 0) totalAscent += delta;
        else totalDescent += Math.abs(delta);
      }

      return {
        distanceMeters: sampledDistances[i],
        elevation: Math.round(elev),
        lat: sampledCoords[i][0],
        lng: sampledCoords[i][1],
      };
    });

    return {
      points,
      totalAscent: Math.round(totalAscent),
      totalDescent: Math.round(totalDescent),
      maxElevation: Math.round(maxElevation),
      minElevation: Math.round(minElevation),
    };
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.error('Route elevation fetch failed:', err);
    return null;
  }
}
