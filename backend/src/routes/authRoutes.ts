import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);

export default router;