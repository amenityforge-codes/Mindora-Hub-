const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserProgress = require('../models/UserProgress');

// @route   GET /api/progress
// @desc    Get user progress
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    const result = await UserProgress.getUserProgress(req.user._id, {
      status,
      limit: parseInt(limit),
      page: parseInt(page)
    });
    
    // Get progress summary
    const summary = await UserProgress.getProgressSummary(req.user._id);
    
    res.json({
      success: true,
      data: {
        progress: result.progress,
        summary: summary,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching progress',
      error: error.message
    });
  }
});

// @route   POST /api/progress
// @desc    Update user progress
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { moduleId, step, percentage, timeSpent = 0, points = 0 } = req.body;
    
    if (!moduleId || percentage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Module ID and percentage are required'
      });
    }
    
    // Find or create user progress
    let userProgress = await UserProgress.findOne({
      userId: req.user._id,
      moduleId: moduleId
    });
    
    if (!userProgress) {
      userProgress = new UserProgress({
        userId: req.user._id,
        moduleId: moduleId,
        progress: {
          percentage: 0,
          status: 'not-started',
          timeSpent: 0,
          points: 0
        }
      });
    }
    
    // Update progress
    await userProgress.updateProgress({
      percentage: percentage,
      timeSpent: timeSpent,
      points: points
    });
    
    res.json({
      success: true,
      data: {
        progress: userProgress
      }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating progress',
      error: error.message
    });
  }
});

// @route   GET /api/progress/module/:moduleId
// @desc    Get user's progress for a specific module
// @access  Private
router.get('/module/:moduleId', auth, async (req, res) => {
  try {
    const progress = await UserProgress.getUserModuleProgress(req.user._id, req.params.moduleId);
    
    if (!progress) {
      return res.json({
        success: true,
        data: {
          progress: null
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        progress: progress
      }
    });
  } catch (error) {
    console.error('Get module progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching module progress',
      error: error.message
    });
  }
});

// @route   POST /api/progress/topic
// @desc    Mark topic as completed
// @access  Private
router.post('/topic', auth, async (req, res) => {
  try {
    const { moduleId, topicId, topicTitle, score = 0 } = req.body;
    
    if (!moduleId || !topicId || !topicTitle) {
      return res.status(400).json({
        success: false,
        message: 'Module ID, topic ID, and topic title are required'
      });
    }
    
    // Find or create user progress
    let userProgress = await UserProgress.findOne({
      userId: req.user._id,
      moduleId: moduleId
    });
    
    if (!userProgress) {
      userProgress = new UserProgress({
        userId: req.user._id,
        moduleId: moduleId,
        progress: {
          percentage: 0,
          status: 'not-started',
          timeSpent: 0,
          points: 0
        }
      });
    }
    
    // Add completed topic
    await userProgress.addCompletedTopic(topicId, topicTitle, score);
    
    res.json({
      success: true,
      data: {
        progress: userProgress
      }
    });
  } catch (error) {
    console.error('Update topic progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating topic progress',
      error: error.message
    });
  }
});

module.exports = router;

