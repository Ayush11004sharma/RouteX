import { Response, NextFunction } from 'express';
import { HistoryService } from '../services/history.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class HistoryController {
  private historyService = new HistoryService();

  public list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const history = await this.historyService.listHistory(userId);
      ApiResponse.success(res, history);
    } catch (err) {
      next(err);
    }
  };

  public add = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const created = await this.historyService.addHistory(userId, req.body);
      ApiResponse.success(res, created, 201, 'Search added to history');
    } catch (err) {
      next(err);
    }
  };

  public deleteItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await this.historyService.deleteHistoryItem(userId, id);
      ApiResponse.success(res, { success: true }, 200, 'Search removed from history');
    } catch (err) {
      next(err);
    }
  };

  public clear = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      await this.historyService.clearHistory(userId);
      ApiResponse.success(res, { success: true }, 200, 'Search history cleared');
    } catch (err) {
      next(err);
    }
  };
}
