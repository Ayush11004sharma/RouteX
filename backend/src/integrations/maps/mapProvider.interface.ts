import { Coordinate, RouteResult, StandardPlace, TravelMode } from '../../types';

export interface IMapProvider {
  searchPlaces(
    query: string,
    options?: { limit?: number; viewbox?: string }
  ): Promise<StandardPlace[]>;

  reverseGeocode(lat: number, lng: number): Promise<StandardPlace | null>;

  getPlaceDetails(osmType: string, osmId: string): Promise<StandardPlace | null>;

  calculateRoute(
    points: Coordinate[],
    mode: TravelMode
  ): Promise<RouteResult>;

  searchNearby(
    lat: number,
    lng: number,
    category: string,
    radiusMeters?: number
  ): Promise<StandardPlace[]>;
}
