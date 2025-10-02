const express = require('express');
const mongoose = require('mongoose');
const Question = require('../models/Question');
const { authenticate: auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/questions
// @desc    Get all questions with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      questionType,
      difficulty,
      category,
      isActive = true,
      limit = 50,
      page = 1
    } = req.query;

    const filter = { isActive: isActive === 'true' || isActive === true };
    
    if (questionType) filter.questionType = questionType;
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;

    const questions = await Question.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments(filter);

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching questions',
      error: error.message
    });
  }
});

// @route   GET /api/questions/:id
// @desc    Get a specific question
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: { question }
    });

  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching question',
      error: error.message
    });
  }
});

// @route   POST /api/questions
// @desc    Create a new question
// @access  Admin only
router.post('/', async (req, res) => {
  try {
    console.log('Question creation request body:', JSON.stringify(req.body, null, 2));
    
    const {
      questionText,
      questionType,
      options,
      correctAnswer,
      marks,
      negativeMarks,
      explanation,
      difficulty,
      category,
      tags,
      imageUrl,
      codeSnippet,
      language
    } = req.body;

    // Validate required fields
    if (!questionText || !questionType || !marks) {
      return res.status(400).json({
        success: false,
        message: 'Question text, type, and marks are required'
      });
    }

    // Validate question type specific requirements
    if (['multiple_choice', 'multiple_select'].includes(questionType)) {
      if (!options || options.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Multiple choice questions must have at least 2 options'
        });
      }
      
      const correctOptions = options.filter(opt => opt.isCorrect);
      if (correctOptions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one option must be marked as correct'
        });
      }
      
      if (questionType === 'multiple_choice' && correctOptions.length > 1) {
        return res.status(400).json({
          success: false,
          message: 'Multiple choice questions can only have one correct answer'
        });
      }
    }

    if (['integer', 'text'].includes(questionType) && !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Integer and text questions must have a correct answer'
      });
    }

    const question = new Question({
      questionText,
      questionType,
      options: options || [],
      correctAnswer,
      marks: parseInt(marks),
      negativeMarks: parseInt(negativeMarks) || 0,
      explanation: explanation || '',
      difficulty: difficulty || 'medium',
      category: category || '',
      tags: tags || [],
      imageUrl: imageUrl || '',
      codeSnippet: codeSnippet || '',
      language: language || '',
      createdBy: new mongoose.Types.ObjectId() // Default admin user since auth is disabled
    });

    await question.save();

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: { question }
    });

  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating question',
      error: error.message
    });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update a question
// @access  Admin only
router.put('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      question[key] = updates[key];
    });

    await question.save();

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: { question }
    });

  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating question',
      error: error.message
    });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question
// @access  Admin only
router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting question',
      error: error.message
    });
  }
});

// @route   POST /api/questions/bulk
// @desc    Create multiple questions at once
// @access  Admin only
router.post('/bulk', async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Questions array is required'
      });
    }

    const createdQuestions = [];
    const errors = [];

    for (let i = 0; i < questions.length; i++) {
      try {
        const questionData = questions[i];
        
        // Validate required fields
        if (!questionData.questionText || !questionData.questionType || !questionData.marks) {
          errors.push({
            index: i,
            error: 'Question text, type, and marks are required'
          });
          continue;
        }

        const question = new Question({
          ...questionData,
          createdBy: new mongoose.Types.ObjectId()
        });

        await question.save();
        createdQuestions.push(question);

      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${createdQuestions.length} questions successfully`,
      data: {
        created: createdQuestions.length,
        total: questions.length,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Bulk create questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating questions',
      error: error.message
    });
  }
});

// @route   GET /api/questions/random/:count
// @desc    Get random questions
// @access  Public
router.get('/random/:count', async (req, res) => {
  try {
    const count = parseInt(req.params.count);
    const { difficulty, category, questionType } = req.query;

    if (isNaN(count) || count < 1 || count > 100) {
      return res.status(400).json({
        success: false,
        message: 'Count must be between 1 and 100'
      });
    }

    const filters = { isActive: true };
    if (difficulty) filters.difficulty = difficulty;
    if (category) filters.category = category;
    if (questionType) filters.questionType = questionType;

    const questions = await Question.getRandomQuestions(count, filters);

    res.json({
      success: true,
      data: { questions }
    });

  } catch (error) {
    console.error('Get random questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching random questions',
      error: error.message
    });
  }
});

module.exports = router;

