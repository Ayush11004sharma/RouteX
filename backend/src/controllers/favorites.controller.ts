import { Response, NextFunction } from 'express';
import { FavoritesService } from '../services/favorites.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class FavoritesController {
  private favoritesService = new FavoritesService();

  public list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const routes = await this.favoritesService.listFavorites(userId);
      ApiResponse.success(res, routes);
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const route = await this.favoritesService.getFavorite(userId, id);
      ApiResponse.success(res, route);
    } catch (err) {
      next(err);
    }
  };

  public create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const created = await this.favoritesService.addFavorite(userId, req.body);
      ApiResponse.success(res, created, 201, 'Route saved to favorites');
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await this.favoritesService.deleteFavorite(userId, id);
      ApiResponse.success(res, { success: true }, 200, 'Favorite route deleted');
    } catch (err) {
      next(err);
    }
  };
}
