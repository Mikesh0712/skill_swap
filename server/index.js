import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import swapRoutes from './routes/swapRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import Message from './models/Message.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import os from 'os';

dotenv.config();

const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://172.16.0.2:3000' // Your current local IP
];

app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://192.168.') || origin.startsWith('http://172.16.')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 image uploads
app.use(cookieParser());

// --- Security Overhauls ---
// Set secure HTTP headers
app.use(helmet());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS attacks
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Global Rate Limiting
const globalLimiter = rateLimit({
  max: 100, // 100 requests per IP limit
  windowMs: 15 * 60 * 1000, // 15 mins window
  message: { message: 'Too many requests from this IP, please try again in 15 minutes.' }
});

// Stricter Rate Limiting for Authentication 
const authLimiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 mins
  message: { message: 'Too many authentication attempts from this IP, please try again in 15 minutes.' }
});

// Routes
app.use('/auth', authLimiter, authRoutes);
app.use('/users', globalLimiter, userRoutes);
app.use('/swaps', globalLimiter, swapRoutes);
app.use('/messages', globalLimiter, messageRoutes);
app.use('/forum', globalLimiter, forumRoutes);
app.use('/news', globalLimiter, newsRoutes);
app.use('/admin', globalLimiter, adminRoutes);

// Global Error Handler protecting stack trace from leaking constraints
app.use((err, req, res, next) => {
  console.error('[Error Details]:', err);
  res.status(err.status || 500).json({
    message: err.isOperational ? err.message : 'Internal Server Error Encountered',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillswap';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Basic Route for testing
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SkillSwap API is running' });
});

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room for a specific chat/swap
  socket.on('joinRoom', ({ roomId }) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined swap room ${roomId}`);
  });

  // Join a personal room based on user ID for global notifications/calls
  socket.on('joinUserRoom', ({ userId }) => {
    const userRoomId = `user_${userId.toString()}`;
    socket.join(userRoomId);
    console.log(`[SOCKET] User ${socket.id} joined personal room: ${userRoomId}`);
  });

  socket.on('sendMessage', (data) => {
    const room = data.chatRoomId || data.roomId;
    io.to(room).emit('newMessage', data);
    console.log(`[CHAT] Message sent to room: ${room}`);
  });

  socket.on('markAsDelivered', async ({ messageId, roomId }) => {
    try {
      const msg = await Message.findById(messageId);
      if (msg && msg.status === 'sent') {
        msg.status = 'delivered';
        await msg.save();
        io.to(roomId).emit('messageStatusUpdate', { messageId, status: 'delivered', roomId });
      }
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('markAsRead', async ({ messageId, roomId }) => {
    try {
      const msg = await Message.findById(messageId);
      if (msg && msg.status !== 'read') {
        msg.status = 'read';
        msg.isRead = true;
        await msg.save();
        io.to(roomId).emit('messageStatusUpdate', { messageId, status: 'read', roomId });
      }
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('editMessage', (data) => {
    const room = data.chatRoomId || data.roomId;
    io.to(room).emit('messageEdited', data);
  });

  socket.on('deleteMessage', (data) => {
    const room = data.chatRoomId || data.roomId;
    io.to(room).emit('messageDeleted', data);
  });

  // --- WebRTC Signaling ---
  
  socket.on('webrtc_offer', (data) => {
    console.log(`[WEBRTC] Offer from ${data.callerInfo?.username} to ${data.targetUserId}`);
    if (data.targetUserId) {
      const targetRoom = `user_${data.targetUserId.toString()}`;
      socket.to(targetRoom).emit('webrtc_offer', {
        offer: data.offer,
        callerInfo: data.callerInfo,
        roomId: data.roomId,
        callType: data.callType
      });
      console.log(`[WEBRTC] Offer emitted to room: ${targetRoom}`);
    } else {
      socket.to(data.roomId).emit('webrtc_offer', data.offer);
    }
  });

  socket.on('webrtc_answer', (data) => {
    console.log(`[WEBRTC] Answer to ${data.targetUserId}`);
    if (data.targetUserId) {
      socket.to(`user_${data.targetUserId.toString()}`).emit('webrtc_answer', data.answer);
    } else {
      socket.to(data.roomId).emit('webrtc_answer', data.answer);
    }
  });

  socket.on('webrtc_ice_candidate', (data) => {
    if (data.targetUserId) {
      socket.to(`user_${data.targetUserId.toString()}`).emit('webrtc_ice_candidate', data.candidate);
    } else {
      socket.to(data.roomId).emit('webrtc_ice_candidate', data.candidate);
    }
  });

  socket.on('webrtc_end_call', (data) => {
    if (data.targetUserId) {
      socket.to(`user_${data.targetUserId.toString()}`).emit('webrtc_end_call');
    } else {
      socket.to(data.roomId).emit('webrtc_end_call');
    }
  });

  socket.on('webrtc_reject_call', (data) => {
     if (data.targetUserId) {
      socket.to(`user_${data.targetUserId.toString()}`).emit('webrtc_reject_call');
    }
  });

  // --- Lobby Deletion Signaling ---
  socket.on('request_lobby_delete', (data) => {
    if (data.targetUserId) {
      socket.to(`user_${data.targetUserId.toString()}`).emit('lobby_delete_requested', {
        roomId: data.roomId,
        requesterName: data.requesterName,
        targetUserId: data.requesterId // for the reply
      });
    }
  });

  socket.on('approve_lobby_delete', (data) => {
    if (data.targetUserId) {
      socket.to(`user_${data.targetUserId.toString()}`).emit('lobby_delete_approved', {
        roomId: data.roomId
      });
    }
  });

  socket.on('reject_lobby_delete', (data) => {
    if (data.targetUserId) {
      socket.to(`user_${data.targetUserId.toString()}`).emit('lobby_delete_rejected', {
        roomId: data.roomId,
        rejecterName: data.rejecterName
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET] User disconnected: ${socket.id}`);
  });
});

const startServer = (port) => {
  const localIP = getLocalIP();
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`\n\x1b[32m%s\x1b[0m`, `✔ SkillSwap Server is LIVE`);
    console.log(`\x1b[36m%s\x1b[0m`, `  ➜ Local:    http://localhost:${port}`);
    console.log(`\x1b[36m%s\x1b[0m`, `  ➜ Network:  http://${localIP}:${port}`);
    console.log(`\x1b[35m%s\x1b[0m`, `  ➜ Health:   http://${localIP}:${port}/health\n`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`\x1b[33m%s\x1b[0m`, `⚠ Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
};

const initialPort = parseInt(process.env.PORT) || 5000;
startServer(initialPort);
