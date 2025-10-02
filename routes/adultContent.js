const express = require('express');
const Module = require('../models/Module');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/adult-content
// @desc    Get all adult content
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('=== ADULT CONTENT API CALLED ===');
    
    const { moduleType, difficulty, limit, page, featured, weekly } = req.query;
    const filter = {
      ageRange: '16+', // Force adult age range
      status: 'published'
    };
    
    if (moduleType) filter.moduleType = moduleType;
    if (difficulty) filter.difficulty = difficulty;
    if (featured === 'true') filter.isFeatured = true;
    if (weekly === 'true') filter.weekly = true;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    
    console.log('Adult Content filter:', filter);
    
    const [content, totalCount] = await Promise.all([
      Module.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Module.countDocuments(filter)
    ]);
    
    console.log(`Found ${content.length} adult content items out of ${totalCount} total`);
    
    res.json({
      success: true,
      message: 'Adult content retrieved successfully',
      data: { 
        modules: content,
        totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
    
  } catch (error) {
    console.error('Error fetching adult content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult content',
      error: error.message
    });
  }
});

// @route   POST /api/adult-content
// @desc    Create new adult content
// @access  Private (Admin only)
router.post('/', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT CONTENT CREATION ===');
    console.log('Request body:', req.body);
    
    const {
      title,
      description,
      moduleType,
      ageRange,
      difficulty,
      estimatedDuration,
      content,
      media,
      tags,
      isFeatured,
      isPremium,
      publishAt
    } = req.body;

    // Validate required fields
    if (!title || !description || !moduleType) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and module type are required'
      });
    }

    // Create new adult content with full module structure
    const newContent = new Module({
      title,
      description,
      moduleType,
      ageRange: '16+', // Force adult age range
      difficulty: difficulty || 'beginner',
      estimatedDuration: estimatedDuration || 30,
      content: content || {
        text: '',
        instructions: '',
        objectives: []
      },
      media: media || {
        video: { url: '', duration: 0, thumbnail: '', transcript: '', subtitles: '' },
        audio: { url: '', duration: 0, transcript: '' },
        pdf: { url: '', pages: 0, title: '' },
        images: []
      },
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []),
      isFeatured: isFeatured || false,
      isPremium: isPremium || false,
      status: 'published',
      publishAt: publishAt ? new Date(publishAt) : new Date(),
      createdBy: req.userId // From auth middleware
    });

    await newContent.save();
    
    console.log('✅ Adult content created:', newContent.title);
    
    res.status(201).json({
      success: true,
      message: 'Adult content created successfully',
      data: { module: newContent }
    });
    
  } catch (error) {
    console.error('❌ Error creating adult content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating adult content',
      error: error.message
    });
  }
});

// @route   PUT /api/adult-content/:id
// @desc    Update adult content
// @access  Private (Admin only)
router.put('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT CONTENT UPDATE ===');
    console.log('Content ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const content = await Module.findOne({
      _id: req.params.id,
      ageRange: '16+', // Ensure it's adult content
      createdBy: req.userId // Ensure user owns the content
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Adult content not found or you do not have permission to modify it'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        content[key] = req.body[key];
      }
    });

    await content.save();
    
    console.log('✅ Adult content updated:', content.title);
    
    res.json({
      success: true,
      message: 'Adult content updated successfully',
      data: content
    });
    
  } catch (error) {
    console.error('❌ Error updating adult content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating adult content',
      error: error.message
    });
  }
});

// @route   DELETE /api/adult-content/:id
// @desc    Delete adult content
// @access  Private (Admin only)
router.delete('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT CONTENT DELETION ===');
    console.log('Content ID:', req.params.id);
    
    const content = await Module.findOne({
      _id: req.params.id,
      ageRange: '16+', // Ensure it's adult content
      createdBy: req.userId // Ensure user owns the content
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Adult content not found or you do not have permission to delete it'
      });
    }

    await Module.findByIdAndDelete(req.params.id);
    
    console.log('✅ Adult content deleted:', content.title);
    
    res.json({
      success: true,
      message: 'Adult content deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting adult content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting adult content',
      error: error.message
    });
  }
});

module.exports = router;
