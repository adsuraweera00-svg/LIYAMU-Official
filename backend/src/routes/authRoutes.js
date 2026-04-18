import express from 'express';
import { login, me, register, socialLogin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/social-login', socialLogin);
router.get('/me', protect, me);
export default router;
