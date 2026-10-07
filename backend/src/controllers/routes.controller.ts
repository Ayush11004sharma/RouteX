import { Request, Response, NextFunction } from 'express';
import { RoutingService } from '../services/routing.service';
import { ElevationService } from '../services/elevation.service';
import { WeatherService } from '../services/weather.service';
import { ApiResponse } from '../utils/apiResponse';

export class RoutesController {
  private routingService = new RoutingService();
  private elevationService = new ElevationService();
  private weatherService = new WeatherService();

  public calculate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { origin, destination, waypoints, mode } = req.body;
      const result = await this.routingService.calculateRoute(origin, destination, waypoints, mode);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  };

  public elevation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { coordinates, samples } = req.query as any;
      const pairs: [number, number][] = coordinates
        .split(';')
        .map((p: string) => {
          const parts = p.split(',').map((n) => parseFloat(n.trim()));
          return [parts[0], parts[1]] as [number, number];
        })
        .filter((c: [number, number]) => !isNaN(c[0]) && !isNaN(c[1]));

      const profile = await this.elevationService.getRouteElevation(pairs, samples || 40);
      ApiResponse.success(res, profile);
    } catch (err) {
      next(err);
    }
  };

  public weather = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lat, lng } = req.query as any;
      const weather = await this.weatherService.getWeather(lat, lng);
      ApiResponse.success(res, weather);
    } catch (err) {
      next(err);
    }
  };
}
