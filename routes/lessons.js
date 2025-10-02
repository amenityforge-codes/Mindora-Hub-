const express = require('express');
const Lesson = require('../models/Lesson');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/lessons
// @desc    Get all lessons
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('=== LESSONS API CALLED ===');
    
    const { category, difficulty, isActive } = req.query;
    const filter = {
      ageRange: '6-15', // Force children age range
      isActive: isActive !== 'false' // Default to active lessons
    };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    console.log('Lessons filter:', filter);
    
    const lessons = await Lesson.find(filter)
      .sort({ createdAt: -1 });
    
    console.log(`Found ${lessons.length} lessons`);
    
    res.json({
      success: true,
      message: 'Lessons retrieved successfully',
      data: { lessons }
    });
    
  } catch (error) {
    console.error('Error fetching lessons:', error);
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
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Lesson retrieved successfully',
      data: { lesson }
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

// @route   POST /api/lessons
// @desc    Create a new lesson
// @access  Private (Admin only)
router.post('/', auth.authenticate, async (req, res) => {
  try {
    console.log('=== LESSON CREATION ===');
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

    // Create new lesson
    const newLesson = new Lesson({
      title,
      description,
      category,
      difficulty: difficulty || 'intermediate',
      duration: duration || 30, // minutes
      content: content || '',
      objectives: objectives || [],
      prerequisites: prerequisites || [],
      ageRange: '6-15', // Force children age range
      isActive: isActive !== false,
      tags: tags || [],
      createdBy: req.userId // From auth middleware
    });

    await newLesson.save();
    
    console.log('✅ Lesson created:', newLesson.title);
    
    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: newLesson
    });
    
  } catch (error) {
    console.error('❌ Error creating lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating lesson',
      error: error.message
    });
  }
});

// @route   POST /api/lessons/save
// @desc    Save lesson data
// @access  Private (Admin only)
router.post('/save', auth.authenticate, async (req, res) => {
  try {
    console.log('=== LESSON SAVE ===');
    console.log('Request body:', req.body);
    
    const { lessons } = req.body;
    
    if (!lessons || !Array.isArray(lessons)) {
      return res.status(400).json({
        success: false,
        message: 'Lessons array is required'
      });
    }
    
    const savedLessons = [];
    
    for (const lessonData of lessons) {
      // Ensure age range is set to children
      lessonData.ageRange = '6-15';
      lessonData.createdBy = req.userId;
      
      const newLesson = new Lesson(lessonData);
      await newLesson.save();
      savedLessons.push(newLesson);
      
      console.log('✅ Lesson saved:', newLesson.title);
    }
    
    res.status(201).json({
      success: true,
      message: `${savedLessons.length} lessons saved successfully`,
      data: { lessons: savedLessons }
    });
    
  } catch (error) {
    console.error('❌ Error saving lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving lessons',
      error: error.message
    });
  }
});

// @route   PUT /api/lessons/:id
// @desc    Update a lesson
// @access  Private (Admin only)
router.put('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== LESSON UPDATE ===');
    console.log('Lesson ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const lesson = await Lesson.findOne({
      _id: req.params.id,
      ageRange: '6-15', // Ensure it's a children lesson
      createdBy: req.userId // Ensure user owns the lesson
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found or you do not have permission to modify it'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        lesson[key] = req.body[key];
      }
    });

    await lesson.save();
    
    console.log('✅ Lesson updated:', lesson.title);
    
    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson
    });
    
  } catch (error) {
    console.error('❌ Error updating lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating lesson',
      error: error.message
    });
  }
});

// @route   DELETE /api/lessons/:id
// @desc    Delete a lesson
// @access  Private (Admin only)
router.delete('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== LESSON DELETION ===');
    console.log('Lesson ID:', req.params.id);
    
    const lesson = await Lesson.findOne({
      _id: req.params.id,
      ageRange: '6-15', // Ensure it's a children lesson
      createdBy: req.userId // Ensure user owns the lesson
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found or you do not have permission to delete it'
      });
    }

    await Lesson.findByIdAndDelete(req.params.id);
    
    console.log('✅ Lesson deleted:', lesson.title);
    
    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting lesson',
      error: error.message
    });
  }
});

module.exports = router;
