import express from 'express';
import { registerUser, loginUser, logoutUser, directResetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.put('/direct-reset-password', directResetPassword);

export default router;
