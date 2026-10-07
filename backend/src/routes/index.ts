import { Router } from 'express';
import authRoutes from './auth.routes';
import placesRoutes from './places.routes';
import routesRoutes from './routes.routes';
import historyRoutes from './history.routes';
import { RoutesController } from '../controllers/routes.controller';
import { PlacesController } from '../controllers/places.controller';
import { validateQuery } from '../middleware/validate.middleware';
import { weatherQuerySchema } from '../validators/routes.validator';
import { geocodeSchema, reverseGeocodeSchema, nearbyPlacesSchema } from '../validators/places.validator';
import { ApiResponse } from '../utils/apiResponse';

const router = Router();
const routesController = new RoutesController();
const placesController = new PlacesController();

// Health check
router.get('/health', (_req, res) => {
  ApiResponse.success(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'RouteX Backend API',
    version: '1.0.0',
  });
});

// Weather
router.get('/weather', validateQuery(weatherQuerySchema), routesController.weather);

// Top-level geocoding aliases requested in specs
router.get('/geocode', validateQuery(geocodeSchema), placesController.geocode);
router.get('/reverse-geocode', validateQuery(reverseGeocodeSchema), placesController.reverseGeocode);
router.get('/nearby', validateQuery(nearbyPlacesSchema), placesController.nearby);

// Modular Routes
router.use('/auth', authRoutes);
router.use('/places', placesRoutes);
router.use('/routes', routesRoutes);
router.use('/search', historyRoutes);

export default router;
