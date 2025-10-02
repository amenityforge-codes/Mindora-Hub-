const express = require('express');
const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const User = require('../models/User');
const { authenticate: auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/achievements
// @desc    Get all achievements with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      rarity,
      pointsMin,
      pointsMax,
      isActive = true,
      isSecret = false,
      limit = 50,
      page = 1
    } = req.query;

    // Build filter object
    const filter = { isActive: isActive === 'true' || isActive === true };
    
    if (category) filter.category = category;
    if (rarity) filter.rarity = rarity;
    if (isSecret === 'false') filter.isSecret = false;
    
    if (pointsMin || pointsMax) {
      filter.pointsRequired = {};
      if (pointsMin) filter.pointsRequired.$gte = parseInt(pointsMin);
      if (pointsMax) filter.pointsRequired.$lte = parseInt(pointsMax);
    }

    console.log('Achievements filter:', JSON.stringify(filter, null, 2));
    
    const achievements = await Achievement.find(filter)
      .populate('createdBy', 'name email')
      .sort({ pointsRequired: 1, displayOrder: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Achievement.countDocuments(filter);
    
    console.log('Found achievements:', achievements.length);
    console.log('Total achievements in DB:', total);

    res.json({
      success: true,
      data: {
        achievements,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements',
      error: error.message
    });
  }
});

// @route   GET /api/achievements/:id
// @desc    Get a specific achievement
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      data: { achievement }
    });

  } catch (error) {
    console.error('Get achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievement',
      error: error.message
    });
  }
});

// @route   POST /api/achievements
// @desc    Create a new achievement
// @access  Admin only (temporarily disabled for testing)
router.post('/', async (req, res) => {
  try {
    console.log('Achievement creation request body:', JSON.stringify(req.body, null, 2));
    
    const {
      name,
      description,
      icon,
      symbol,
      color,
      pointsRequired,
      category,
      rarity,
      isSecret,
      unlockConditions,
      rewards,
      tags,
      displayOrder
    } = req.body;

    // Validate required fields
    if (!name || !description || !icon || !symbol || !pointsRequired || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, icon, symbol, pointsRequired, and category are required'
      });
    }

    const achievement = new Achievement({
      name,
      description,
      icon,
      symbol,
      color: color || '#FFD700',
      pointsRequired: parseInt(pointsRequired),
      category,
      rarity: rarity || 'common',
      isActive: true, // Explicitly set as active
      isSecret: isSecret === true,
      unlockConditions: unlockConditions || {},
      rewards: rewards || { points: 0, xp: 0, coins: 0 },
      tags: tags || [],
      displayOrder: displayOrder || 0,
      createdBy: new mongoose.Types.ObjectId() // Default admin user since auth is disabled
    });

    console.log('Saving achievement:', JSON.stringify(achievement, null, 2));
    await achievement.save();
    console.log('Achievement saved successfully with ID:', achievement._id);

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: { achievement }
    });

  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating achievement',
      error: error.message
    });
  }
});

// @route   PUT /api/achievements/:id
// @desc    Update an achievement
// @access  Admin only
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    // Update fields
    const allowedUpdates = [
      'name', 'description', 'icon', 'symbol', 'color', 'pointsRequired',
      'category', 'rarity', 'isActive', 'isSecret', 'unlockConditions',
      'rewards', 'tags', 'displayOrder'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        achievement[field] = req.body[field];
      }
    });

    await achievement.save();

    res.json({
      success: true,
      message: 'Achievement updated successfully',
      data: { achievement }
    });

  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating achievement',
      error: error.message
    });
  }
});

// @route   DELETE /api/achievements/:id
// @desc    Delete an achievement
// @access  Admin only
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    // Check if any users have this achievement
    const userAchievements = await UserAchievement.countDocuments({ 
      achievementId: achievement._id 
    });

    if (userAchievements > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete achievement that has been earned by users'
      });
    }

    await Achievement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    });

  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting achievement',
      error: error.message
    });
  }
});

// @route   GET /api/achievements/user/:userId
// @desc    Get user achievements
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, rarity, limit = 50 } = req.query;

    // Check if user is accessing their own achievements or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const options = { category, rarity, limit: parseInt(limit) };
    const userAchievements = await UserAchievement.getUserAchievements(userId, options);

    res.json({
      success: true,
      data: { userAchievements }
    });

  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user achievements',
      error: error.message
    });
  }
});

// @route   GET /api/achievements/user/:userId/stats
// @desc    Get user achievement statistics
// @access  Private
router.get('/user/:userId/stats', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is accessing their own stats or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const stats = await UserAchievement.getUserStats(userId);
    const user = await User.findById(userId).select('progress.points progress.totalXP progress.coins');

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalAchievements: 0,
          totalPoints: 0,
          totalXP: 0,
          totalCoins: 0,
          categories: [],
          rarities: []
        },
        userPoints: user?.progress?.points || 0,
        userXP: user?.progress?.totalXP || 0,
        userCoins: user?.progress?.coins || 0
      }
    });

  } catch (error) {
    console.error('Get user achievement stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user achievement stats',
      error: error.message
    });
  }
});

// @route   POST /api/achievements/check
// @desc    Check and award achievements for a user
// @access  Private
router.post('/check', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId || req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all achievements the user hasn't earned yet
    const earnedAchievements = await UserAchievement.find({ userId: user._id })
      .select('achievementId');
    
    const earnedIds = earnedAchievements.map(ua => ua.achievementId);
    
    const availableAchievements = await Achievement.find({
      _id: { $nin: earnedIds },
      isActive: true,
      pointsRequired: { $lte: user.progress?.points || 0 }
    });

    const newAchievements = [];

    for (const achievement of availableAchievements) {
      // Check if user meets the requirements
      if ((user.progress?.points || 0) >= achievement.pointsRequired) {
        const userAchievement = new UserAchievement({
          userId: user._id,
          achievementId: achievement._id,
          pointsEarned: achievement.rewards.points,
          xpEarned: achievement.rewards.xp,
          coinsEarned: achievement.rewards.coins
        });

        await userAchievement.save();
        newAchievements.push(achievement);

        // Update user points if achievement gives points
        if (achievement.rewards.points > 0) {
          user.progress.points = (user.progress?.points || 0) + achievement.rewards.points;
        }
        if (achievement.rewards.xp > 0) {
          user.progress.totalXP = (user.progress?.totalXP || 0) + achievement.rewards.xp;
        }
        if (achievement.rewards.coins > 0) {
          user.progress.coins = (user.progress?.coins || 0) + achievement.rewards.coins;
        }
      }
    }

    if (newAchievements.length > 0) {
      await user.save();
    }

    res.json({
      success: true,
      message: `Found ${newAchievements.length} new achievements`,
      data: { newAchievements }
    });

  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking achievements',
      error: error.message
    });
  }
});

// @route   GET /api/achievements/categories
// @desc    Get achievement categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Achievement.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
      error: error.message
    });
  }
});

// @route   GET /api/achievements/rarities
// @desc    Get achievement rarities
// @access  Public
router.get('/rarities', async (req, res) => {
  try {
    const rarities = await Achievement.distinct('rarity', { isActive: true });
    
    res.json({
      success: true,
      data: { rarities }
    });

  } catch (error) {
    console.error('Get rarities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rarities',
      error: error.message
    });
  }
});

module.exports = router;
