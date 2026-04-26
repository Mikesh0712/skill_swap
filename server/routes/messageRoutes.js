import express from 'express';
import { getMessages, sendMessage, editMessage, deleteMessage, clearChat } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:roomId', protect, getMessages);
router.post('/:roomId', protect, sendMessage);
router.put('/:id', protect, editMessage);
router.delete('/room/:roomId/clear', protect, clearChat);
router.delete('/:id', protect, deleteMessage);

export default router;
