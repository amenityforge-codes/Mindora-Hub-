const express = require('express');
const Achievement = require('../models/Achievement');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/adult-achievements
// @desc    Get all adult achievements
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('=== ADULT ACHIEVEMENTS API CALLED ===');
    
    const { category, rarity, isActive } = req.query;
    const filter = {
      ageRange: '16+', // Force adult age range
      isActive: isActive !== 'false' // Default to active achievements
    };
    
    if (category) filter.category = category;
    if (rarity) filter.rarity = rarity;
    
    console.log('Adult Achievements filter:', filter);
    
    const achievements = await Achievement.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 });
    
    console.log(`Found ${achievements.length} adult achievements`);
    
    res.json({
      success: true,
      data: achievements
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

// @route   POST /api/adult-achievements
// @desc    Create a new adult achievement
// @access  Private (Admin only)
router.post('/', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT ACHIEVEMENT CREATION ===');
    console.log('Request body:', req.body);
    
    const {
      name,
      description,
      icon,
      symbol,
      color,
      pointsRequired,
      category,
      rarity,
      isActive,
      isSecret,
      rewards,
      tags,
      displayOrder
    } = req.body;

    // Validate required fields
    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and category are required'
      });
    }

    // Create new adult achievement
    const newAchievement = new Achievement({
      name,
      description,
      icon: icon || 'emoji-events',
      symbol: symbol || '🏆',
      color: color || '#FFD700',
      pointsRequired: pointsRequired || 100,
      category,
      rarity: rarity || 'common',
      ageRange: '16+', // Force adult age range
      isActive: isActive !== false,
      isSecret: isSecret || false,
      rewards: rewards || { points: 50, xp: 100, coins: 25 },
      tags: tags || [],
      displayOrder: displayOrder || 0,
      createdBy: req.userId // From auth middleware
    });

    await newAchievement.save();
    
    console.log('✅ Adult achievement created:', newAchievement.name);
    
    res.status(201).json({
      success: true,
      message: 'Adult achievement created successfully',
      data: newAchievement
    });
    
  } catch (error) {
    console.error('❌ Error creating adult achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating adult achievement',
      error: error.message
    });
  }
});

// @route   PUT /api/adult-achievements/:id
// @desc    Update an adult achievement
// @access  Private (Admin only)
router.put('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT ACHIEVEMENT UPDATE ===');
    console.log('Achievement ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const achievement = await Achievement.findOne({
      _id: req.params.id,
      ageRange: '16+', // Ensure it's an adult achievement
      createdBy: req.userId // Ensure user owns the achievement
    });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Adult achievement not found or you do not have permission to modify it'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        achievement[key] = req.body[key];
      }
    });

    await achievement.save();
    
    console.log('✅ Adult achievement updated:', achievement.name);
    
    res.json({
      success: true,
      message: 'Adult achievement updated successfully',
      data: achievement
    });
    
  } catch (error) {
    console.error('❌ Error updating adult achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating adult achievement',
      error: error.message
    });
  }
});

// @route   DELETE /api/adult-achievements/:id
// @desc    Delete an adult achievement
// @access  Private (Admin only)
router.delete('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT ACHIEVEMENT DELETION ===');
    console.log('Achievement ID:', req.params.id);
    
    const achievement = await Achievement.findOne({
      _id: req.params.id,
      ageRange: '16+', // Ensure it's an adult achievement
      createdBy: req.userId // Ensure user owns the achievement
    });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Adult achievement not found or you do not have permission to delete it'
      });
    }

    await Achievement.findByIdAndDelete(req.params.id);
    
    console.log('✅ Adult achievement deleted:', achievement.name);
    
    res.json({
      success: true,
      message: 'Adult achievement deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting adult achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting adult achievement',
      error: error.message
    });
  }
});

module.exports = router;
