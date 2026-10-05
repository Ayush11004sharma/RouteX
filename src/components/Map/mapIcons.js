import L from 'leaflet';

export function createPlaceMarkerIcon(isSelected = false, label) {
  const size = isSelected ? 42 : 32;
  const color = isSelected ? '#ef4444' : '#2563eb';
  const shadow = isSelected
    ? 'filter: drop-shadow(0 6px 12px rgba(239, 68, 68, 0.45));'
    : 'filter: drop-shadow(0 4px 8px rgba(37, 99, 235, 0.35));';

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; cursor: pointer; ${shadow}" class="routex-marker">
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3.5" fill="#ffffff" stroke="none"></circle>
      </svg>
      ${label ? `<div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); background: #1e293b; color: white; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; white-space: nowrap; pointer-events: none; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${label}</div>` : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-place-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

export function createStartMarkerIcon() {
  const size = 38;
  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; filter: drop-shadow(0 4px 10px rgba(16, 185, 129, 0.45));" class="routex-marker">
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="#10b981" stroke="#ffffff" stroke-width="1.5">
        <circle cx="12" cy="12" r="10" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="#ffffff"/>
      </svg>
      <div style="position: absolute; top: -18px; left: 50%; transform: translateX(-50%); background: #065f46; color: white; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px; letter-spacing: 0.5px;">START</div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-start-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export function createDestinationMarkerIcon() {
  const size = 42;
  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; filter: drop-shadow(0 4px 10px rgba(239, 68, 68, 0.45));" class="routex-marker">
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="#ef4444" stroke="#ffffff" stroke-width="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="#ffffff"/>
      </svg>
      <div style="position: absolute; top: -18px; left: 50%; transform: translateX(-50%); background: #991b1b; color: white; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px; letter-spacing: 0.5px;">DEST</div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-dest-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

export function createWaypointMarkerIcon(index) {
  const size = 32;
  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; filter: drop-shadow(0 4px 8px rgba(245, 158, 11, 0.45));" class="routex-marker">
      <div style="width: ${size}px; height: ${size}px; background: #f59e0b; border: 2.5px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 800;">
        ${index + 1}
      </div>
      <div style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); background: #b45309; color: white; font-size: 8px; font-weight: 700; padding: 0.5px 4px; border-radius: 3px; white-space: nowrap;">STOP ${index + 1}</div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-waypoint-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export function createSimulatorVehicleIcon(heading) {
  const size = 36;
  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: ${size * 1.5}px; height: ${size * 1.5}px; border-radius: 9999px; background: rgba(59, 130, 246, 0.35);" class="animate-ping"></div>
      
      <div style="transform: rotate(${heading}deg); width: ${size}px; height: ${size}px; background: #2563eb; border-radius: 9999px; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.7); display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="#ffffff">
          <polygon points="12 2 19 21 12 17 5 21 12 2"/>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-simulator-vehicle-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function createElevationHoverIcon() {
  const size = 20;
  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      <div style="width: ${size}px; height: ${size}px; border-radius: 9999px; background: #10b981; border: 2.5px solid #ffffff; box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-elevation-hover-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function createClickedPointIcon() {
  const size = 32;
  const html = `
    <div style="width: ${size}px; height: ${size}px; filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.5));" class="routex-marker animate-bounce">
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="#6366f1" stroke="#ffffff" stroke-width="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="#ffffff"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-clicked-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

export function createPoiMarkerIcon(categoryId) {
  const size = 32;
  const colorMap = {
    restaurants: '#f59e0b',
    cafes: '#ea580c',
    hospitals: '#f43f5e',
    pharmacies: '#ef4444',
    gas: '#2563eb',
    atms: '#059669',
    hotels: '#4f46e5',
    groceries: '#16a34a',
    attractions: '#9333ea',
    parks: '#10b981',
  };

  const bg = colorMap[categoryId] || '#64748b';

  const html = `
    <div style="width: ${size}px; height: ${size}px; background-color: ${bg}; border-radius: 9999px; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.25); cursor: pointer;" class="routex-marker">
      <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 9999px;"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-poi-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export function createUserLocationIcon(heading) {
  const size = 24;
  const headingSvg =
    heading !== null && heading !== undefined
      ? `<div style="position: absolute; top: -14px; left: 50%; transform: translateX(-50%) rotate(${heading}deg); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 9px solid #2563eb;"></div>`
      : '';

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: ${size * 1.8}px; height: ${size * 1.8}px; border-radius: 9999px; background: rgba(37, 99, 235, 0.25);" class="animate-ping-slow"></div>
      <div style="width: ${size}px; height: ${size}px; border-radius: 9999px; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.6); position: relative; z-index: 2;"></div>
      ${headingSvg}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-user-location-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
