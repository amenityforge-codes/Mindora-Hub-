const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/content
// @desc    Get modules based on filters
// @access  Public (with optional auth for personalized content)
router.get('/', optionalAuth, [
  query('ageRange').optional().isIn(['6-15', '16+', 'business', 'all']),
  query('moduleType').optional().isIn([
    'phonics', 'grammar', 'vocabulary', 'reading', 'writing', 'listening', 'speaking',
    'communication', 'ai', 'finance', 'soft-skills', 'brainstorming', 'math',
    'business-writing', 'presentation', 'negotiation', 'interview'
  ]),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  query('tags').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('page').optional().isInt({ min: 1 })
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

    const {
      ageRange,
      moduleType,
      difficulty,
      tags,
      limit = 10,
      page = 1,
      featured,
      weekly
    } = req.query;

    // Build query
    const query = {
      status: 'published',
      publishAt: { $lte: new Date() }
    };

    // Apply filters
    if (ageRange && ageRange !== 'all') {
      query.$or = [
        { ageRange: ageRange },
        { ageRange: 'all' }
      ];
    }

    if (moduleType) {
      query.moduleType = moduleType;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (weekly === 'true') {
      const currentWeek = getWeekNumber(new Date());
      const currentYear = new Date().getFullYear();
      query['weeklyPackage.weekNumber'] = currentWeek;
      query['weeklyPackage.year'] = currentYear;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const modules = await Module.find(query)
      .populate('createdBy', 'name')
      .sort({ publishAt: -1, isFeatured: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Module.countDocuments(query);

    // Add user progress if authenticated
    let modulesWithProgress = modules;
    if (req.user) {
      const userProgress = await Progress.find({
        userId: req.user._id,
        moduleId: { $in: modules.map(m => m._id) }
      });

      const progressMap = {};
      userProgress.forEach(p => {
        progressMap[p.moduleId.toString()] = p;
      });

      modulesWithProgress = modules.map(module => {
        const progress = progressMap[module._id.toString()];
        return {
          ...module.toObject(),
          userProgress: progress ? {
            status: progress.status,
            percentage: progress.progress.percentage,
            timeSpent: progress.timeSpent.total,
            lastActivity: progress.completion.lastActivity
          } : null
        };
      });
    }

    res.json({
      success: true,
      data: {
        modules: modulesWithProgress,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: modules.length,
          totalCount: total
        }
      }
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching modules'
    });
  }
});

// @route   GET /api/content/featured
// @desc    Get featured modules
// @access  Public
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const modules = await Module.find({
      status: 'published',
      isFeatured: true,
      publishAt: { $lte: new Date() }
    })
      .populate('createdBy', 'name')
      .sort({ publishAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        modules
      }
    });
  } catch (error) {
    console.error('Get featured modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured modules'
    });
  }
});

// @route   GET /api/content/recommended
// @desc    Get recommended modules for user
// @access  Private
router.get('/recommended', authenticate, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const user = req.user;

    // Get user's completed modules
    const completedProgress = await Progress.find({
      userId: user._id,
      status: 'completed'
    }).populate('moduleId', 'moduleType tags');

    // Get user's interests and age range
    const userInterests = user.profile?.interests || [];
    const userAgeRange = user.ageRange;

    // Build recommendation query
    const recommendationQuery = {
      status: 'published',
      publishAt: { $lte: new Date() },
      _id: { $nin: completedProgress.map(p => p.moduleId._id) }
    };

    // Add age range filter if available
    if (userAgeRange && userAgeRange !== 'all') {
      recommendationQuery.ageRange = userAgeRange;
    }

    // Get recommended modules
    let modules = await Module.find(recommendationQuery)
      .populate('createdBy', 'name')
      .sort({ publishAt: -1 })
      .limit(parseInt(limit));

    // If we have user interests, prioritize modules with matching tags
    if (userInterests.length > 0) {
      modules = modules.sort((a, b) => {
        const aMatches = a.tags?.filter(tag => userInterests.includes(tag)).length || 0;
        const bMatches = b.tags?.filter(tag => userInterests.includes(tag)).length || 0;
        return bMatches - aMatches;
      });
    }

    res.json({
      success: true,
      data: {
        modules
      }
    });
  } catch (error) {
    console.error('Get recommended modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recommended modules'
    });
  }
});

// @route   GET /api/content/:id
// @desc    Get single module by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('createdBy', 'name profile')
      .populate('srsBatch');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    if (module.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Add user progress if authenticated
    let userProgress = null;
    if (req.user) {
      userProgress = await Progress.findOne({
        userId: req.user._id,
        moduleId: module._id
      });
    }

    res.json({
      success: true,
      data: {
        module,
        userProgress: userProgress ? {
          status: userProgress.status,
          percentage: userProgress.progress.percentage,
          timeSpent: userProgress.timeSpent.total,
          lastActivity: userProgress.completion.lastActivity,
          bookmarks: userProgress.bookmarks,
          notes: userProgress.notes
        } : null
      }
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching module'
    });
  }
});

// @route   GET /api/content/weekly/:weekNumber/:year
// @desc    Get weekly content package
// @access  Public
router.get('/weekly/:weekNumber/:year', optionalAuth, async (req, res) => {
  try {
    const { weekNumber, year } = req.params;
    const { ageRange } = req.query;

    const modules = await Module.getWeeklyContent(
      parseInt(weekNumber),
      parseInt(year),
      ageRange
    );

    // Add user progress if authenticated
    let modulesWithProgress = modules;
    if (req.user) {
      const userProgress = await Progress.find({
        userId: req.user._id,
        moduleId: { $in: modules.map(m => m._id) }
      });

      const progressMap = {};
      userProgress.forEach(p => {
        progressMap[p.moduleId.toString()] = p;
      });

      modulesWithProgress = modules.map(module => {
        const progress = progressMap[module._id.toString()];
        return {
          ...module.toObject(),
          userProgress: progress ? {
            status: progress.status,
            percentage: progress.progress.percentage,
            timeSpent: progress.timeSpent.total,
            lastActivity: progress.completion.lastActivity
          } : null
        };
      });
    }

    res.json({
      success: true,
      data: {
        weekNumber: parseInt(weekNumber),
        year: parseInt(year),
        modules: modulesWithProgress
      }
    });
  } catch (error) {
    console.error('Get weekly content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching weekly content'
    });
  }
});

// @route   GET /api/content/search
// @desc    Search modules
// @access  Public
router.get('/search', optionalAuth, [
  query('q').notEmpty().withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const { q, limit = 10 } = req.query;

    // Build search query
    const searchQuery = {
      status: 'published',
      publishAt: { $lte: new Date() },
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { 'content.text': { $regex: q, $options: 'i' } }
      ]
    };

    const modules = await Module.find(searchQuery)
      .populate('createdBy', 'name')
      .sort({ publishAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        modules,
        query: q,
        count: modules.length
      }
    });
  } catch (error) {
    console.error('Search modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching modules'
    });
  }
});


// Helper function to get week number
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

module.exports = router;

