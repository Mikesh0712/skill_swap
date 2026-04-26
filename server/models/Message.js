import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatRoomId: { type: String, required: true }, // Can be the swapRequestId
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: false }, // Made optional if sending only attachment
  attachment: {
    url: String, // Base64 data
    fileType: String, // 'image' | 'document'
    fileName: String
  },
  isRead: { type: Boolean, default: false },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  isEdited: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
