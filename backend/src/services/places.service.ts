import { NominatimProvider } from '../integrations/maps/nominatim.provider';
import { OverpassProvider } from '../integrations/maps/overpass.provider';
import { StandardPlace } from '../types';

export class PlacesService {
  private nominatim = new NominatimProvider();
  private overpass = new OverpassProvider();

  public async search(
    query: string,
    options?: { limit?: number; viewbox?: string }
  ): Promise<StandardPlace[]> {
    return this.nominatim.searchPlaces(query, options);
  }

  public async geocode(address: string, limit = 5): Promise<StandardPlace[]> {
    return this.nominatim.searchPlaces(address, { limit });
  }

  public async reverseGeocode(lat: number, lng: number): Promise<StandardPlace | null> {
    return this.nominatim.reverseGeocode(lat, lng);
  }

  public async getDetails(osmType: string, osmId: string): Promise<StandardPlace | null> {
    return this.nominatim.getPlaceDetails(osmType, osmId);
  }

  public async searchNearby(
    lat: number,
    lng: number,
    category: string,
    radiusMeters = 3500
  ): Promise<StandardPlace[]> {
    return this.overpass.searchNearby(lat, lng, category, radiusMeters);
  }
}
