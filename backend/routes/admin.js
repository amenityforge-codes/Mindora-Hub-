const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Video = require('../models/Video');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalModules = await Module.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalVideos = await Video.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const completedModules = await Module.countDocuments({ status: 'completed' });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalModules,
        totalQuizzes,
        totalVideos,
        activeUsers,
        completedModules
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin)
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user role',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status
// @access  Private (Admin)
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status',
      error: error.message
    });
  }
});

// @route   POST /api/admin/modules
// @desc    Create a new module
// @access  Private (Admin)
router.post('/modules', adminAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      ageRange,
      level,
      estimatedDuration,
      topics,
      tags,
      thumbnail,
      isPublished
    } = req.body;

    const module = new Module({
      title,
      description,
      ageRange,
      level,
      estimatedDuration,
      topics: topics || [],
      tags: tags || [],
      thumbnail: thumbnail || '',
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: req.user.userId
    });

    await module.save();

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: { module }
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating module',
      error: error.message
    });
  }
});

// @route   GET /api/admin/modules
// @desc    Get all modules
// @access  Private (Admin)
router.get('/modules', adminAuth, async (req, res) => {
  try {
    const modules = await Module.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { modules }
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching modules',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/modules/:id
// @desc    Update a module
// @access  Private (Admin)
router.put('/modules/:id', adminAuth, async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    res.json({
      success: true,
      message: 'Module updated successfully',
      data: { module }
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating module',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/modules/:id
// @desc    Delete a module
// @access  Private (Admin)
router.delete('/modules/:id', adminAuth, async (req, res) => {
  try {
    const module = await Module.findByIdAndDelete(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting module',
      error: error.message
    });
  }
});

// @route   GET /api/admin/videos
// @desc    Get all videos
// @access  Private (Admin)
router.get('/videos', adminAuth, async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { videos }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching videos',
      error: error.message
    });
  }
});

// @route   POST /api/admin/videos
// @desc    Create a new video
// @access  Private (Admin)
router.post('/videos', adminAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      level,
      moduleId,
      duration,
      thumbnail,
      videoUrl,
      tags
    } = req.body;

    const video = new Video({
      title,
      description,
      level,
      moduleId,
      duration,
      thumbnail,
      videoUrl,
      tags: tags || [],
      createdBy: req.user.userId
    });

    await video.save();

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: { video }
    });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating video',
      error: error.message
    });
  }
});

// @route   GET /api/admin/quizzes
// @desc    Get all quizzes
// @access  Private (Admin)
router.get('/quizzes', adminAuth, async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { quizzes }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quizzes',
      error: error.message
    });
  }
});

// @route   POST /api/admin/quizzes
// @desc    Create a new quiz
// @access  Private (Admin)
router.post('/quizzes', adminAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      level,
      moduleId,
      timeLimit,
      passingScore,
      questions
    } = req.body;

    const quiz = new Quiz({
      title,
      description,
      level,
      moduleId,
      timeLimit,
      passingScore,
      questions: questions || [],
      createdBy: req.user.userId
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz }
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating quiz',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/quizzes/:id
// @desc    Update a quiz
// @access  Private (Admin)
router.put('/quizzes/:id', adminAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: { quiz }
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating quiz',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/quizzes/:id
// @desc    Delete a quiz
// @access  Private (Admin)
router.delete('/quizzes/:id', adminAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting quiz',
      error: error.message
    });
  }
});

module.exports = router;










