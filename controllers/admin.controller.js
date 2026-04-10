const User = require('../models/user.model');

// @route   GET /api/admin/users
// @access  Admin only
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-refreshToken');
    res.json({ count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/admin/users/:id/role
// @access  Admin only
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['user', 'moderator', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Role must be one of: ${validRoles.join(', ')}` });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: `Role updated to ${role}`, user });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/admin/users/:id
// @access  Admin only
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, updateUserRole, deleteUser };
