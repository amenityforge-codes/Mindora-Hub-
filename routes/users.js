const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('progress.badges');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, [
  body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid Indian phone number'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('location.city').optional().isString(),
  body('location.state').optional().isString(),
  body('interests').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user._id);
    
    // Update allowed fields
    const allowedUpdates = ['name', 'profile', 'preferences'];
    allowedUpdates.forEach(field => {
      if (req.body[field]) {
        if (field === 'profile') {
          user.profile = { ...user.profile, ...req.body[field] };
        } else if (field === 'preferences') {
          user.preferences = { ...user.preferences, ...req.body[field] };
        } else {
          user[field] = req.body[field];
        }
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   PUT /api/users/password
// @desc    Change password
// @access  Private
router.put('/password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get additional stats from Progress model
    const Progress = require('../models/Progress');
    const progressStats = await Progress.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress.percentage' },
          totalTimeSpent: { $sum: '$timeSpent.total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          progress: user.progress,
          preferences: user.preferences
        },
        progressStats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    });
  }
});

module.exports = router;


