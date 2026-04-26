import express from 'express';
import { getUserProfile, updateProfile, addSkill, deleteSkill, getUserById, getAllUsers } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.put('/profile/skills', protect, addSkill);
router.delete('/profile/skills/:type/:skillId', protect, deleteSkill);
router.get('/:id', protect, getUserById);

export default router;
