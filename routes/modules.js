const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Module = require('../models/Module');
const Video = require('../models/Video');
const Quiz = require('../models/Quiz');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/modules';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    // Allow video files, documents, and images
    if (file.mimetype.startsWith('video/') || 
        file.mimetype.startsWith('application/') ||
        file.mimetype.startsWith('text/') ||
        file.mimetype.startsWith('image/') ||
        file.originalname.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|pdf|doc|docx|txt|rtf|jpg|jpeg|png|gif)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// @route   GET /api/modules
// @desc    Get all public modules with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { ageRange, moduleType, difficulty, limit, page, featured, weekly } = req.query;
    
    // Build filter object
    const filter = { status: 'published' };
    
    if (ageRange) {
      filter.ageRange = ageRange;
    }
    
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
    
    console.log('Modules filter:', filter);
    console.log('Pagination:', { page: pageNum, limit: limitNum, skip });
    
    const [modules, totalCount] = await Promise.all([
      Module.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Module.countDocuments(filter)
    ]);

    console.log(`Found ${modules.length} modules out of ${totalCount} total`);

    res.json({
      success: true,
      data: { 
        modules,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching modules',
      error: error.message
    });
  }
});

// @route   GET /api/modules/:id
// @desc    Get a specific module with videos and quizzes
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Get videos and quizzes for this module
    const [videos, quizzes] = await Promise.all([
      Video.find({ moduleId: req.params.id, isPublished: true })
        .sort({ sequenceOrder: 1, level: 1 })
        .populate('associatedQuiz', 'title description'),
      Quiz.find({ moduleId: req.params.id, isPublished: true })
        .sort({ sequenceOrder: 1, level: 1 })
    ]);

    res.json({
      success: true,
      data: {
        module: {
          ...module.toObject(),
          videos,
          quizzes
        }
      }
    });

  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching module',
      error: error.message
    });
  }
});

// @route   POST /api/modules/:id/topics
// @desc    Add a topic to a module
// @access  Public
router.post('/:id/topics', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const newTopic = {
      title,
      description,
      createdAt: new Date()
    };

    module.topics.push(newTopic);
    await module.save();

    res.status(201).json({
      success: true,
      message: 'Topic added successfully',
      data: {
        topic: newTopic
      }
    });
  } catch (error) {
    console.error('Error adding topic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding topic',
      error: error.message
    });
  }
});

// @route   DELETE /api/modules/:id/topics/:topicId
// @desc    Delete a topic from a module
// @access  Public
router.delete('/:id/topics/:topicId', async (req, res) => {
  try {
    const { id, topicId } = req.params;

    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    module.topics = module.topics.filter(topic => topic._id.toString() !== topicId);
    await module.save();

    res.json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting topic',
      error: error.message
    });
  }
});

// @route   GET /api/modules/:moduleId/topics/:topicId/videos
// @desc    Get videos for a specific topic
// @access  Public
router.get('/:moduleId/topics/:topicId/videos', async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Return the videos from the topic
    res.json(topic.videos || []);
  } catch (error) {
    console.error('Error fetching topic videos:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching topic videos',
      error: error.message
    });
  }
});

// @route   POST /api/modules/:moduleId/topics/:topicId/videos
// @desc    Upload a video for a specific topic
// @access  Public
router.post('/:moduleId/topics/:topicId/videos', upload.single('video'), async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    const { title, description } = req.body;
    
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Video file is required'
      });
    }

    // Create new video object with actual file path
    const newVideo = {
      title,
      description,
      videoUrl: `/uploads/modules/${req.file.filename}`, // Real file path
      duration: 0, // Will be updated when video is processed
      isLocalFile: true,
      uploadedAt: new Date()
    };

    // Add video to topic's videos array
    if (!topic.videos) {
      topic.videos = [];
    }
    topic.videos.push(newVideo);

    // Save the module
    await module.save();

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: newVideo
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading video',
      error: error.message
    });
  }
});

// @route   DELETE /api/modules/:moduleId/topics/:topicId/videos/:videoId
// @desc    Delete a video from a specific topic
// @access  Public
router.delete('/:moduleId/topics/:topicId/videos/:videoId', async (req, res) => {
  try {
    const { moduleId, topicId, videoId } = req.params;
    
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    const video = topic.videos.id(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    topic.videos.pull(videoId);
    await module.save();

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting video',
      error: error.message
    });
  }
});

// @route   GET /api/modules/:moduleId/topics/:topicId/questions
// @desc    Get questions for a specific topic
// @access  Public
router.get('/:moduleId/topics/:topicId/questions', async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Return the questions from the topic
    res.json(topic.questions || []);
  } catch (error) {
    console.error('Error fetching topic questions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching topic questions',
      error: error.message
    });
  }
});

// @route   POST /api/modules/:moduleId/topics/:topicId/questions
// @desc    Add a question to a specific topic
// @access  Public
router.post('/:moduleId/topics/:topicId/questions', async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    const { question, options, correctAnswer, explanation, type, scenario, maxAttempts } = req.body;
    
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Create new question object
    const newQuestion = {
      question,
      options,
      correctAnswer,
      explanation,
      type,
      scenario,
      maxAttempts,
      createdAt: new Date()
    };

    // Add question to topic's questions array
    if (!topic.questions) {
      topic.questions = [];
    }
    topic.questions.push(newQuestion);

    // Save the module
    await module.save();

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: newQuestion
    });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding question',
      error: error.message
    });
  }
});

// @route   GET /api/modules/:moduleId/topics/:topicId/notes
// @desc    Get notes for a specific topic
// @access  Public
router.get('/:moduleId/topics/:topicId/notes', async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Return the notes from the topic
    res.json(topic.notes || []);
  } catch (error) {
    console.error('Error fetching topic notes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching topic notes',
      error: error.message
    });
  }
});

// @route   POST /api/modules/:moduleId/topics/:topicId/notes
// @desc    Upload a note for a specific topic
// @access  Public
router.post('/:moduleId/topics/:topicId/notes', upload.single('note'), async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    const { title } = req.body;
    
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Note file is required'
      });
    }

    // Create new note object with actual file path
    const newNote = {
      title,
      fileUrl: `/uploads/modules/${req.file.filename}`, // Real file path
      fileType: req.file.mimetype,
      uploadedAt: new Date()
    };

    // Add note to topic's notes array
    if (!topic.notes) {
      topic.notes = [];
    }
    topic.notes.push(newNote);

    // Save the module
    await module.save();

    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully',
      data: newNote
    });
  } catch (error) {
    console.error('Error uploading note:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading note',
      error: error.message
    });
  }
});

// @route   GET /api/modules/:moduleId/topics/:topicId/links
// @desc    Get links for a specific topic
// @access  Public
router.get('/:moduleId/topics/:topicId/links', async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Return the links from the topic
    res.json(topic.links || []);
  } catch (error) {
    console.error('Error fetching topic links:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching topic links',
      error: error.message
    });
  }
});

// @route   POST /api/modules/:moduleId/topics/:topicId/links
// @desc    Add a link to a specific topic
// @access  Public
router.post('/:moduleId/topics/:topicId/links', async (req, res) => {
  try {
    const { moduleId, topicId } = req.params;
    const { title, url, description, type } = req.body;
    
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const topic = module.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Create new link object
    const newLink = {
      title,
      url,
      description,
      type,
      createdAt: new Date()
    };

    // Add link to topic's links array
    if (!topic.links) {
      topic.links = [];
    }
    topic.links.push(newLink);

    // Save the module
    await module.save();

    res.status(201).json({
      success: true,
      message: 'Link added successfully',
      data: newLink
    });
  } catch (error) {
    console.error('Error adding link:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding link',
      error: error.message
    });
  }
});

module.exports = router;
