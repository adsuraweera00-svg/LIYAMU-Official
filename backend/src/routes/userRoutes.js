import express from 'express';
import { 
  getAuthors, 
  toggleWishlist, 
  updateProfile, 
  toggleFollow,
  getFollowedAuthors,
  updateReadingProgress,
  toggleBookmark,
  getBookmarkedWorks,
  deleteMyAccount,
  getAuthorProfile,
  updatePassword
} from '../controllers/userController.js';
import { sendMessage, getMyChatHistory, markAsRead } from '../controllers/chatController.js';
import { uploadProfile } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/authors', getAuthors);
router.get('/:id', getAuthorProfile);
router.put('/profile', protect, uploadProfile.single('profilePicture'), updateProfile);
router.put('/password', protect, updatePassword);
router.put('/wishlist/:bookId', protect, toggleWishlist);
router.post('/follow/:authorId', protect, toggleFollow);
router.get('/following', protect, getFollowedAuthors);
router.put('/reading-progress/:bookId', protect, updateReadingProgress);
router.post('/bookmarks/:workId', protect, toggleBookmark);
router.get('/bookmarks', protect, getBookmarkedWorks);

// Account deletion
router.delete('/me', protect, deleteMyAccount);

// Chat / Support
router.post('/chat', protect, sendMessage);
router.get('/chat', protect, getMyChatHistory);
router.put('/chat/read', protect, markAsRead);

export default router;
