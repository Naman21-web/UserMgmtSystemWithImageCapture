const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin only
const getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin only
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('createdBy', 'username email');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user (Admin only)
// @route   POST /api/users
// @access  Admin only
const createUser = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password.',
      });
    }

    if (!['supervisor', 'worker'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either supervisor or worker.',
      });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists.',
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      role,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: `User '${username}' created successfully.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Admin only
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['supervisor', 'worker'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either supervisor or worker.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot change role of another admin.',
      });
    }

    user.role = role;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `Role updated to '${role}' successfully.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status (Admin only)
// @route   PUT /api/users/:id/status
// @access  Admin only
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate an admin account.',
      });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Admin only
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete an admin account.',
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete your own account.',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User '${user.username}' deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password (Admin only)
// @route   PUT /api/users/:id/password
// @access  Admin only
const resetUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  resetUserPassword,
};
