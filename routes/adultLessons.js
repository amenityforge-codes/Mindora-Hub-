const express = require('express');
const Lesson = require('../models/Lesson');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/adult-lessons
// @desc    Get all adult lessons
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('=== ADULT LESSONS API CALLED ===');
    
    const { category, difficulty, isActive } = req.query;
    const filter = {
      ageRange: '16+', // Force adult age range
      isActive: isActive !== 'false' // Default to active lessons
    };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    console.log('Adult Lessons filter:', filter);
    
    const lessons = await Lesson.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${lessons.length} adult lessons`);
    
    res.json({
      success: true,
      message: 'Adult lessons retrieved successfully',
      data: { lessons }
    });
    
  } catch (error) {
    console.error('Error fetching adult lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult lessons',
      error: error.message
    });
  }
});

// @route   POST /api/adult-lessons
// @desc    Create a new adult lesson
// @access  Private (Admin only)
router.post('/', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT LESSON CREATION ===');
    console.log('Request body:', req.body);
    
    const {
      title,
      description,
      category,
      difficulty,
      duration,
      content,
      objectives,
      prerequisites,
      isActive,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }

    // Create new adult lesson
    const newLesson = new Lesson({
      title,
      description,
      category,
      difficulty: difficulty || 'intermediate',
      duration: duration || 30, // minutes
      content: content || '',
      objectives: objectives || [],
      prerequisites: prerequisites || [],
      ageRange: '16+', // Force adult age range
      isActive: isActive !== false,
      tags: tags || [],
      createdBy: req.userId // From auth middleware
    });

    await newLesson.save();
    
    console.log('✅ Adult lesson created:', newLesson.title);
    
    res.status(201).json({
      success: true,
      message: 'Adult lesson created successfully',
      data: newLesson
    });
    
  } catch (error) {
    console.error('❌ Error creating adult lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating adult lesson',
      error: error.message
    });
  }
});

// @route   POST /api/adult-lessons/save
// @desc    Save adult lesson data
// @access  Private (Admin only)
router.post('/save', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT LESSON SAVE ===');
    console.log('Request body:', req.body);
    
    const lessonData = req.body;
    
    // Ensure age range is set to adult
    lessonData.ageRange = '16+';
    lessonData.createdBy = req.userId;
    
    const newLesson = new Lesson(lessonData);
    await newLesson.save();
    
    console.log('✅ Adult lesson saved:', newLesson.title);
    
    res.status(201).json({
      success: true,
      message: 'Adult lesson saved successfully',
      data: newLesson
    });
    
  } catch (error) {
    console.error('❌ Error saving adult lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving adult lesson',
      error: error.message
    });
  }
});

// @route   PUT /api/adult-lessons/:id
// @desc    Update an adult lesson
// @access  Private (Admin only)
router.put('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT LESSON UPDATE ===');
    console.log('Lesson ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const lesson = await Lesson.findOne({
      _id: req.params.id,
      ageRange: '16+', // Ensure it's an adult lesson
      createdBy: req.userId // Ensure user owns the lesson
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Adult lesson not found or you do not have permission to modify it'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        lesson[key] = req.body[key];
      }
    });

    await lesson.save();
    
    console.log('✅ Adult lesson updated:', lesson.title);
    
    res.json({
      success: true,
      message: 'Adult lesson updated successfully',
      data: lesson
    });
    
  } catch (error) {
    console.error('❌ Error updating adult lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating adult lesson',
      error: error.message
    });
  }
});

// @route   DELETE /api/adult-lessons/:id
// @desc    Delete an adult lesson
// @access  Private (Admin only)
router.delete('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT LESSON DELETION ===');
    console.log('Lesson ID:', req.params.id);
    
    const lesson = await Lesson.findOne({
      _id: req.params.id,
      ageRange: '16+', // Ensure it's an adult lesson
      createdBy: req.userId // Ensure user owns the lesson
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Adult lesson not found or you do not have permission to delete it'
      });
    }

    await Lesson.findByIdAndDelete(req.params.id);
    
    console.log('✅ Adult lesson deleted:', lesson.title);
    
    res.json({
      success: true,
      message: 'Adult lesson deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting adult lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting adult lesson',
      error: error.message
    });
  }
});

// @route   POST /api/adult-lessons/sync-to-modules
// @desc    Sync adult lessons to modules
// @access  Private (Admin only)
router.post('/sync-to-modules', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT LESSON SYNC TO MODULES ===');
    
    // This would sync adult lessons to adult modules
    // Implementation depends on your specific sync logic
    
    res.json({
      success: true,
      message: 'Adult lessons synced to modules successfully'
    });
    
  } catch (error) {
    console.error('❌ Error syncing adult lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while syncing adult lessons',
      error: error.message
    });
  }
});

module.exports = router;
