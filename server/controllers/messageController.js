import Message from '../models/Message.js';
import SwapRequest from '../models/SwapRequest.js';

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Check if user is part of this swap room
    const swap = await SwapRequest.findById(roomId);
    if (!swap || (swap.requester.toString() !== req.user._id.toString() && swap.receiver.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized for this chat room' });
    }

    const messages = await Message.find({ 
      chatRoomId: roomId,
      deletedFor: { $ne: req.user._id }
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, attachment } = req.body;

    const swap = await SwapRequest.findById(roomId);
    if (!swap || (swap.requester.toString() !== req.user._id.toString() && swap.receiver.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized for this chat room' });
    }

    const message = new Message({
      chatRoomId: roomId,
      sender: req.user._id,
      content,
      attachment,
      isRead: false
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    if (message.isDeleted) {
       return res.status(400).json({ message: 'Cannot edit a deleted message' });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error editing message' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // 'me' | 'everyone'

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    if (type === 'everyone') {
      if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete for everyone' });
      }
      message.isDeleted = true;
      message.content = '';
      message.attachment = undefined;
      await message.save();
    } else {
      if (!message.deletedFor.includes(req.user._id)) {
        message.deletedFor.push(req.user._id);
        await message.save();
      }
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting message' });
  }
};

export const clearChat = async (req, res) => {
  try {
    const { roomId } = req.params;

    // First check if user is authorized for this room
    const swap = await SwapRequest.findById(roomId);
    if (!swap || (swap.requester.toString() !== req.user._id.toString() && swap.receiver.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized for this chat room' });
    }

    // Update all messages in this room to be deleted for this user
    await Message.updateMany(
      { chatRoomId: roomId },
      { $addToSet: { deletedFor: req.user._id } }
    );

    res.json({ message: 'Chat cleared successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error clearing chat' });
  }
};
