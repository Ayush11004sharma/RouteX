import { prisma } from '../config/database';
import { AppError } from '../utils/apiResponse';

export class HistoryService {
  public async listHistory(userId: string) {
    return prisma.recentSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  public async addHistory(userId: string, data: any) {
    // Deduplicate by placeId or placeName
    if (data.placeId) {
      await prisma.recentSearch.deleteMany({
        where: { userId, placeId: data.placeId },
      });
    } else {
      await prisma.recentSearch.deleteMany({
        where: {
          userId,
          placeName: data.placeName,
          latitude: data.latitude,
          longitude: data.longitude,
        },
      });
    }

    const created = await prisma.recentSearch.create({
      data: {
        userId,
        query: data.query,
        placeId: data.placeId,
        placeName: data.placeName,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        placeData: data.placeData,
      },
    });

    // Enforce 20 max records by deleting older ones
    const all = await prisma.recentSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (all.length > 20) {
      const toDelete = all.slice(20).map((i) => i.id);
      await prisma.recentSearch.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    return created;
  }

  public async deleteHistoryItem(userId: string, id: string) {
    const existing = await prisma.recentSearch.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new AppError('History item not found.', 404, 'NOT_FOUND');
    }

    await prisma.recentSearch.delete({ where: { id } });
    return { success: true };
  }

  public async clearHistory(userId: string) {
    await prisma.recentSearch.deleteMany({ where: { userId } });
    return { success: true };
  }
}
