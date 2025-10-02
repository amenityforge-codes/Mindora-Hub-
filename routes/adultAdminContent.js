const express = require('express');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const Video = require('../models/Video');
const Exam = require('../models/Exam');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/adult-admin/ai-finance
// @desc    Get adult AI and Finance modules
// @access  Private (Admin only)
router.get('/ai-finance', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT AI FINANCE API CALLED ===');
    
    const filter = {
      ageRange: '16+',
      status: 'published',
      moduleType: { $in: ['ai', 'finance'] }
    };
    
    const modules = await Module.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${modules.length} adult AI/Finance modules`);
    
    res.json({
      success: true,
      data: { modules },
      message: 'Adult AI/Finance modules retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching adult AI/Finance modules:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult AI/Finance modules',
      error: error.message
    });
  }
});

// @route   GET /api/adult-admin/soft-skills
// @desc    Get adult Soft Skills modules
// @access  Private (Admin only)
router.get('/soft-skills', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT SOFT SKILLS API CALLED ===');
    
    const filter = {
      ageRange: '16+',
      status: 'published',
      moduleType: 'soft-skills'
    };
    
    const modules = await Module.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${modules.length} adult Soft Skills modules`);
    
    res.json({
      success: true,
      data: { modules },
      message: 'Adult Soft Skills modules retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching adult Soft Skills modules:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult Soft Skills modules',
      error: error.message
    });
  }
});

// @route   GET /api/adult-admin/brainstorming
// @desc    Get adult Brainstorming modules
// @access  Private (Admin only)
router.get('/brainstorming', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT BRAINSTORMING API CALLED ===');
    
    const filter = {
      ageRange: '16+',
      status: 'published',
      moduleType: 'brainstorming'
    };
    
    const modules = await Module.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${modules.length} adult Brainstorming modules`);
    
    res.json({
      success: true,
      data: { modules },
      message: 'Adult Brainstorming modules retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching adult Brainstorming modules:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult Brainstorming modules',
      error: error.message
    });
  }
});

// @route   GET /api/adult-admin/math-logic
// @desc    Get adult Math and Logic modules
// @access  Private (Admin only)
router.get('/math-logic', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT MATH LOGIC API CALLED ===');
    
    const filter = {
      ageRange: '16+',
      status: 'published',
      moduleType: { $in: ['math', 'logic'] }
    };
    
    const modules = await Module.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${modules.length} adult Math/Logic modules`);
    
    res.json({
      success: true,
      data: { modules },
      message: 'Adult Math/Logic modules retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching adult Math/Logic modules:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult Math/Logic modules',
      error: error.message
    });
  }
});

// @route   GET /api/adult-admin/achievements
// @desc    Get adult achievements
// @access  Private (Admin only)
router.get('/achievements', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT ACHIEVEMENTS API CALLED ===');
    
    const achievements = await Achievement.find({ ageRange: '16+' })
      .sort({ createdAt: -1 });
    
    // Get user achievement statistics
    const userAchievements = await UserAchievement.aggregate([
      {
        $lookup: {
          from: 'achievements',
          localField: 'achievementId',
          foreignField: '_id',
          as: 'achievement'
        }
      },
      {
        $match: {
          'achievement.ageRange': '16+'
        }
      },
      {
        $group: {
          _id: '$achievementId',
          count: { $sum: 1 },
          achievement: { $first: '$achievement' }
        }
      }
    ]);
    
    console.log(`Found ${achievements.length} adult achievements`);
    
    res.json({
      success: true,
      data: { 
        achievements,
        userAchievements 
      },
      message: 'Adult achievements retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching adult achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult achievements',
      error: error.message
    });
  }
});

// @route   GET /api/adult-admin/exams
// @desc    Get adult exams
// @access  Private (Admin only)
router.get('/exams', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT EXAMS API CALLED ===');
    
    const filter = {
      ageRange: '16+',
      status: 'published'
    };
    
    const exams = await Exam.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${exams.length} adult exams`);
    
    res.json({
      success: true,
      data: { exams },
      message: 'Adult exams retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching adult exams:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult exams',
      error: error.message
    });
  }
});

// @route   GET /api/adult-admin/exam-statistics
// @desc    Get adult exam statistics
// @access  Private (Admin only)
router.get('/exam-statistics', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT EXAM STATISTICS API CALLED ===');
    
    // Get exam attempt statistics for adults
    const examStats = await Exam.aggregate([
      {
        $match: { ageRange: '16+' }
      },
      {
        $lookup: {
          from: 'examattempts',
          localField: '_id',
          foreignField: 'examId',
          as: 'attempts'
        }
      },
      {
        $project: {
          title: 1,
          totalAttempts: { $size: '$attempts' },
          averageScore: { $avg: '$attempts.score' },
          passRate: {
            $multiply: [
              {
                $divide: [
                  { $size: { $filter: { input: '$attempts', cond: { $gte: ['$$this.score', 70] } } } },
                  { $size: '$attempts' }
                ]
              },
              100
            ]
          }
        }
      }
    ]);
    
    console.log(`Found statistics for ${examStats.length} adult exams`);
    
    res.json({
      success: true,
      data: { examStats },
      message: 'Adult exam statistics retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching adult exam statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult exam statistics',
      error: error.message
    });
  }
});

// @route   GET /api/adult-admin/speaking-coach
// @desc    Get adult speaking coach content
// @access  Private (Admin only)
router.get('/speaking-coach', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT SPEAKING COACH API CALLED ===');
    
    const filter = {
      ageRange: '16+',
      status: 'published',
      moduleType: { $in: ['speaking', 'communication'] }
    };
    
    const modules = await Module.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${modules.length} adult speaking coach modules`);
    
    res.json({
      success: true,
      data: { modules },
      message: 'Adult speaking coach modules retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching adult speaking coach modules:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult speaking coach modules',
      error: error.message
    });
  }
});

// @route   GET /api/adult-admin/sentence-builder
// @desc    Get adult sentence builder content
// @access  Private (Admin only)
router.get('/sentence-builder', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT SENTENCE BUILDER API CALLED ===');
    
    const filter = {
      ageRange: '16+',
      status: 'published',
      moduleType: { $in: ['grammar', 'writing', 'business-writing'] }
    };
    
    const modules = await Module.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${modules.length} adult sentence builder modules`);
    
    res.json({
      success: true,
      data: { modules },
      message: 'Adult sentence builder modules retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching adult sentence builder modules:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult sentence builder modules',
      error: error.message
    });
  }
});

// @route   GET /api/adult-admin/lessons
// @desc    Get adult lesson management content
// @access  Private (Admin only)
router.get('/lessons', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT LESSONS API CALLED ===');
    
    const { moduleType, difficulty, limit, page } = req.query;
    const filter = {
      ageRange: '16+',
      status: 'published'
    };
    
    if (moduleType) filter.moduleType = moduleType;
    if (difficulty) filter.difficulty = difficulty;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    
    const [modules, totalCount] = await Promise.all([
      Module.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Module.countDocuments(filter)
    ]);
    
    console.log(`Found ${modules.length} adult lessons out of ${totalCount} total`);
    
    res.json({
      success: true,
      data: { 
        modules,
        totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      },
      message: 'Adult lessons retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching adult lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult lessons',
      error: error.message
    });
  }
});

module.exports = router;
