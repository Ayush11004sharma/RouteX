import { api } from './api';

const searchCache = new Map();
const reverseCache = new Map();

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 800; // Nominatim policy

async function throttleRequest() {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - timeSinceLast));
  }
  lastRequestTime = Date.now();
}

/**
 * Searches places worldwide via RouteX Backend API with Nominatim fallback.
 */
export async function searchLocations(query, options = {}) {
  const trimmed = String(query || '').trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  const cacheKey = `${trimmed.toLowerCase()}_${options.limit || 8}_${options.viewbox?.join(',') || ''}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  // 1. Try RouteX Backend API
  try {
    const results = await api.places.search(trimmed, options.limit || 8, options.signal);
    if (Array.isArray(results) && results.length > 0) {
      searchCache.set(cacheKey, results);
      return results;
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn('Backend search API failed or unavailable, using direct fallback:', err.message);
  }

  // 2. Direct Nominatim Fallback
  await throttleRequest();

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', trimmed);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('extratags', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('limit', String(options.limit || 8));

  if (options.viewbox) {
    url.searchParams.set('viewbox', options.viewbox.join(','));
  }

  try {
    const response = await fetch(url.toString(), {
      signal: options.signal,
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Search rate limit reached. Please wait a moment.');
      }
      throw new Error(`Geocoding error (${response.status})`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    const places = data.map((item) => formatNominatimResult(item));
    searchCache.set(cacheKey, places);
    return places;
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.error('Geocoding search failed:', error);
    throw error;
  }
}

/**
 * Reverse geocodes coordinates to a human-readable place via Backend API with direct fallback.
 */
export async function reverseGeocode(lat, lng, options = {}) {
  const roundedLat = Number(Number(lat).toFixed(5));
  const roundedLng = Number(Number(lng).toFixed(5));
  const cacheKey = `${roundedLat},${roundedLng}`;

  if (reverseCache.has(cacheKey)) {
    return reverseCache.get(cacheKey);
  }

  // 1. Try RouteX Backend API
  try {
    const result = await api.places.reverseGeocode(roundedLat, roundedLng, options.signal);
    if (result) {
      reverseCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn('Backend reverseGeocode API failed, using fallback:', err.message);
  }

  // 2. Direct Nominatim Fallback
  await throttleRequest();

  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(roundedLat));
  url.searchParams.set('lon', String(roundedLng));
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('extratags', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('zoom', '18');

  try {
    const response = await fetch(url.toString(), {
      signal: options.signal,
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      return null;
    }

    const item = await response.json();
    if (!item || item.error) return null;

    const place = formatNominatimResult(item);
    reverseCache.set(cacheKey, place);
    return place;
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.error('Reverse geocoding fallback failed:', error);
    return null;
  }
}

function formatNominatimResult(item) {
  const addr = item.address || {};
  const extratags = item.extratags || {};

  const name =
    item.namedetails?.name ||
    item.name ||
    addr.amenity ||
    addr.shop ||
    addr.tourism ||
    addr.leisure ||
    addr.building ||
    addr.road ||
    addr.suburb ||
    addr.city ||
    addr.town ||
    item.display_name?.split(',')[0] ||
    'Selected Location';

  let boundingBox = undefined;
  if (Array.isArray(item.boundingbox) && item.boundingbox.length === 4) {
    boundingBox = [
      parseFloat(item.boundingbox[0]),
      parseFloat(item.boundingbox[1]),
      parseFloat(item.boundingbox[2]),
      parseFloat(item.boundingbox[3]),
    ];
  }

  return {
    id: `${item.osm_type || 'node'}_${item.osm_id || Math.random().toString(36).substring(7)}`,
    osmId: item.osm_id ? String(item.osm_id) : undefined,
    osmType: item.osm_type,
    name: name.trim(),
    displayName: item.display_name || name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    category: item.category || item.class || 'place',
    type: item.type || 'location',
    importance: item.importance,
    address: {
      road: addr.road || addr.pedestrian || addr.street,
      neighbourhood: addr.neighbourhood,
      suburb: addr.suburb,
      city: addr.city || addr.town || addr.village || addr.municipality,
      town: addr.town,
      village: addr.village,
      state: addr.state || addr.province || addr.region,
      postcode: addr.postcode,
      country: addr.country,
      countryCode: addr.country_code,
      formattedAddress: item.display_name,
    },
    extratags: {
      website: extratags.website || extratags['contact:website'] || extratags.url,
      phone: extratags.phone || extratags['contact:phone'],
      opening_hours: extratags.opening_hours,
      wheelchair: extratags.wheelchair,
      cuisine: extratags.cuisine,
      brand: extratags.brand,
      operator: extratags.operator,
      stars: extratags.stars,
      smoking: extratags.smoking,
      internet_access: extratags.internet_access,
      wikidata: extratags.wikidata,
      wikipedia: extratags.wikipedia,
    },
    boundingBox,
  };
}
