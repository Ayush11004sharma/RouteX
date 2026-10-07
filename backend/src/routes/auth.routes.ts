import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';
import { requireAuth } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();
const controller = new AuthController();

router.post('/register', authRateLimiter, validateBody(registerSchema), controller.register);
router.post('/login', authRateLimiter, validateBody(loginSchema), controller.login);
router.post('/refresh', validateBody(refreshTokenSchema), controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', requireAuth, controller.getMe);

export default router;
