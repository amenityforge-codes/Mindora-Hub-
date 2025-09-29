const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const auth = require('../middleware/auth');

// @route   GET /api/content/modules
// @desc    Get all modules
// @access  Public
router.get('/modules', async (req, res) => {
  try {
    const { ageRange, limit = 50 } = req.query;
    
    let query = {};
    if (ageRange) {
      query.ageRange = ageRange;
    }
    
    const modules = await Module.find(query)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: {
        modules,
        total: modules.length
      }
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching modules',
      error: error.message
    });
  }
});

// @route   GET /api/content/modules/:id
// @desc    Get single module
// @access  Public
router.get('/modules/:id', async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        module
      }
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching module',
      error: error.message
    });
  }
});

module.exports = router;










