export function formatDistance(meters, unit = 'km') {
  if (meters == null || isNaN(meters)) return '0 m';

  if (unit === 'miles') {
    const miles = meters * 0.000621371;
    if (miles < 0.1) {
      const feet = Math.round(meters * 3.28084);
      return `${feet} ft`;
    }
    return `${miles.toFixed(miles >= 10 ? 0 : 1)} mi`;
  }

  // Metric
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(km >= 10 ? 0 : 1)} km`;
}

export function formatDuration(seconds) {
  if (seconds == null || isNaN(seconds) || seconds <= 0) return '0 min';

  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) {
    return `${Math.max(1, totalMinutes)} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days} d ${remainingHours} hr`;
}

export function formatCoordinates(lat, lng) {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return '';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(5)}° ${latDir}, ${Math.abs(lng).toFixed(5)}° ${lngDir}`;
}

export function cleanAddress(addressString) {
  if (!addressString) return '';
  return addressString.trim();
}
