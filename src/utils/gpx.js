export function generateGpx(route, fromName = 'Start', toName = 'Destination') {
  const points = route.geometry.map(([lat, lng]) => `      <trkpt lat="${lat}" lon="${lng}"></trkpt>`).join('\n');
  const now = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="RouteX Navigation - https://routex.app" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(route.name || `${fromName} to ${toName}`)}</name>
    <desc>Distance: ${(route.distance / 1000).toFixed(2)} km, Duration: ${Math.round(route.duration / 60)} minutes</desc>
    <time>${now}</time>
  </metadata>
  <trk>
    <name>${escapeXml(route.name || `${fromName} to ${toName}`)}</name>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>`;
}

export function downloadGpx(route, fromName = 'Start', toName = 'Destination') {
  const gpxContent = generateGpx(route, fromName, toName);
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = `routex-route-${Date.now()}.gpx`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe) {
  return String(unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
