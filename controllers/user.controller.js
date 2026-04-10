const User = require('../models/user.model');

// @route   GET /api/users/profile
// @access  Private (any logged-in user)
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/users/profile
// @access  Private (any logged-in user)
const updateProfile = async (req, res, next) => {
  try {
    const { name, password } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (password) user.password = password; // will be hashed by pre-save hook

    await user.save();

    res.json({ message: 'Profile updated', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile };
