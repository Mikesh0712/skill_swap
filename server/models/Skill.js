import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  popularityScore: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Skill', skillSchema);
