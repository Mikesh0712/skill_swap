import express from 'express';
import { getPosts, createPost, deletePost, toggleLike, addComment } from '../controllers/forumController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getPosts); // Public route effectively, but let's allow read mostly
router.post('/', protect, createPost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);

export default router;
