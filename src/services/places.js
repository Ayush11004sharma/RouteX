import { NEARBY_CATEGORIES } from '../constants';

const placesCache = new Map();

/**
 * Searches real POIs nearby given coordinates using Overpass API with Nominatim fallback.
 */
export async function searchNearby(lat, lng, categoryId, radiusMeters = 3000, signal) {
  const cacheKey = `${Number(lat).toFixed(3)},${Number(lng).toFixed(3)}_${categoryId}_${radiusMeters}`;
  if (placesCache.has(cacheKey)) {
    return placesCache.get(cacheKey);
  }

  const category = NEARBY_CATEGORIES.find((c) => c.id === categoryId);
  const queryTerm = category ? category.query : categoryId;

  try {
    if (category?.osmFilter) {
      const { key, values } = category.osmFilter;
      const filters = values
        .map(
          (val) =>
            `node["${key}"="${val}"](around:${radiusMeters},${lat},${lng});way["${key}"="${val}"](around:${radiusMeters},${lat},${lng});`
        )
        .join('');
      const overpassQuery = `[out:json][timeout:12];(${filters});out center 30;`;

      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
      const response = await fetch(overpassUrl, { signal });

      if (response.ok) {
        const data = await response.json();
        if (data.elements && data.elements.length > 0) {
          const results = data.elements
            .filter((el) => el.tags && (el.tags.name || el.tags['name:en']))
            .slice(0, 30)
            .map((el) => formatOverpassElement(el, categoryId));

          if (results.length > 0) {
            placesCache.set(cacheKey, results);
            return results;
          }
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn('Overpass POI query failed, falling back to Nominatim POI search:', err);
  }

  // Fallback: Nominatim bounded search
  try {
    const delta = (radiusMeters / 111320) * 1.2;
    const viewbox = [
      (lng - delta).toFixed(5),
      (lat + delta).toFixed(5),
      (lng + delta).toFixed(5),
      (lat - delta).toFixed(5),
    ].join(',');

    const nomUrl = new URL('https://nominatim.openstreetmap.org/search');
    nomUrl.searchParams.set('q', queryTerm);
    nomUrl.searchParams.set('format', 'jsonv2');
    nomUrl.searchParams.set('viewbox', viewbox);
    nomUrl.searchParams.set('bounded', '1');
    nomUrl.searchParams.set('addressdetails', '1');
    nomUrl.searchParams.set('extratags', '1');
    nomUrl.searchParams.set('limit', '25');

    const nomRes = await fetch(nomUrl.toString(), {
      signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (nomRes.ok) {
      const data = await nomRes.json();
      if (Array.isArray(data)) {
        const results = data.map((item) => {
          const addr = item.address || {};
          const tags = item.extratags || {};
          return {
            id: `poi_${item.osm_type || 'node'}_${item.osm_id || Math.random().toString(36).substring(7)}`,
            osmId: item.osm_id ? String(item.osm_id) : undefined,
            osmType: item.osm_type,
            name: item.namedetails?.name || item.name || item.display_name?.split(',')[0] || 'Nearby Location',
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            category: item.category || categoryId,
            type: item.type,
            address: {
              road: addr.road,
              suburb: addr.suburb,
              city: addr.city || addr.town || addr.village,
              state: addr.state,
              country: addr.country,
              formattedAddress: item.display_name,
            },
            extratags: {
              website: tags.website || tags['contact:website'],
              phone: tags.phone || tags['contact:phone'],
              opening_hours: tags.opening_hours,
              cuisine: tags.cuisine,
              brand: tags.brand,
              wheelchair: tags.wheelchair,
              stars: tags.stars,
            },
          };
        });

        placesCache.set(cacheKey, results);
        return results;
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.error('Nominatim nearby search failed:', err);
  }

  return [];
}

function formatOverpassElement(el, categoryId) {
  const tags = el.tags || {};
  const lat = el.lat !== undefined ? el.lat : el.center?.lat;
  const lng = el.lon !== undefined ? el.lon : el.center?.lon;

  const name = tags.name || tags['name:en'] || tags.operator || tags.brand || 'Nearby Place';
  const street = tags['addr:street'] ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim() : undefined;
  const city = tags['addr:city'] || tags['addr:suburb'];
  const postcode = tags['addr:postcode'];

  const addressParts = [street, city, tags['addr:country']].filter(Boolean);
  const formattedAddress =
    addressParts.length > 0 ? addressParts.join(', ') : `${name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

  return {
    id: `overpass_${el.type}_${el.id}`,
    osmId: String(el.id),
    osmType: el.type,
    name,
    displayName: formattedAddress,
    lat,
    lng,
    category: categoryId,
    type: tags.amenity || tags.tourism || tags.shop || tags.leisure || 'poi',
    address: {
      road: street,
      city,
      postcode,
      country: tags['addr:country'],
      formattedAddress,
    },
    extratags: {
      website: tags.website || tags['contact:website'] || tags.url,
      phone: tags.phone || tags['contact:phone'],
      opening_hours: tags.opening_hours,
      cuisine: tags.cuisine,
      brand: tags.brand,
      wheelchair: tags.wheelchair,
      operator: tags.operator,
      wikidata: tags.wikidata,
      wikipedia: tags.wikipedia,
    },
  };
}
