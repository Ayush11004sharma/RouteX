import { Router } from 'express';
import { RoutesController } from '../controllers/routes.controller';
import { FavoritesController } from '../controllers/favorites.controller';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import {
  calculateRouteSchema,
  elevationQuerySchema,
  createFavoriteRouteSchema,
} from '../validators/routes.validator';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const routesController = new RoutesController();
const favoritesController = new FavoritesController();

// Route Calculation & Elevation
router.post('/', validateBody(calculateRouteSchema), routesController.calculate);
router.get('/elevation', validateQuery(elevationQuerySchema), routesController.elevation);

// Authenticated Favorite Routes
router.get('/favorites', requireAuth, favoritesController.list);
router.post('/favorites', requireAuth, validateBody(createFavoriteRouteSchema), favoritesController.create);
router.get('/favorites/:id', requireAuth, favoritesController.getById);
router.delete('/favorites/:id', requireAuth, favoritesController.delete);

export default router;
