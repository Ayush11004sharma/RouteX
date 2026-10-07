import { Router } from 'express';
import { PlacesController } from '../controllers/places.controller';
import { SavedPlacesController } from '../controllers/savedPlaces.controller';
import { validateQuery, validateBody } from '../middleware/validate.middleware';
import {
  searchPlacesSchema,
  geocodeSchema,
  reverseGeocodeSchema,
  nearbyPlacesSchema,
  createSavedPlaceSchema,
  updateSavedPlaceSchema,
} from '../validators/places.validator';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const placesController = new PlacesController();
const savedController = new SavedPlacesController();

// Public Map Discovery Endpoints
router.get('/search', validateQuery(searchPlacesSchema), placesController.search);
router.get('/geocode', validateQuery(geocodeSchema), placesController.geocode);
router.get('/reverse-geocode', validateQuery(reverseGeocodeSchema), placesController.reverseGeocode);
router.get('/nearby', validateQuery(nearbyPlacesSchema), placesController.nearby);
router.get('/details/:placeId', placesController.getDetails);

// Authenticated Saved Places Endpoints
router.get('/saved', requireAuth, savedController.list);
router.post('/saved', requireAuth, validateBody(createSavedPlaceSchema), savedController.create);
router.post('/saved/sync', requireAuth, savedController.sync);
router.get('/saved/:id', requireAuth, savedController.getById);
router.put('/saved/:id', requireAuth, validateBody(updateSavedPlaceSchema), savedController.update);
router.delete('/saved/:id', requireAuth, savedController.delete);

export default router;
