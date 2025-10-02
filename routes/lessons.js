const express = require('express');
const router = express.Router();

// @route   GET /api/lessons
// @desc    Get all lessons
// @access  Public
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Lessons endpoint is working',
      data: { lessons: [] }
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lessons',
      error: error.message
    });
  }
});

// @route   GET /api/lessons/:id
// @desc    Get a specific lesson
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Lesson endpoint is working',
      data: { lesson: null }
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lesson',
      error: error.message
    });
  }
});

module.exports = router;