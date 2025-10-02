const express = require('express');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/adult-videos
// @desc    Get all adult videos
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('=== ADULT VIDEOS API CALLED ===');
    
    const { category, type, isActive } = req.query;
    const filter = {
      ageRange: '16+', // Force adult age range
      isActive: isActive !== 'false' // Default to active videos
    };
    
    if (category) filter.category = category;
    if (type) filter.type = type;
    
    console.log('Adult Videos filter:', filter);
    
    const videos = await Video.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${videos.length} adult videos`);
    
    res.json({
      success: true,
      message: 'Adult videos retrieved successfully',
      data: { videos }
    });
    
  } catch (error) {
    console.error('Error fetching adult videos:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult videos',
      error: error.message
    });
  }
});

// @route   POST /api/adult-videos
// @desc    Create new adult video
// @access  Private (Admin only)
router.post('/', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT VIDEO CREATION ===');
    console.log('Request body:', req.body);
    
    const {
      title,
      description,
      category,
      type,
      duration,
      url,
      thumbnail,
      tags,
      isActive
    } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }

    // Create new adult video
    const newVideo = new Video({
      title,
      description,
      category,
      type: type || 'educational',
      duration: duration || 0,
      url: url || '',
      thumbnail: thumbnail || '',
      ageRange: '16+', // Force adult age range
      isActive: isActive !== false,
      tags: tags || [],
      createdBy: req.userId // From auth middleware
    });

    await newVideo.save();
    
    console.log('✅ Adult video created:', newVideo.title);
    
    res.status(201).json({
      success: true,
      message: 'Adult video created successfully',
      data: newVideo
    });
    
  } catch (error) {
    console.error('❌ Error creating adult video:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating adult video',
      error: error.message
    });
  }
});

// @route   PUT /api/adult-videos/:id
// @desc    Update adult video
// @access  Private (Admin only)
router.put('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT VIDEO UPDATE ===');
    console.log('Video ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const video = await Video.findOne({
      _id: req.params.id,
      ageRange: '16+', // Ensure it's adult video
      createdBy: req.userId // Ensure user owns the video
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Adult video not found or you do not have permission to modify it'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        video[key] = req.body[key];
      }
    });

    await video.save();
    
    console.log('✅ Adult video updated:', video.title);
    
    res.json({
      success: true,
      message: 'Adult video updated successfully',
      data: video
    });
    
  } catch (error) {
    console.error('❌ Error updating adult video:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating adult video',
      error: error.message
    });
  }
});

// @route   DELETE /api/adult-videos/:id
// @desc    Delete adult video
// @access  Private (Admin only)
router.delete('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT VIDEO DELETION ===');
    console.log('Video ID:', req.params.id);
    
    const video = await Video.findOne({
      _id: req.params.id,
      ageRange: '16+', // Ensure it's adult video
      createdBy: req.userId // Ensure user owns the video
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Adult video not found or you do not have permission to delete it'
      });
    }

    await Video.findByIdAndDelete(req.params.id);
    
    console.log('✅ Adult video deleted:', video.title);
    
    res.json({
      success: true,
      message: 'Adult video deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting adult video:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting adult video',
      error: error.message
    });
  }
});

module.exports = router;
