import express from 'express';
import { 
  createContactMessage, 
  getContactMessages, 
  markAsRead, 
  deleteContactMessage 
} from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createContactMessage);
router.get('/', protect, authorize('admin'), getContactMessages);
router.put('/:id/read', protect, authorize('admin'), markAsRead);
router.delete('/:id', protect, authorize('admin'), deleteContactMessage);

export default router;
