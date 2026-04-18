import express from 'express';
import {
  createBook,
  getBookById,
  getBooks,
  getMyBooks,
  purchaseBook,
  reviewBook,
  getAuthorStats,
  deleteBook,
} from '../controllers/bookController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

import { uploadBookFiles } from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.get('/', getBooks);
router.get('/mine', protect, getMyBooks);
router.get('/stats', protect, getAuthorStats);
router.get('/:id', protect, getBookById);
router.post(
  '/', 
  protect, 
  uploadBookFiles.fields([
    { name: 'cover', maxCount: 1 }, 
    { name: 'pdf', maxCount: 1 }
  ]), 
  createBook
);
router.post('/:id/purchase', protect, purchaseBook);
router.post('/:id/review', protect, reviewBook);
router.delete('/:id', protect, deleteBook);
export default router;
