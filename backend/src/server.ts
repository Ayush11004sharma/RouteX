import app from './app';
import { env } from './config/env';
import { connectDatabase, prisma } from './config/database';
import { logger } from './utils/logger';

async function bootstrap() {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 RouteX Backend Server running on http://localhost:${env.PORT}`);
      logger.info(`📚 Swagger Documentation available at http://localhost:${env.PORT}/api/docs`);
      logger.info(`🌐 Environment: ${env.NODE_ENV}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await prisma.$disconnect();
        logger.info('Database disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error({ err }, 'Fatal error during server startup');
    process.exit(1);
  }
}

bootstrap();
