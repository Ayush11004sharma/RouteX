import { Router } from 'express';
import { HistoryController } from '../controllers/history.controller';
import { validateBody } from '../middleware/validate.middleware';
import { createSearchHistorySchema } from '../validators/places.validator';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const controller = new HistoryController();

router.get('/history', requireAuth, controller.list);
router.post('/history', requireAuth, validateBody(createSearchHistorySchema), controller.add);
router.delete('/history/:id', requireAuth, controller.deleteItem);
router.delete('/history', requireAuth, controller.clear);

export default router;
