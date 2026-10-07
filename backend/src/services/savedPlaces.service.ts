import { prisma } from '../config/database';
import { AppError } from '../utils/apiResponse';

export class SavedPlacesService {
  public async listSavedPlaces(userId: string) {
    return prisma.savedPlace.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getSavedPlace(userId: string, id: string) {
    const place = await prisma.savedPlace.findFirst({
      where: { id, userId },
    });
    if (!place) {
      throw new AppError('Saved place not found.', 404, 'NOT_FOUND');
    }
    return place;
  }

  public async createSavedPlace(userId: string, data: any) {
    // If place with same coordinates or placeId exists for user, update it
    if (data.placeId) {
      const existing = await prisma.savedPlace.findFirst({
        where: { userId, placeId: data.placeId },
      });
      if (existing) {
        return prisma.savedPlace.update({
          where: { id: existing.id },
          data: {
            name: data.name,
            address: data.address,
            category: data.category || existing.category,
            customLabel: data.customLabel || existing.customLabel,
            placeData: data.placeData || existing.placeData,
          },
        });
      }
    }

    return prisma.savedPlace.create({
      data: {
        userId,
        placeId: data.placeId,
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        category: data.category || 'favorite',
        customLabel: data.customLabel,
        placeData: data.placeData,
      },
    });
  }

  public async updateSavedPlace(userId: string, id: string, data: any) {
    const existing = await prisma.savedPlace.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new AppError('Saved place not found.', 404, 'NOT_FOUND');
    }

    return prisma.savedPlace.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.category && { category: data.category }),
        ...(data.customLabel !== undefined && { customLabel: data.customLabel }),
      },
    });
  }

  public async deleteSavedPlace(userId: string, id: string) {
    const existing = await prisma.savedPlace.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new AppError('Saved place not found.', 404, 'NOT_FOUND');
    }

    await prisma.savedPlace.delete({ where: { id } });
    return { success: true };
  }

  public async bulkSync(userId: string, places: any[]) {
    if (!Array.isArray(places) || places.length === 0) return this.listSavedPlaces(userId);

    for (const p of places) {
      const place = p.place || p;
      if (!place || !place.lat || !place.lng) continue;

      const placeId = place.id || place.osmId;
      const existing = await prisma.savedPlace.findFirst({
        where: {
          userId,
          OR: [
            ...(placeId ? [{ placeId }] : []),
            {
              latitude: place.lat,
              longitude: place.lng,
            },
          ],
        },
      });

      if (!existing) {
        await prisma.savedPlace.create({
          data: {
            userId,
            placeId,
            name: place.name || 'Saved Place',
            address: place.displayName || place.address?.formattedAddress || '',
            latitude: place.lat,
            longitude: place.lng,
            category: p.category || 'favorite',
            customLabel: p.customLabel || p.label,
            placeData: place,
          },
        });
      }
    }

    return this.listSavedPlaces(userId);
  }
}
