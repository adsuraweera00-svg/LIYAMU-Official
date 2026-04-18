import express from 'express';
import {
  getAdminOverview,
  getBookSubmissions,
  getAllUsers,
  reviewBookSubmission,
  deleteBook,
  toggleBookVisibility,
  updateUser,
  getAllUserReviews,
  deleteUserReview,
  getAdminCreativeWorks,
  deleteCreativeWork,
  reviewCreativeWork,
  deleteUser,
  getDeletedUsers
} from '../controllers/adminController.js';
import { sendMessage, getAdminChats, markAsRead } from '../controllers/chatController.js';
import { decideVerification, getVerificationRequests } from '../controllers/verificationController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorize('admin'));
router.get('/overview', getAdminOverview);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/users/deleted', getDeletedUsers);
router.get('/books', getBookSubmissions);
router.put('/books/:id', reviewBookSubmission);
router.delete('/books/:id', deleteBook);
router.put('/books/:id/visibility', toggleBookVisibility);
router.get('/reviews', getAllUserReviews);
router.delete('/reviews/:id', deleteUserReview);
router.get('/verifications', getVerificationRequests);
router.put('/verifications/:id', decideVerification);
router.get('/creative', getAdminCreativeWorks);
router.put('/creative/:id', reviewCreativeWork);
router.delete('/creative/:id', deleteCreativeWork);

// Support Chat Mgmt
router.get('/chat', getAdminChats);
router.get('/chat/:userId', getAdminChats);
router.post('/chat', sendMessage);
router.put('/chat/read/:userId', markAsRead);

export default router;
