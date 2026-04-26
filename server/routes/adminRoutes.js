import express from 'express';
import User from '../models/User.js';
import ForumPost from '../models/ForumPost.js'; // Ensure ForumPost model exists or fallback
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify Admin Authorization
const protectAdmin = async (req, res, next) => {
  let token;
  if (req.cookies.token) {
    try {
      token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-passwordHash');
      
      if (req.user && req.user.isAdmin) {
        next();
      } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
      }
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Protect standard user
const protect = async (req, res, next) => {
  let token;
  if (req.cookies.token) {
    try {
      token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-passwordHash');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// @route   PUT /admin/banUser/:id
// @desc    Ban User from Forum, Delete Posts, Push Notification
// @access  Private/Admin
router.put('/banUser/:id', protectAdmin, async (req, res) => {
  try {
    const userToBan = await User.findById(req.params.id);
    if (!userToBan) return res.status(404).json({ message: 'User not found' });

    userToBan.isForumBanned = true;
    
    // Add Notification Alert
    userToBan.notifications.unshift({
      type: 'suspension',
      message: 'you are removed from forum due to some reasons . if you want to rejoin kindly register yourself again in the forum',
      actionAllowed: 'request_reentry'
    });
    
    await userToBan.save();

    // Delete their transmissions natively from the forum using Mongoose
    try {
      await ForumPost.deleteMany({ authorId: userToBan._id });
    } catch (err) {
      console.warn("Could not delete Forum posts. Model might be named differently or doesn't exist:", err);
      // Native delete using mongoose connection directly if ForumPost fails
      await mongoose.connection.db.collection('forumposts').deleteMany({ authorId: userToBan._id });
    }

    res.json({ message: 'User banned and notified successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error banning user' });
  }
});

// @route   POST /admin/requestReEntry
// @desc    Allows banned user to formally request to re-enter
// @access  Private
router.post('/requestReEntry', protect, async (req, res) => {
  try {
    const user = req.user;
    if (!user.isForumBanned) return res.status(400).json({ message: 'You are not banned.' });

    // Mark the notification holding the action as 'read/processed' by removing the action link
    user.notifications = user.notifications.map(n => {
      if (n.actionAllowed === 'request_reentry') {
        n.actionAllowed = null; // Consume the button
        n.isRead = true;
      }
      return n;
    });

    // Also push a confirmation notification to the user themselves
    user.notifications.unshift({
      type: 'info',
      message: 'We have received your request for re-entry to the Matrix. An Admin will review your profile shortly.',
      actionAllowed: null
    });

    await user.save();
    
    res.json({ notifications: user.notifications });
  } catch (err) {
    res.status(500).json({ message: 'Server error processing request' });
  }
});

// @route   PUT /admin/notifications/markRead
// @desc    Mark notifications as read globally
// @access  Private
router.put('/notifications/markRead', protect, async (req, res) => {
  try {
    req.user.notifications.forEach(n => n.isRead = true);
    await req.user.save();
    res.json({ notifications: req.user.notifications });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating notifications' });
  }
});

export default router;
