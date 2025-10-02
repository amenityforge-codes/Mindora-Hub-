const express = require('express');
const User = require('../models/User');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const Video = require('../models/Video');
const Exam = require('../models/Exam');
const router = express.Router();

// @route   GET /api/adult-admin/dashboard
// @desc    Get adult admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    console.log('=== ADULT ADMIN DASHBOARD API CALLED ===');
    
    // Get adult users count (ageRange: '16+')
    const totalAdultUsers = await User.countDocuments({ 
      ageRange: '16+',
      role: { $ne: 'admin' } // Exclude admin users from count
    });
    
    // Get active adult users (logged in within last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeAdultUsers = await User.countDocuments({
      ageRange: '16+',
      lastLogin: { $gte: sevenDaysAgo },
      role: { $ne: 'admin' }
    });
    
    // Get adult modules count
    const totalAdultModules = await Module.countDocuments({ 
      ageRange: '16+',
      status: 'published'
    });
    
    // Get adult quizzes count from modules
    const adultModules = await Module.find({ 
      ageRange: '16+',
      status: 'published'
    }).select('topics');
    
    let totalAdultQuizzes = 0;
    let totalAdultVideos = 0;
    
    adultModules.forEach(module => {
      if (module.topics) {
        module.topics.forEach(topic => {
          if (topic.questions) {
            totalAdultQuizzes += topic.questions.length;
          }
          if (topic.videos) {
            totalAdultVideos += topic.videos.length;
          }
        });
      }
    });
    
    // Get completed adult modules count
    const completedAdultModules = await User.aggregate([
      { $match: { ageRange: '16+', role: { $ne: 'admin' } } },
      { $unwind: '$progress.completedModules' },
      { $count: 'total' }
    ]);
    
    const completedModulesCount = completedAdultModules.length > 0 ? completedAdultModules[0].total : 0;
    
    console.log('=== ADULT ADMIN DASHBOARD STATS ===');
    console.log('Total Adult Users:', totalAdultUsers);
    console.log('Active Adult Users:', activeAdultUsers);
    console.log('Total Adult Modules:', totalAdultModules);
    console.log('Total Adult Quizzes:', totalAdultQuizzes);
    console.log('Total Adult Videos:', totalAdultVideos);
    console.log('Completed Adult Modules:', completedModulesCount);
    
    const dashboardStats = {
      totalUsers: totalAdultUsers,
      totalModules: totalAdultModules,
      totalQuizzes: totalAdultQuizzes,
      totalVideos: totalAdultVideos,
      activeUsers: activeAdultUsers,
      completedModules: completedModulesCount,
      ageRange: '16+',
      platformType: 'Adult Learning Platform'
    };
    
    res.json({
      success: true,
      data: dashboardStats,
      message: 'Adult admin dashboard data retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching adult admin dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult admin dashboard data',
      error: error.message
    });
  }
});

// @route   GET /api/adult-admin/activity
// @desc    Get recent adult learning activity
// @access  Private (Admin only)
router.get('/activity', async (req, res) => {
  try {
    console.log('=== ADULT ADMIN ACTIVITY API CALLED ===');
    
    // Get recent adult user registrations
    const recentAdultUsers = await User.find({
      ageRange: '16+',
      role: { $ne: 'admin' },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })
    .select('name email createdAt lastLogin')
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Get recent adult module completions
    const recentCompletions = await User.find({
      ageRange: '16+',
      role: { $ne: 'admin' },
      'progress.lastActivity': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
    .select('name email progress.lastActivity')
    .sort({ 'progress.lastActivity': -1 })
    .limit(10);
    
    const activities = [];
    
    // Add user registrations
    recentAdultUsers.forEach(user => {
      const timeAgo = Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60));
      activities.push({
        type: 'registration',
        icon: 'person',
        title: 'New adult user registered',
        user: `${user.name} (${user.email}) • ${timeAgo} minutes ago`,
        status: 'Success',
        color: '#4CAF50',
        timestamp: user.createdAt
      });
    });
    
    // Add module completions
    recentCompletions.forEach(user => {
      const timeAgo = Math.floor((Date.now() - new Date(user.progress.lastActivity)) / (1000 * 60));
      activities.push({
        type: 'completion',
        icon: 'work',
        title: 'Professional module completed',
        user: `${user.name} • ${timeAgo} minutes ago`,
        status: 'Completed',
        color: '#FF9800',
        timestamp: user.progress.lastActivity
      });
    });
    
    // Sort by timestamp and limit to 10
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivities = activities.slice(0, 10);
    
    console.log('=== ADULT ADMIN ACTIVITY ===');
    console.log('Recent Activities:', recentActivities.length);
    
    res.json({
      success: true,
      data: recentActivities,
      message: 'Adult learning activity retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching adult admin activity:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult admin activity',
      error: error.message
    });
  }
});

// @route   GET /api/adult-admin/modules
// @desc    Get adult modules for admin management
// @access  Private (Admin only)
router.get('/modules', async (req, res) => {
  try {
    console.log('=== ADULT ADMIN MODULES API CALLED ===');
    
    const { moduleType, difficulty, limit, page, featured, weekly } = req.query;
    const filter = { 
      status: 'published', 
      ageRange: '16+' 
    };

    if (moduleType) filter.moduleType = moduleType;
    if (difficulty) filter.difficulty = difficulty;
    if (featured === 'true') filter.featured = true;
    if (weekly === 'true') filter.weekly = true;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    console.log('Adult Admin Modules filter:', filter);
    console.log('Pagination:', { page: pageNum, limit: limitNum, skip });

    const [modules, totalCount] = await Promise.all([
      Module.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Module.countDocuments(filter)
    ]);

    console.log(`Found ${modules.length} adult modules for admin out of ${totalCount} total`);

    res.status(200).json({
      success: true,
      data: {
        modules,
        totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching adult admin modules:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
});

module.exports = router;
