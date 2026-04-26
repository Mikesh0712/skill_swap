import User from '../models/User.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, location, profileImage } = req.body;
    
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(req.user._id).select('-passwordHash');
    res.status(200).json(updatedUser);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const addSkill = async (req, res) => {
  try {
    const { type, skillName, proficiency, yearsOfExperience, priorityLevel } = req.body;
    
    // type can be 'teach' or 'learn'
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (type === 'teach') {
      user.skillsTeach.push({ skillName, proficiency, yearsOfExperience });
    } else if (type === 'learn') {
      user.skillsLearn.push({ skillName, priorityLevel });
    } else {
      return res.status(400).json({ message: 'Invalid skill type' });
    }

    await user.save();
    res.status(200).json(user);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const { type, skillId } = req.params;
    
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (type === 'teach') {
      user.skillsTeach = user.skillsTeach.filter(s => s._id.toString() !== skillId);
    } else if (type === 'learn') {
      user.skillsLearn = user.skillsLearn.filter(s => s._id.toString() !== skillId);
    } else {
      return res.status(400).json({ message: 'Invalid skill type' });
    }

    await user.save();
    res.status(200).json(user);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Find users who have at least one teaching skill
    const users = await User.find({ 'skillsTeach.0': { $exists: true } }).select('-passwordHash');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching all users' });
  }
};
