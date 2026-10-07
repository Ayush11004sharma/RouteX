import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding RouteX database...');

  const passwordHash = await bcrypt.hash('RouteX@2026', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@routex.app' },
    update: {},
    create: {
      name: 'Demo Explorer',
      email: 'demo@routex.app',
      passwordHash,
      role: 'USER',
      savedPlaces: {
        create: [
          {
            name: 'India Gate',
            address: 'Rajpath, India Gate, New Delhi, Delhi, India',
            latitude: 28.6129,
            longitude: 77.2295,
            category: 'favorite',
            customLabel: 'Favorite Monument',
            placeData: {
              category: 'tourism',
              type: 'attraction',
            },
          },
          {
            name: 'Connaught Place',
            address: 'Connaught Place, New Delhi, Delhi, India',
            latitude: 28.6315,
            longitude: 77.2167,
            category: 'work',
            customLabel: 'Central Office Hub',
            placeData: {
              category: 'commercial',
              type: 'business',
            },
          },
        ],
      },
      recentSearches: {
        create: [
          {
            query: 'Connaught Place',
            placeName: 'Connaught Place',
            address: 'Connaught Place, New Delhi, Delhi, India',
            latitude: 28.6315,
            longitude: 77.2167,
          },
          {
            query: 'AIIMS Delhi',
            placeName: 'AIIMS New Delhi',
            address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi, India',
            latitude: 28.5672,
            longitude: 77.2100,
          },
        ],
      },
      favoriteRoutes: {
        create: [
          {
            title: 'CP to India Gate Scenic Drive',
            originName: 'Connaught Place',
            destinationName: 'India Gate',
            originLat: 28.6315,
            originLng: 77.2167,
            destLat: 28.6129,
            destLng: 77.2295,
            travelMode: 'driving',
            distance: 3200,
            duration: 480,
            routeData: {
              summary: 'Via Janpath and Rajpath',
            },
          },
        ],
      },
    },
  });

  console.log('Seed completed successfully! Demo user:', demoUser.email);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
