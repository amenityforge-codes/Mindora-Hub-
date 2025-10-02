const express = require('express');
const mongoose = require('mongoose');
const Module = require('../models/Module');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/adult-modules
// @desc    Get all adult modules (ageRange: 16+)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { moduleType, difficulty, limit, page, featured, weekly } = req.query;
    
    // Build filter object - ONLY adult modules
    const filter = { 
      status: 'published',
      ageRange: '16+'  // Force adult age range
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
    
    console.log('Adult Modules filter:', filter);
    console.log('Pagination:', { page: pageNum, limit: limitNum, skip });
    
    const [modules, totalCount] = await Promise.all([
      Module.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Module.countDocuments(filter)
    ]);
    
    console.log(`Found ${modules.length} adult modules out of ${totalCount} total`);
    
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
    console.error('Error fetching adult modules:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult modules'
    });
  }
});

// @route   GET /api/adult-modules/:id
// @desc    Get a specific adult module
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const module = await Module.findOne({
      _id: req.params.id,
      ageRange: '16+',  // Ensure it's an adult module
      status: 'published'
    }).populate('createdBy', 'name email');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Adult module not found'
      });
    }

    res.json({
      success: true,
      data: { module }
    });
    
  } catch (error) {
    console.error('Error fetching adult module:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult module'
    });
  }
});

// @route   GET /api/adult-modules/:moduleId/topics/:topicId/videos
// @desc    Get videos for a specific adult module topic
// @access  Public
router.get('/:moduleId/topics/:topicId/videos', async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    
    const module = await Module.findOne({
      _id: moduleId,
      ageRange: '16+',  // Ensure it's an adult module
      status: 'published'
    });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Adult module not found'
      });
    }
    
    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found in adult module'
      });
    }
    
    res.json({
      success: true,
      data: { videos: topic.videos || [] }
    });
    
  } catch (error) {
    console.error('Error fetching adult module videos:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult module videos'
    });
  }
});

// @route   GET /api/adult-modules/:moduleId/topics/:topicId/questions
// @desc    Get questions for a specific adult module topic
// @access  Public
router.get('/:moduleId/topics/:topicId/questions', async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    
    const module = await Module.findOne({
      _id: moduleId,
      ageRange: '16+',  // Ensure it's an adult module
      status: 'published'
    });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Adult module not found'
      });
    }
    
    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found in adult module'
      });
    }
    
    res.json({
      success: true,
      data: { questions: topic.questions || [] }
    });
    
  } catch (error) {
    console.error('Error fetching adult module questions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult module questions'
    });
  }
});

// @route   GET /api/adult-modules/:moduleId/topics/:topicId/notes
// @desc    Get notes for a specific adult module topic
// @access  Public
router.get('/:moduleId/topics/:topicId/notes', async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    
    const module = await Module.findOne({
      _id: moduleId,
      ageRange: '16+',  // Ensure it's an adult module
      status: 'published'
    });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Adult module not found'
      });
    }
    
    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found in adult module'
      });
    }
    
    res.json({
      success: true,
      data: { notes: topic.notes || [] }
    });
    
  } catch (error) {
    console.error('Error fetching adult module notes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult module notes'
    });
  }
});

// @route   GET /api/adult-modules/:moduleId/topics/:topicId/links
// @desc    Get links for a specific adult module topic
// @access  Public
router.get('/:moduleId/topics/:topicId/links', async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    
    const module = await Module.findOne({
      _id: moduleId,
      ageRange: '16+',  // Ensure it's an adult module
      status: 'published'
    });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Adult module not found'
      });
    }
    
    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found in adult module'
      });
    }
    
    res.json({
      success: true,
      data: { links: topic.links || [] }
    });
    
  } catch (error) {
    console.error('Error fetching adult module links:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult module links'
    });
  }
});

// @route   POST /api/adult-modules
// @desc    Create a new adult module
// @access  Private (Admin only)
router.post('/', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT MODULE CREATION ===');
    console.log('Request body:', req.body);
    
    const {
      title,
      description,
      moduleType,
      difficulty,
      estimatedDuration,
      tags,
      topics
    } = req.body;

    // Validate required fields
    if (!title || !description || !moduleType) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and module type are required'
      });
    }

    // Create new adult module
    const newModule = new Module({
      title,
      description,
      moduleType,
      difficulty: difficulty || 'intermediate',
      estimatedDuration: estimatedDuration || 30,
      ageRange: '16+', // Force adult age range
      tags: tags || [],
      topics: topics || [],
      createdBy: req.userId, // From auth middleware
      status: 'published'
    });

    await newModule.save();
    
    console.log('✅ Adult module created:', newModule.title);
    
    res.status(201).json({
      success: true,
      message: 'Adult module created successfully',
      data: { module: newModule }
    });
    
  } catch (error) {
    console.error('❌ Error creating adult module:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating adult module',
      error: error.message
    });
  }
});

// @route   DELETE /api/adult-modules/:id
// @desc    Delete an adult module
// @access  Private (Admin only)
router.delete('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT MODULE DELETION ===');
    console.log('Module ID:', req.params.id);
    
    const module = await Module.findOne({
      _id: req.params.id,
      ageRange: '16+', // Ensure it's an adult module
      createdBy: req.userId // Ensure user owns the module
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Adult module not found or you do not have permission to delete it'
      });
    }

    await Module.findByIdAndDelete(req.params.id);
    
    console.log('✅ Adult module deleted:', module.title);
    
    res.json({
      success: true,
      message: 'Adult module deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting adult module:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting adult module',
      error: error.message
    });
  }
});

// @route   POST /api/adult-modules/:moduleId/topics
// @desc    Add a topic to an adult module
// @access  Private (Admin only)
router.post('/:moduleId/topics', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT TOPIC CREATION ===');
    console.log('Module ID:', req.params.moduleId);
    console.log('Topic data:', req.body);
    
    const { title, description, content, order } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const module = await Module.findOne({
      _id: req.params.moduleId,
      ageRange: '16+', // Ensure it's an adult module
      createdBy: req.userId // Ensure user owns the module
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Adult module not found or you do not have permission to modify it'
      });
    }

    const newTopic = {
      title,
      description,
      content: content || '',
      order: order || module.topics.length + 1,
      videos: [],
      questions: [],
      notes: [],
      links: []
    };

    module.topics.push(newTopic);
    await module.save();
    
    console.log('✅ Adult topic created:', newTopic.title);
    
    res.status(201).json({
      success: true,
      message: 'Topic added to adult module successfully',
      data: { topic: newTopic }
    });
    
  } catch (error) {
    console.error('❌ Error creating adult topic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating adult topic',
      error: error.message
    });
  }
});

// @route   DELETE /api/adult-modules/:moduleId/topics/:topicId
// @desc    Delete a topic from an adult module
// @access  Private (Admin only)
router.delete('/:moduleId/topics/:topicId', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT TOPIC DELETION ===');
    console.log('Module ID:', req.params.moduleId);
    console.log('Topic ID:', req.params.topicId);
    
    const module = await Module.findOne({
      _id: req.params.moduleId,
      ageRange: '16+', // Ensure it's an adult module
      createdBy: req.userId // Ensure user owns the module
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Adult module not found or you do not have permission to modify it'
      });
    }

    const topic = module.topics.id(req.params.topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found in adult module'
      });
    }

    topic.remove();
    await module.save();
    
    console.log('✅ Adult topic deleted:', topic.title);
    
    res.json({
      success: true,
      message: 'Topic deleted from adult module successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting adult topic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting adult topic',
      error: error.message
    });
  }
});

module.exports = router;
