const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Module = require('../models/Module');
const User = require('../models/User');
const Video = require('../models/Video');
const Quiz = require('../models/Quiz');
const Lesson = require('../models/Lesson');
const Achievement = require('../models/Achievement');
const Exam = require('../models/Exam');
const { authenticate } = require('../middleware/auth');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalModules = await Module.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalLessons = await Lesson.countDocuments();
    const totalAchievements = await Achievement.countDocuments();
    const totalExams = await Exam.countDocuments();

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentModules = await Module.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentVideos = await Video.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentQuizzes = await Quiz.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentLessons = await Lesson.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentAchievements = await Achievement.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentExams = await Exam.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get user role distribution
    const userRoles = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent users
    const latestUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent content
    const recentContent = await Module.find()
      .select('title ageRange level createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalModules,
          totalVideos,
          totalQuizzes,
          totalLessons,
          totalAchievements,
          totalExams
        },
        recentActivity: {
          users: recentUsers,
          modules: recentModules,
          videos: recentVideos,
          quizzes: recentQuizzes,
          lessons: recentLessons,
          achievements: recentAchievements,
          exams: recentExams
        },
        userRoles,
        latestUsers,
        recentContent
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// @route   GET /api/admin/modules
// @desc    Get all modules
// @access  Private (Admin)
router.get('/modules', authenticate, async (req, res) => {
  try {
    const modules = await Module.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

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


// @route   POST /api/admin/modules
// @desc    Create a new module
// @access  Private (Admin)
router.post('/modules', authenticate, async (req, res) => {
  try {
    console.log('=== ADMIN MODULE CREATION ===');
    console.log('Request body:', req.body);
    console.log('User object:', req.user);
    console.log('User ID:', req.user?._id);
    console.log('User ID type:', typeof req.user?._id);
    
    const {
      title,
      description,
      ageRange,
      moduleType,
      difficulty,
      estimatedDuration,
      topics,
      tags,
      content
    } = req.body;

    // Validate required fields
    if (!title || !description || !ageRange || !moduleType || !difficulty) {
      console.log('Validation failed - missing fields:', { title, description, ageRange, moduleType, difficulty });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, ageRange, moduleType, difficulty are required'
      });
    }

    const module = await Module.create({
      title,
      description,
      ageRange,
      moduleType,
      difficulty,
      estimatedDuration: estimatedDuration || 30,
      status: 'published',
      createdBy: '68cf052b5f2dc92c9b5e3100'
    });

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: {
        module
      }
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

// @route   DELETE /api/admin/modules/:id
// @desc    Delete a module
// @access  Private (Admin)
router.delete('/modules/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    await Module.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting module',
      error: error.message
    });
  }
});

module.exports = router;
