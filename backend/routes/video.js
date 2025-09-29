const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/videos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept video files only
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: fileFilter
});

// @route   POST /api/video/upload
// @desc    Upload a new video
// @access  Admin only
router.post('/upload', adminAuth, upload.single('video'), async (req, res) => {
  try {
    const {
      title,
      description,
      level,
      moduleId,
      duration,
      tags,
      thumbnail
    } = req.body;

    // Validate required fields
    if (!title || !level || !moduleId || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Title, level, moduleId, and video file are required'
      });
    }

    // Create video record
    const video = new Video({
      title,
      description: description || '',
      level: parseInt(level),
      moduleId,
      duration: duration ? parseInt(duration) : 0,
      videoUrl: `/uploads/videos/${req.file.filename}`,
      thumbnail: thumbnail || null,
      tags: tags ? JSON.parse(tags) : [],
      uploadedBy: req.user.id,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    await video.save();

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        video: {
          id: video._id,
          title: video.title,
          description: video.description,
          level: video.level,
          moduleId: video.moduleId,
          duration: video.duration,
          videoUrl: video.videoUrl,
          thumbnail: video.thumbnail,
          tags: video.tags,
          uploadedAt: video.uploadedAt
        }
      }
    });

  } catch (error) {
    console.error('Video upload error:', error);
    
    // Clean up uploaded file if database save fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during video upload',
      error: error.message
    });
  }
});

// @route   GET /api/video
// @desc    Get all videos with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      level,
      moduleId,
      search,
      sortBy = 'uploadedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (level) filter.level = parseInt(level);
    if (moduleId) filter.moduleId = moduleId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const videos = await Video.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('moduleId', 'title')
      .populate('uploadedBy', 'name email');

    const total = await Video.countDocuments(filter);

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching videos',
      error: error.message
    });
  }
});

// @route   GET /api/video/:id
// @desc    Get a specific video
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('moduleId', 'title')
      .populate('uploadedBy', 'name email');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: { video }
    });

  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching video',
      error: error.message
    });
  }
});

// @route   PUT /api/video/:id
// @desc    Update a video
// @access  Admin only
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      level,
      moduleId,
      duration,
      tags,
      thumbnail
    } = req.body;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Update video fields
    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (level) video.level = parseInt(level);
    if (moduleId) video.moduleId = moduleId;
    if (duration) video.duration = parseInt(duration);
    if (tags) video.tags = JSON.parse(tags);
    if (thumbnail !== undefined) video.thumbnail = thumbnail;

    video.updatedAt = new Date();

    await video.save();

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: { video }
    });

  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating video',
      error: error.message
    });
  }
});

// @route   DELETE /api/video/:id
// @desc    Delete a video
// @access  Admin only
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Delete video file from filesystem
    const videoPath = path.join(__dirname, '..', video.videoUrl);
    if (fs.existsSync(videoPath)) {
      fs.unlink(videoPath, (err) => {
        if (err) console.error('Error deleting video file:', err);
      });
    }

    // Delete thumbnail if exists
    if (video.thumbnail) {
      const thumbnailPath = path.join(__dirname, '..', video.thumbnail);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlink(thumbnailPath, (err) => {
          if (err) console.error('Error deleting thumbnail:', err);
        });
      }
    }

    await Video.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting video',
      error: error.message
    });
  }
});

// @route   GET /api/video/module/:moduleId
// @desc    Get videos for a specific module
// @access  Public
router.get('/module/:moduleId', async (req, res) => {
  try {
    const { level } = req.query;
    
    const filter = { moduleId: req.params.moduleId };
    if (level) filter.level = parseInt(level);

    const videos = await Video.find(filter)
      .sort({ level: 1, uploadedAt: -1 })
      .populate('moduleId', 'title');

    res.json({
      success: true,
      data: { videos }
    });

  } catch (error) {
    console.error('Get module videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching module videos',
      error: error.message
    });
  }
});

// @route   GET /api/video/level/:level
// @desc    Get videos for a specific level
// @access  Public
router.get('/level/:level', async (req, res) => {
  try {
    const videos = await Video.find({ level: parseInt(req.params.level) })
      .sort({ uploadedAt: -1 })
      .populate('moduleId', 'title');

    res.json({
      success: true,
      data: { videos }
    });

  } catch (error) {
    console.error('Get level videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching level videos',
      error: error.message
    });
  }
});

// @route   POST /api/video
// @desc    Create a new video with URL (no file upload)
// @access  Admin only
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      url,
      thumbnail,
      duration,
      module,
      topic,
      topicDescription,
      sequenceOrder,
      tags,
      isPublished
    } = req.body;

    // Validate required fields
    if (!title || !url || !module) {
      return res.status(400).json({
        success: false,
        message: 'Title, URL, and module are required'
      });
    }

    // Create video object
    const videoData = {
      title,
      description: description || '',
      url,
      videoUrl: url, // Also set videoUrl for backward compatibility
      thumbnail: thumbnail || '',
      duration: duration || 0,
      moduleId: module,
      topic: topic || '',
      topicDescription: topicDescription || '',
      sequenceOrder: sequenceOrder || 1,
      tags: tags || [],
      isPublished: isPublished !== undefined ? isPublished : true,
      uploadedBy: req.user.userId,
      fileSize: 0, // Default values for required fields
      mimeType: 'video/mp4'
    };

    const video = new Video(videoData);
    await video.save();

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: video
    });

  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating video',
      error: error.message
    });
  }
});

module.exports = router;


