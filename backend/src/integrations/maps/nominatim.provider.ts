import axios from 'axios';
import { StandardPlace } from '../../types';
import { logger } from '../../utils/logger';
import { env } from '../../config/env';

const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 800; // Nominatim 1 req/sec policy

async function throttle() {
  const now = Date.now();
  const diff = now - lastRequestTime;
  if (diff < MIN_INTERVAL_MS) {
    await new Promise((res) => setTimeout(res, MIN_INTERVAL_MS - diff));
  }
  lastRequestTime = Date.now();
}

export class NominatimProvider {
  private baseUrl = 'https://nominatim.openstreetmap.org';
  private userAgent = 'RouteX-Navigation-Backend/1.0 (https://route-x-beta.vercel.app)';

  public async searchPlaces(
    query: string,
    options: { limit?: number; viewbox?: string } = {}
  ): Promise<StandardPlace[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return [];

    const cacheKey = `search_${trimmed.toLowerCase()}_${options.limit || 10}_${options.viewbox || ''}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    await throttle();

    try {
      const params: Record<string, any> = {
        q: trimmed,
        format: 'jsonv2',
        addressdetails: 1,
        extratags: 1,
        namedetails: 1,
        limit: options.limit || 10,
      };

      if (options.viewbox) {
        params.viewbox = options.viewbox;
      }

      if (env.GEOCODING_API_KEY) {
        params.key = env.GEOCODING_API_KEY;
      }

      const response = await axios.get(`${this.baseUrl}/search`, {
        params,
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 8000,
      });

      if (!Array.isArray(response.data)) return [];

      const places = response.data.map((item: any) => this.formatResult(item));
      cache.set(cacheKey, { data: places, expiry: Date.now() + CACHE_TTL_MS });
      return places;
    } catch (err: any) {
      logger.error({ err: err.message }, 'Nominatim searchPlaces failed');
      throw new Error('Geocoding search provider error');
    }
  }

  public async reverseGeocode(lat: number, lng: number): Promise<StandardPlace | null> {
    const roundedLat = Number(lat.toFixed(5));
    const roundedLng = Number(lng.toFixed(5));
    const cacheKey = `reverse_${roundedLat}_${roundedLng}`;

    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    await throttle();

    try {
      const params: Record<string, any> = {
        lat: roundedLat,
        lon: roundedLng,
        format: 'jsonv2',
        addressdetails: 1,
        extratags: 1,
        namedetails: 1,
        zoom: 18,
      };

      if (env.GEOCODING_API_KEY) {
        params.key = env.GEOCODING_API_KEY;
      }

      const response = await axios.get(`${this.baseUrl}/reverse`, {
        params,
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 8000,
      });

      if (!response.data || response.data.error) return null;

      const place = this.formatResult(response.data);
      cache.set(cacheKey, { data: place, expiry: Date.now() + CACHE_TTL_MS });
      return place;
    } catch (err: any) {
      logger.error({ err: err.message }, 'Nominatim reverseGeocode failed');
      return null;
    }
  }

  public async getPlaceDetails(osmType: string, osmId: string): Promise<StandardPlace | null> {
    const prefix = osmType.charAt(0).toUpperCase(); // N, W, R
    const osmKey = `${prefix}${osmId}`;
    const cacheKey = `lookup_${osmKey}`;

    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    await throttle();

    try {
      const response = await axios.get(`${this.baseUrl}/lookup`, {
        params: {
          osm_ids: osmKey,
          format: 'jsonv2',
          addressdetails: 1,
          extratags: 1,
          namedetails: 1,
        },
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 8000,
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        const place = this.formatResult(response.data[0]);
        cache.set(cacheKey, { data: place, expiry: Date.now() + CACHE_TTL_MS });
        return place;
      }
      return null;
    } catch (err: any) {
      logger.error({ err: err.message }, 'Nominatim getPlaceDetails failed');
      return null;
    }
  }

  private formatResult(item: any): StandardPlace {
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

    let boundingBox: [number, number, number, number] | undefined = undefined;
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
}
