import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String }
}, { timestamps: true });

export default mongoose.model('Rating', ratingSchema);
