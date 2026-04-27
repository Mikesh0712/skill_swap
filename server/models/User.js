import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
  profileImage: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  languages: [{ type: String }],
  skillsTeach: [{
    skillName: String,
    proficiency: String,
    yearsOfExperience: Number
  }],
  skillsLearn: [{
    skillName: String,
    priorityLevel: String
  }],
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  sessionsCompleted: { type: Number, default: 0 },
  reputationScore: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  isForumBanned: { type: Boolean, default: false },
  notifications: [{
    type: { type: String, enum: ['alert', 'suspension', 'request', 'info'], default: 'info' },
    message: { type: String },
    isRead: { type: Boolean, default: false },
    actionAllowed: { type: String, default: null }, // e.g. "request_reentry"
    createdAt: { type: Date, default: Date.now }
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

export default mongoose.model('User', userSchema);
