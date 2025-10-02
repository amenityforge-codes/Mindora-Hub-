const express = require('express');
const mongoose = require('mongoose');
const Module = require('../models/Module');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/children-modules
// @desc    Get all children modules (ageRange: 6-15)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { moduleType, difficulty, limit, page, featured, weekly } = req.query;
    
    // Build filter object - ONLY children modules
    const filter = { 
      status: 'published',
      ageRange: '6-15'  // Force children age range
    };
    
    if (moduleType) {
      filter.moduleType = moduleType;
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }
    
    if (weekly === 'true') {
      filter.weekly = true;
    }
    
    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    
    console.log('Children Modules filter:', filter);
    console.log('Pagination:', { page: pageNum, limit: limitNum, skip });
    
    const [modules, totalCount] = await Promise.all([
      Module.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Module.countDocuments(filter)
    ]);
    
    console.log(`Found ${modules.length} children modules out of ${totalCount} total`);
    
    res.json({
      success: true,
      data: {
        modules,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          hasNext: pageNum < Math.ceil(totalCount / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching children modules:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching children modules'
    });
  }
});

// @route   GET /api/children-modules/:id
// @desc    Get a specific children module
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const module = await Module.findOne({
      _id: req.params.id,
      ageRange: '6-15',  // Ensure it's a children module
      status: 'published'
    }).populate('createdBy', 'name email');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Children module not found'
      });
    }

    res.json({
      success: true,
      data: { module }
    });
    
  } catch (error) {
    console.error('Error fetching children module:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching children module'
    });
  }
});

// @route   GET /api/children-modules/:moduleId/topics/:topicId/videos
// @desc    Get videos for a specific children module topic
// @access  Public
router.get('/:moduleId/topics/:topicId/videos', async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    
    const module = await Module.findOne({
      _id: moduleId,
      ageRange: '6-15',  // Ensure it's a children module
      status: 'published'
    });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Children module not found'
      });
    }
    
    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found in children module'
      });
    }
    
    res.json({
      success: true,
      data: { videos: topic.videos || [] }
    });
    
  } catch (error) {
    console.error('Error fetching children module videos:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching children module videos'
    });
  }
});

// @route   GET /api/children-modules/:moduleId/topics/:topicId/questions
// @desc    Get questions for a specific children module topic
// @access  Public
router.get('/:moduleId/topics/:topicId/questions', async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    
    const module = await Module.findOne({
      _id: moduleId,
      ageRange: '6-15',  // Ensure it's a children module
      status: 'published'
    });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Children module not found'
      });
    }
    
    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found in children module'
      });
    }
    
    res.json({
      success: true,
      data: { questions: topic.questions || [] }
    });
    
  } catch (error) {
    console.error('Error fetching children module questions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching children module questions'
    });
  }
});

// @route   GET /api/children-modules/:moduleId/topics/:topicId/notes
// @desc    Get notes for a specific children module topic
// @access  Public
router.get('/:moduleId/topics/:topicId/notes', async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    
    const module = await Module.findOne({
      _id: moduleId,
      ageRange: '6-15',  // Ensure it's a children module
      status: 'published'
    });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Children module not found'
      });
    }
    
    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found in children module'
      });
    }
    
    res.json({
      success: true,
      data: { notes: topic.notes || [] }
    });
    
  } catch (error) {
    console.error('Error fetching children module notes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching children module notes'
    });
  }
});

// @route   GET /api/children-modules/:moduleId/topics/:topicId/links
// @desc    Get links for a specific children module topic
// @access  Public
router.get('/:moduleId/topics/:topicId/links', async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    
    const module = await Module.findOne({
      _id: moduleId,
      ageRange: '6-15',  // Ensure it's a children module
      status: 'published'
    });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Children module not found'
      });
    }
    
    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found in children module'
      });
    }
    
    res.json({
      success: true,
      data: { links: topic.links || [] }
    });
    
  } catch (error) {
    console.error('Error fetching children module links:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching children module links'
    });
  }
});

module.exports = router;
