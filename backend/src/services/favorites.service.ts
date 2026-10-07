import { prisma } from '../config/database';
import { AppError } from '../utils/apiResponse';

export class FavoritesService {
  public async listFavorites(userId: string) {
    return prisma.favoriteRoute.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getFavorite(userId: string, id: string) {
    const route = await prisma.favoriteRoute.findFirst({
      where: { id, userId },
    });
    if (!route) {
      throw new AppError('Favorite route not found.', 404, 'NOT_FOUND');
    }
    return route;
  }

  public async addFavorite(userId: string, data: any) {
    return prisma.favoriteRoute.create({
      data: {
        userId,
        title: data.title,
        originName: data.originName,
        destinationName: data.destinationName,
        originLat: data.originLat,
        originLng: data.originLng,
        destLat: data.destLat,
        destLng: data.destLng,
        travelMode: data.travelMode || 'driving',
        distance: data.distance,
        duration: data.duration,
        routeData: data.routeData,
      },
    });
  }

  public async deleteFavorite(userId: string, id: string) {
    const existing = await prisma.favoriteRoute.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new AppError('Favorite route not found.', 404, 'NOT_FOUND');
    }

    await prisma.favoriteRoute.delete({ where: { id } });
    return { success: true };
  }
}
