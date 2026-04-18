import express from 'express';
import { getAuthorEarnings } from '../controllers/earningsController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', protect, authorize('author'), getAuthorEarnings);
export default router;
