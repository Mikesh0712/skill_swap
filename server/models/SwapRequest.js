import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillOffered: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
  skillRequested: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined', 'Completed'], default: 'Pending' },
  initialMessage: { type: String },
  preferredDate: { type: Date },
  preferredTime: { type: String },
  duration: { type: Number }, // in minutes
  language: { type: String },
  optionalNote: { type: String }
}, { timestamps: true });

export default mongoose.model('SwapRequest', swapRequestSchema);
