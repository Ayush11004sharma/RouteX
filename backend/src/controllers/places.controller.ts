import { Request, Response, NextFunction } from 'express';
import { PlacesService } from '../services/places.service';
import { ApiResponse } from '../utils/apiResponse';

export class PlacesController {
  private placesService = new PlacesService();

  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { q, limit, viewbox } = req.query as any;
      const results = await this.placesService.search(q, { limit, viewbox });
      ApiResponse.success(res, results);
    } catch (err) {
      next(err);
    }
  };

  public geocode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { address, limit } = req.query as any;
      const results = await this.placesService.geocode(address, limit);
      ApiResponse.success(res, results);
    } catch (err) {
      next(err);
    }
  };

  public reverseGeocode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lat, lng } = req.query as any;
      const result = await this.placesService.reverseGeocode(lat, lng);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  };

  public getDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { placeId } = req.params;
      const parts = placeId.split('_');
      const osmType = parts.length > 1 ? parts[0] : 'N';
      const osmId = parts.length > 1 ? parts.slice(1).join('_') : placeId;

      const place = await this.placesService.getDetails(osmType, osmId);
      if (!place) {
        ApiResponse.error(res, 'Place not found', 404, 'PLACE_NOT_FOUND');
        return;
      }
      ApiResponse.success(res, place);
    } catch (err) {
      next(err);
    }
  };

  public nearby = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lat, lng, category, radius } = req.query as any;
      const results = await this.placesService.searchNearby(lat, lng, category, radius);
      ApiResponse.success(res, results);
    } catch (err) {
      next(err);
    }
  };
}
