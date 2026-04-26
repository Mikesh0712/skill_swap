import SwapRequest from '../models/SwapRequest.js';

export const createSwapRequest = async (req, res) => {
  try {
    const { receiverId, skillOfferedId, skillRequestedId, initialMessage, preferredDate, preferredTime } = req.body;
    
    // Check if swap already exists
    const existing = await SwapRequest.findOne({
      requester: req.user._id,
      receiver: receiverId,
      status: 'Pending'
    });

    if (existing) {
      return res.status(400).json({ message: 'A pending swap request already exists with this user' });
    }

    const swapRequest = new SwapRequest({
      requester: req.user._id,
      receiver: receiverId,
      skillOffered: skillOfferedId,
      skillRequested: skillRequestedId,
      initialMessage,
      preferredDate,
      preferredTime,
      status: 'Pending'
    });

    await swapRequest.save();
    res.status(201).json(swapRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating swap request' });
  }
};

export const getUserSwaps = async (req, res) => {
  try {
    const swaps = await SwapRequest.find({
      $or: [{ requester: req.user._id }, { receiver: req.user._id }]
    })
      .populate('requester', 'name username bio')
      .populate('receiver', 'name username bio');
    
    res.json(swaps);
  } catch (error) {
    console.error("GET /swaps Error:", error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Server error fetching swap requests' });
  }
};

export const updateSwapStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const swapRequest = await SwapRequest.findById(id);

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Only receiver can accept/decline
    if (swapRequest.receiver.toString() !== req.user._id.toString() && swapRequest.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    swapRequest.status = status;
    await swapRequest.save();

    res.json(swapRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating swap status' });
  }
};
export const deleteSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const swapRequest = await SwapRequest.findById(id);

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Only requester or receiver can delete
    if (swapRequest.receiver.toString() !== req.user._id.toString() && swapRequest.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await SwapRequest.findByIdAndDelete(id);
    res.json({ message: 'Swap request deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting swap request' });
  }
};
