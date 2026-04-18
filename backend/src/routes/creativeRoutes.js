import express from 'express';
import { 
  createWork, 
  getWorks, 
  getWorkById, 
  likeWork, 
  addComment,
  deleteMyWork,
  getUserDeletedWorks,
  restoreWork
} from '../controllers/creativeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getWorks);
router.get('/:id', getWorkById);
router.post('/', protect, createWork);
router.post('/:id/like', protect, likeWork);
router.post('/:id/comment', protect, addComment);

// Content management
router.delete('/my-work/:id', protect, deleteMyWork);
router.get('/my/deleted', protect, getUserDeletedWorks);
router.post('/restore/:id', protect, restoreWork);

export default router;
