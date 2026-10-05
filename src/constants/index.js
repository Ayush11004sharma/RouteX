export const APP_NAME = 'RouteX';
export const APP_TAGLINE = 'Global Navigation & Exploration';

export const MAP_LAYERS = {
  osm: {
    name: 'Default (OSM)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  voyager: {
    name: 'Clean Street (Carto)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  dark: {
    name: 'Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  satellite: {
    name: 'Satellite (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  terrain: {
    name: 'Topographic',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
  },
};

export const DEFAULT_MAP_CENTER = [28.6139, 77.2090]; // New Delhi default
export const DEFAULT_MAP_ZOOM = 13;

export const TRAVEL_MODES = [
  { mode: 'driving', label: 'Driving', icon: 'Car', osrmProfile: 'driving', speedKmh: 45 },
  { mode: 'cycling', label: 'Cycling', icon: 'Bike', osrmProfile: 'bike', speedKmh: 15 },
  { mode: 'walking', label: 'Walking', icon: 'Footprints', osrmProfile: 'foot', speedKmh: 5 },
];

export const NEARBY_CATEGORIES = [
  {
    id: 'restaurants',
    name: 'Restaurants',
    icon: 'Utensils',
    query: 'restaurant',
    color: 'bg-amber-500 text-white',
    osmFilter: { key: 'amenity', values: ['restaurant', 'food_court'] },
  },
  {
    id: 'cafes',
    name: 'Cafes',
    icon: 'Coffee',
    query: 'cafe',
    color: 'bg-orange-500 text-white',
    osmFilter: { key: 'amenity', values: ['cafe', 'coffee_shop'] },
  },
  {
    id: 'hospitals',
    name: 'Hospitals',
    icon: 'Hospital',
    query: 'hospital',
    color: 'bg-rose-500 text-white',
    osmFilter: { key: 'amenity', values: ['hospital', 'clinic'] },
  },
  {
    id: 'pharmacies',
    name: 'Pharmacies',
    icon: 'Pill',
    query: 'pharmacy',
    color: 'bg-red-500 text-white',
    osmFilter: { key: 'amenity', values: ['pharmacy'] },
  },
  {
    id: 'gas',
    name: 'Petrol Stations',
    icon: 'Fuel',
    query: 'petrol station fuel',
    color: 'bg-blue-600 text-white',
    osmFilter: { key: 'amenity', values: ['fuel'] },
  },
  {
    id: 'atms',
    name: 'ATMs & Banks',
    icon: 'CreditCard',
    query: 'atm bank',
    color: 'bg-emerald-600 text-white',
    osmFilter: { key: 'amenity', values: ['atm', 'bank'] },
  },
  {
    id: 'hotels',
    name: 'Hotels',
    icon: 'Hotel',
    query: 'hotel',
    color: 'bg-indigo-600 text-white',
    osmFilter: { key: 'tourism', values: ['hotel', 'motel', 'guest_house'] },
  },
  {
    id: 'groceries',
    name: 'Supermarkets',
    icon: 'ShoppingCart',
    query: 'supermarket grocery',
    color: 'bg-green-600 text-white',
    osmFilter: { key: 'shop', values: ['supermarket', 'convenience', 'grocery'] },
  },
  {
    id: 'attractions',
    name: 'Attractions',
    icon: 'Compass',
    query: 'tourist attraction museum',
    color: 'bg-purple-600 text-white',
    osmFilter: { key: 'tourism', values: ['attraction', 'museum', 'viewpoint', 'theme_park'] },
  },
  {
    id: 'parks',
    name: 'Parks',
    icon: 'Trees',
    query: 'park garden',
    color: 'bg-emerald-500 text-white',
    osmFilter: { key: 'leisure', values: ['park', 'garden'] },
  },
];

export const STORAGE_KEYS = {
  SAVED_PLACES: 'routex_saved_places',
  RECENT_SEARCHES: 'routex_recent_searches',
  SETTINGS: 'routex_user_settings',
  LOCATION_HISTORY: 'routex_location_history',
};

export const DEFAULT_USER_SETTINGS = {
  theme: 'system',
  distanceUnit: 'km',
  defaultTravelMode: 'driving',
  enableLocationHistory: false,
  tileLayer: 'osm',
  voiceGuidance: true,
  speechRate: 1.0,
};
