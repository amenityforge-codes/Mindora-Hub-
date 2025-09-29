const express = require('express');
const { body, validationResult } = require('express-validator');
const Progress = require('../models/Progress');
const Module = require('../models/Module');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/progress
// @desc    Get user's progress across all modules
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const userId = req.user._id;

    // Build query
    const query = { userId };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    const progress = await Progress.find(query)
      .populate('moduleId', 'title moduleType ageRange difficulty estimatedDuration')
      .sort({ 'completion.lastActivity': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Progress.countDocuments(query);

    // Get summary statistics
    const summary = await Progress.getUserProgressSummary(userId);

    res.json({
      success: true,
      data: {
        progress,
        summary,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: progress.length,
          totalCount: total
        }
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching progress'
    });
  }
});

// @route   GET /api/progress/:moduleId
// @desc    Get user's progress for specific module
// @access  Private
router.get('/:moduleId', authenticate, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user._id;

    const progress = await Progress.findOne({ userId, moduleId })
      .populate('moduleId', 'title moduleType ageRange difficulty estimatedDuration content')
      .populate('scores.quiz.attempts.answers.questionId');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found for this module'
      });
    }

    res.json({
      success: true,
      data: {
        progress
      }
    });
  } catch (error) {
    console.error('Get module progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching module progress'
    });
  }
});

// @route   POST /api/progress
// @desc    Create or update progress for a module
// @access  Private
router.post('/', authenticate, [
  body('moduleId').isMongoId().withMessage('Valid module ID is required'),
  body('step').isInt({ min: 0 }).withMessage('Step must be a non-negative integer'),
  body('percentage').isFloat({ min: 0, max: 100 }).withMessage('Percentage must be between 0 and 100'),
  body('timeSpent').optional().isFloat({ min: 0 }).withMessage('Time spent must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { moduleId, step, percentage, timeSpent = 0 } = req.body;
    const userId = req.user._id;

    // Verify module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Find or create progress
    let progress = await Progress.findOne({ userId, moduleId });
    
    if (!progress) {
      progress = new Progress({
        userId,
        moduleId,
        progress: {
          totalSteps: module.content?.objectives?.length || 1
        }
      });
    }

    // Update progress
    await progress.updateProgress(step, percentage, timeSpent);

    // Update user's overall progress
    const user = await User.findById(userId);
    if (percentage >= 100) {
      user.progress.totalModulesCompleted += 1;
      await user.addBadge('module-complete', `Completed ${module.title}`);
    }
    
    user.progress.totalTimeSpent += timeSpent;
    user.progress.lastActivity = new Date();
    await user.save();

    // Update module analytics
    await module.updateAnalytics({
      completed: percentage >= 100,
      timeSpent: timeSpent
    });

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        progress: {
          status: progress.status,
          percentage: progress.progress.percentage,
          currentStep: progress.progress.currentStep,
          timeSpent: progress.timeSpent.total
        }
      }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating progress'
    });
  }
});

// @route   POST /api/progress/:moduleId/quiz
// @desc    Submit quiz attempt
// @access  Private
router.post('/:moduleId/quiz', authenticate, [
  body('answers').isArray().withMessage('Answers must be an array'),
  body('timeSpent').isFloat({ min: 0 }).withMessage('Time spent must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { moduleId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user._id;

    // Get module and quiz
    const module = await Module.findById(moduleId).populate('quiz');
    if (!module || !module.quiz) {
      return res.status(404).json({
        success: false,
        message: 'Module or quiz not found'
      });
    }

    // Calculate score
    let score = 0;
    let totalMarks = 0;
    const detailedAnswers = [];

    module.quiz.questions.forEach((question, index) => {
      totalMarks += question.marks;
      const userAnswer = answers[index];
      const isCorrect = checkAnswer(question, userAnswer);
      
      if (isCorrect) {
        score += question.marks;
      }

      detailedAnswers.push({
        questionId: question._id,
        userAnswer: userAnswer,
        isCorrect: isCorrect,
        timeSpent: userAnswer.timeSpent || 0
      });
    });

    // Find or create progress
    let progress = await Progress.findOne({ userId, moduleId });
    if (!progress) {
      progress = new Progress({ userId, moduleId });
    }

    // Add quiz attempt
    await progress.addQuizAttempt({
      score,
      totalMarks,
      timeSpent,
      answers: detailedAnswers
    });

    // Update user progress
    const user = await User.findById(userId);
    await user.updateProgress(moduleId, timeSpent, score);

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        score,
        totalMarks,
        percentage: (score / totalMarks) * 100,
        passed: (score / totalMarks) * 100 >= module.quiz.settings.passingScore,
        answers: detailedAnswers
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting quiz'
    });
  }
});

// @route   POST /api/progress/:moduleId/bookmark
// @desc    Add bookmark to module
// @access  Private
router.post('/:moduleId/bookmark', authenticate, [
  body('step').isInt({ min: 0 }).withMessage('Step must be non-negative'),
  body('timestamp').optional().isFloat({ min: 0 }).withMessage('Timestamp must be non-negative'),
  body('note').optional().isString().withMessage('Note must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { moduleId } = req.params;
    const { step, timestamp, note } = req.body;
    const userId = req.user._id;

    // Find or create progress
    let progress = await Progress.findOne({ userId, moduleId });
    if (!progress) {
      progress = new Progress({ userId, moduleId });
    }

    await progress.addBookmark(step, timestamp, note);

    res.json({
      success: true,
      message: 'Bookmark added successfully',
      data: {
        bookmark: {
          step,
          timestamp,
          note,
          createdAt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding bookmark'
    });
  }
});

// @route   POST /api/progress/:moduleId/note
// @desc    Add note to module
// @access  Private
router.post('/:moduleId/note', authenticate, [
  body('step').isInt({ min: 0 }).withMessage('Step must be non-negative'),
  body('content').isString().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { moduleId } = req.params;
    const { step, content } = req.body;
    const userId = req.user._id;

    // Find or create progress
    let progress = await Progress.findOne({ userId, moduleId });
    if (!progress) {
      progress = new Progress({ userId, moduleId });
    }

    await progress.addNote(step, content);

    res.json({
      success: true,
      message: 'Note added successfully',
      data: {
        note: {
          step,
          content,
          createdAt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding note'
    });
  }
});

// @route   POST /api/progress/:moduleId/feedback
// @desc    Submit feedback for module
// @access  Private
router.post('/:moduleId/feedback', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().withMessage('Comment must be a string'),
  body('helpful').isBoolean().withMessage('Helpful must be a boolean'),
  body('difficulty').optional().isIn(['too-easy', 'just-right', 'too-hard']).withMessage('Invalid difficulty rating')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { moduleId } = req.params;
    const { rating, comment, helpful, difficulty } = req.body;
    const userId = req.user._id;

    // Find or create progress
    let progress = await Progress.findOne({ userId, moduleId });
    if (!progress) {
      progress = new Progress({ userId, moduleId });
    }

    // Update feedback
    progress.feedback = {
      rating,
      comment,
      helpful,
      difficulty,
      submittedAt: new Date()
    };

    await progress.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting feedback'
    });
  }
});

// @route   POST /api/progress/session/end
// @desc    End current learning session
// @access  Private
router.post('/session/end', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { moduleId } = req.body;

    if (moduleId) {
      const progress = await Progress.findOne({ userId, moduleId });
      if (progress) {
        await progress.endSession();
      }
    }

    res.json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while ending session'
    });
  }
});

// Helper function to check quiz answers
function checkAnswer(question, userAnswer) {
  switch (question.type) {
    case 'mcq':
      return question.options[userAnswer]?.isCorrect || false;
    case 'true-false':
      return userAnswer === question.correctAnswer;
    case 'fill-blank':
      return userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    default:
      return false;
  }
}

module.exports = router;

