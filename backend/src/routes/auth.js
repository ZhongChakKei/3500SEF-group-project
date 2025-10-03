import express from 'express';
import { login, register, getProfile, refreshToken } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes (require authentication)
router.get('/profile', authenticate, getProfile);
router.post('/refresh', authenticate, refreshToken);

export default router;