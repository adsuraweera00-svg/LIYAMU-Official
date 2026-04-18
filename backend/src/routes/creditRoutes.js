import express from 'express';
import { 
  buyCredits, 
  adjustCredits, 
  getMyTransactions, 
  getAllTransactions, 
  submitCreditRequest, 
  getMyRequests, 
  getAllCreditRequests, 
  processCreditRequest 
} from '../controllers/creditController.js';
import { uploadSlip } from '../middleware/uploadMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/buy', buyCredits);
router.post('/request', uploadSlip.single('slip'), submitCreditRequest);
router.get('/my-transactions', getMyTransactions);
router.get('/my-requests', getMyRequests);

// Admin Routes
router.post('/adjust', authorize('admin'), adjustCredits);
router.get('/all-transactions', authorize('admin'), getAllTransactions);
router.get('/requests', authorize('admin'), getAllCreditRequests);
router.put('/process-request', authorize('admin'), processCreditRequest);

export default router;
