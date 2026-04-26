import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  swapRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest', required: true },
  scheduledTime: { type: Date, required: true },
  status: { type: String, enum: ['Upcoming', 'Rescheduled', 'Completed', 'Canceled'], default: 'Upcoming' },
  meetingLink: { type: String },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
