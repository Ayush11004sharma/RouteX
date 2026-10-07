import { Response, NextFunction } from 'express';
import { SavedPlacesService } from '../services/savedPlaces.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class SavedPlacesController {
  private savedPlacesService = new SavedPlacesService();

  public list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const list = await this.savedPlacesService.listSavedPlaces(userId);
      ApiResponse.success(res, list);
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const place = await this.savedPlacesService.getSavedPlace(userId, id);
      ApiResponse.success(res, place);
    } catch (err) {
      next(err);
    }
  };

  public create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const created = await this.savedPlacesService.createSavedPlace(userId, req.body);
      ApiResponse.success(res, created, 201, 'Place saved successfully');
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const updated = await this.savedPlacesService.updateSavedPlace(userId, id, req.body);
      ApiResponse.success(res, updated, 200, 'Saved place updated');
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await this.savedPlacesService.deleteSavedPlace(userId, id);
      ApiResponse.success(res, { success: true }, 200, 'Saved place deleted');
    } catch (err) {
      next(err);
    }
  };

  public sync = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { places } = req.body;
      const list = await this.savedPlacesService.bulkSync(userId, places);
      ApiResponse.success(res, list, 200, 'Saved places synchronized');
    } catch (err) {
      next(err);
    }
  };
}
