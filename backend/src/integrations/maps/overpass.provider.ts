import axios from 'axios';
import { StandardPlace } from '../../types';
import { logger } from '../../utils/logger';

const OVERPASS_CATEGORY_FILTERS: Record<string, { key: string; values: string[] }> = {
  restaurants: { key: 'amenity', values: ['restaurant', 'food_court'] },
  cafes: { key: 'amenity', values: ['cafe', 'coffee_shop'] },
  hospitals: { key: 'amenity', values: ['hospital', 'clinic'] },
  pharmacies: { key: 'amenity', values: ['pharmacy'] },
  gas: { key: 'amenity', values: ['fuel'] },
  atms: { key: 'amenity', values: ['atm', 'bank'] },
  hotels: { key: 'tourism', values: ['hotel', 'motel', 'guest_house'] },
  groceries: { key: 'shop', values: ['supermarket', 'convenience', 'grocery'] },
  attractions: { key: 'tourism', values: ['attraction', 'museum', 'viewpoint', 'theme_park'] },
  parks: { key: 'leisure', values: ['park', 'garden'] },
};

export class OverpassProvider {
  private baseUrl = 'https://overpass-api.de/api/interpreter';
  private nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  public async searchNearby(
    lat: number,
    lng: number,
    category: string,
    radiusMeters = 3500
  ): Promise<StandardPlace[]> {
    const filter = OVERPASS_CATEGORY_FILTERS[category] || {
      key: 'amenity',
      values: [category],
    };

    try {
      const filters = filter.values
        .map(
          (val) =>
            `node["${filter.key}"="${val}"](around:${radiusMeters},${lat},${lng});way["${filter.key}"="${val}"](around:${radiusMeters},${lat},${lng});`
        )
        .join('');

      const query = `[out:json][timeout:10];(${filters});out center 30;`;
      const response = await axios.post(
        this.baseUrl,
        `data=${encodeURIComponent(query)}`,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000,
        }
      );

      if (response.data && Array.isArray(response.data.elements) && response.data.elements.length > 0) {
        const places = response.data.elements
          .filter((el: any) => el.tags && (el.tags.name || el.tags['name:en']))
          .slice(0, 30)
          .map((el: any) => this.formatOverpassElement(el, category));

        if (places.length > 0) return places;
      }
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Overpass POI query failed, attempting Nominatim fallback');
    }

    // Fallback: bounded search on Nominatim
    try {
      const delta = (radiusMeters / 111320) * 1.2;
      const viewbox = [
        (lng - delta).toFixed(5),
        (lat + delta).toFixed(5),
        (lng + delta).toFixed(5),
        (lat - delta).toFixed(5),
      ].join(',');

      const res = await axios.get(this.nominatimUrl, {
        params: {
          q: category,
          format: 'jsonv2',
          viewbox,
          bounded: 1,
          addressdetails: 1,
          extratags: 1,
          limit: 25,
        },
        headers: {
          'User-Agent': 'RouteX-Navigation-Backend/1.0',
        },
        timeout: 8000,
      });

      if (Array.isArray(res.data)) {
        return res.data.map((item: any) => {
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
            category: item.category || category,
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
      }
    } catch (err: any) {
      logger.error({ err: err.message }, 'Nominatim nearby search fallback failed');
    }

    return [];
  }

  private formatOverpassElement(el: any, category: string): StandardPlace {
    const tags = el.tags || {};
    const lat = el.lat !== undefined ? el.lat : el.center?.lat;
    const lng = el.lon !== undefined ? el.lon : el.center?.lon;

    const name = tags.name || tags['name:en'] || tags.operator || tags.brand || 'Nearby Place';
    const street = tags['addr:street']
      ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim()
      : undefined;
    const city = tags['addr:city'] || tags['addr:suburb'];
    const postcode = tags['addr:postcode'];

    const addressParts = [street, city, tags['addr:country']].filter(Boolean);
    const formattedAddress =
      addressParts.length > 0
        ? addressParts.join(', ')
        : `${name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

    return {
      id: `overpass_${el.type}_${el.id}`,
      osmId: String(el.id),
      osmType: el.type,
      name,
      displayName: formattedAddress,
      lat,
      lng,
      category,
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
}
