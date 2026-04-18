import express from 'express';
import { submitVerification } from '../controllers/verificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadVerification } from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.post('/', protect, uploadVerification.single('document'), submitVerification);
export default router;
