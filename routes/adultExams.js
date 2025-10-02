const express = require('express');
const Exam = require('../models/Exam');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/adult-exams
// @desc    Get all adult exams
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('=== ADULT EXAMS API CALLED ===');
    
    const { category, difficulty, isActive } = req.query;
    const filter = {
      ageRange: '16+', // Force adult age range
      isActive: isActive !== 'false' // Default to active exams
    };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    console.log('Adult Exams filter:', filter);
    
    const exams = await Exam.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${exams.length} adult exams`);
    
    res.json({
      success: true,
      data: exams
    });
    
  } catch (error) {
    console.error('Error fetching adult exams:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult exams',
      error: error.message
    });
  }
});

// @route   POST /api/adult-exams
// @desc    Create a new adult exam
// @access  Private (Admin only)
router.post('/', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT EXAM CREATION ===');
    console.log('Request body:', req.body);
    
    const {
      title,
      description,
      category,
      difficulty,
      duration,
      passingScore,
      questions,
      isActive,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and questions are required'
      });
    }

    // Create new adult exam
    const newExam = new Exam({
      title,
      description,
      category,
      difficulty: difficulty || 'intermediate',
      duration: duration || 60, // minutes
      passingScore: passingScore || 70,
      ageRange: '16+', // Force adult age range
      questions: questions || [],
      isActive: isActive !== false,
      tags: tags || [],
      createdBy: req.userId // From auth middleware
    });

    await newExam.save();
    
    console.log('✅ Adult exam created:', newExam.title);
    
    res.status(201).json({
      success: true,
      message: 'Adult exam created successfully',
      data: newExam
    });
    
  } catch (error) {
    console.error('❌ Error creating adult exam:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating adult exam',
      error: error.message
    });
  }
});

// @route   PUT /api/adult-exams/:id
// @desc    Update an adult exam
// @access  Private (Admin only)
router.put('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT EXAM UPDATE ===');
    console.log('Exam ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const exam = await Exam.findOne({
      _id: req.params.id,
      ageRange: '16+', // Ensure it's an adult exam
      createdBy: req.userId // Ensure user owns the exam
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Adult exam not found or you do not have permission to modify it'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        exam[key] = req.body[key];
      }
    });

    await exam.save();
    
    console.log('✅ Adult exam updated:', exam.title);
    
    res.json({
      success: true,
      message: 'Adult exam updated successfully',
      data: exam
    });
    
  } catch (error) {
    console.error('❌ Error updating adult exam:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating adult exam',
      error: error.message
    });
  }
});

// @route   DELETE /api/adult-exams/:id
// @desc    Delete an adult exam
// @access  Private (Admin only)
router.delete('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT EXAM DELETION ===');
    console.log('Exam ID:', req.params.id);
    
    const exam = await Exam.findOne({
      _id: req.params.id,
      ageRange: '16+', // Ensure it's an adult exam
      createdBy: req.userId // Ensure user owns the exam
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Adult exam not found or you do not have permission to delete it'
      });
    }

    await Exam.findByIdAndDelete(req.params.id);
    
    console.log('✅ Adult exam deleted:', exam.title);
    
    res.json({
      success: true,
      message: 'Adult exam deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting adult exam:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting adult exam',
      error: error.message
    });
  }
});

module.exports = router;
