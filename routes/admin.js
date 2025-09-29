const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const { authenticate } = require('../middleware/auth');

// @route   POST /api/admin/modules
// @desc    Create a new module
// @access  Private (Admin)
router.post('/modules', authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      ageRange,
      level,
      estimatedDuration,
      topics,
      tags,
      thumbnail
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
      createdBy: req.user.userId
    });

    await module.save();

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

module.exports = router;
