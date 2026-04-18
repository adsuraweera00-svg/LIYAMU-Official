import express from 'express';
import { upgradeToPro, getProStatus } from '../controllers/proController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/upgrade', upgradeToPro);
router.get('/status', getProStatus);

export default router;
