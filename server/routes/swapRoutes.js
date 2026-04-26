import express from 'express';
import { createSwapRequest, getUserSwaps, updateSwapStatus, deleteSwapRequest } from '../controllers/swapController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createSwapRequest);
router.get('/', protect, getUserSwaps);
router.put('/:id', protect, updateSwapStatus);
router.delete('/:id', protect, deleteSwapRequest);

export default router;
