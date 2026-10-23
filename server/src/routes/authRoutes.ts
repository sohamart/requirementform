import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { validateBody } from '../middleware/validation.js';
import { RegisterSchema, LoginSchema } from '@shared/schemas/index.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', authLimiter, validateBody(RegisterSchema), AuthController.register);
router.post('/login', authLimiter, validateBody(LoginSchema), AuthController.login);
router.post('/logout', requireAuth, AuthController.logout);
router.post('/logout-all', requireAuth, AuthController.logoutEverywhere);
router.get('/me', requireAuth, AuthController.getMe);

export default router;
