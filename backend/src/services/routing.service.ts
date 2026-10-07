import { OsrmProvider } from '../integrations/maps/osrm.provider';
import { Coordinate, RouteResult, TravelMode } from '../types';

export class RoutingService {
  private osrm = new OsrmProvider();

  public async calculateRoute(
    origin: Coordinate,
    destination: Coordinate,
    waypoints: Coordinate[] = [],
    mode: TravelMode = 'driving'
  ): Promise<RouteResult> {
    const points: Coordinate[] = [origin, ...waypoints, destination];
    return this.osrm.calculateRoute(points, mode);
  }
}
