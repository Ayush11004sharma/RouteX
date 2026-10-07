import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { logger } from './utils/logger';
import apiRouter from './routes';
import { generalRateLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/error.middleware';
import { swaggerDocument } from './docs/swagger';
import { ApiResponse } from './utils/apiResponse';

const app = express();

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI and frontend integration
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      // In dev or production, allow the configured client url or localhost
      if (
        origin === env.CLIENT_URL ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow during testing
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(pinoHttp({ logger }));
}

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply Rate Limiting
app.use('/api', generalRateLimiter);

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount Primary API Router
app.use('/api', apiRouter);

// Root landing redirect to /api/docs
app.get('/', (_req: Request, res: Response) => {
  res.redirect('/api/docs');
});

// 404 Route Handler
app.use((_req: Request, res: Response) => {
  ApiResponse.error(res, 'The requested API route does not exist.', 404, 'NOT_FOUND');
});

// Central Error Handler
app.use(errorHandler);

export default app;
