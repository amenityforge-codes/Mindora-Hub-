const express = require('express');
const Quiz = require('../backend/models/Quiz');
const { authenticate: auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// @route   POST /api/quiz
// @desc    Create a new quiz
// @access  Admin only
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      level,
      moduleId,
      timeLimit,
      passingScore,
      questions,
      topic,
      topicDescription
    } = req.body;

    // Validate required fields
    if (!title || !level || !moduleId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Title, level, moduleId, and questions are required'
      });
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question || !question.options || !Array.isArray(question.options)) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} is missing required fields`
        });
      }
      
      if (question.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must have at least 2 options`
        });
      }
      
      if (typeof question.correctAnswer !== 'number' || 
          question.correctAnswer < 0 || 
          question.correctAnswer >= question.options.length) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} has invalid correct answer index`
        });
      }
    }

    // Create quiz
    const quiz = new Quiz({
      title,
      description: description || '',
      level: parseInt(level),
      moduleId,
      timeLimit: timeLimit ? parseInt(timeLimit) : 10,
      passingScore: passingScore ? parseInt(passingScore) : 70,
      questions,
      topic: topic || null,
      topicDescription: topicDescription || null,
      createdBy: req.user.id,
      isPublished: true // Set to true so it appears in the frontend
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          level: quiz.level,
          moduleId: quiz.moduleId,
          timeLimit: quiz.timeLimit,
          passingScore: quiz.passingScore,
          questionsCount: quiz.questions.length,
          createdAt: quiz.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during quiz creation',
      error: error.message
    });
  }
});

// @route   GET /api/quiz
// @desc    Get all quizzes with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      level,
      moduleId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isPublished: true };
    if (level) filter.level = parseInt(level);
    if (moduleId) filter.moduleId = moduleId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const quizzes = await Quiz.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('moduleId', 'title')
      .populate('createdBy', 'name email')
      .select('-questions'); // Don't include questions in list view

    const total = await Quiz.countDocuments(filter);

    res.json({
      success: true,
      data: {
        quizzes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quizzes',
      error: error.message
    });
  }
});

// @route   GET /api/quiz/:id
// @desc    Get a specific quiz
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('moduleId', 'title')
      .populate('createdBy', 'name email');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    console.log('🔍 Quiz Debug - Quiz ID:', req.params.id);
    console.log('🔍 Quiz Debug - Quiz Title:', quiz.title);
    console.log('🔍 Quiz Debug - Questions Count:', quiz.questions?.length || 0);
    console.log('🔍 Quiz Debug - Questions:', quiz.questions);

    // Check if user has completed this quiz with 100% (if authenticated)
    let isCompleted = false;
    let userScore = null;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const { verifyToken } = require('../middleware/auth');
        const decoded = verifyToken(token);
        
        const QuizAttempt = require('../backend/models/QuizAttempt');
        const latestAttempt = await QuizAttempt.findOne({
          userId: decoded.userId,
          quizId: req.params.id
        }).sort({ attemptNumber: -1 });
        
        if (latestAttempt && latestAttempt.score === 100) {
          isCompleted = true;
          userScore = latestAttempt.pointsEarned;
        }
      } catch (authError) {
        // If auth fails, continue without user-specific data
        console.log('Auth check failed for quiz access:', authError.message);
      }
    }

    res.json({
      success: true,
      data: { 
        quiz,
        isCompleted,
        userScore
      }
    });

  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quiz',
      error: error.message
    });
  }
});

// @route   PUT /api/quiz/:id
// @desc    Update a quiz
// @access  Admin only
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      level,
      moduleId,
      timeLimit,
      passingScore,
      questions,
      isPublished,
      associatedVideo,
      sequenceOrder,
      unlockAfterVideo
    } = req.body;

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Update quiz fields
    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (level) quiz.level = parseInt(level);
    if (moduleId) quiz.moduleId = moduleId;
    if (timeLimit) quiz.timeLimit = parseInt(timeLimit);
    if (passingScore) quiz.passingScore = parseInt(passingScore);
    if (questions && Array.isArray(questions)) {
      // Validate questions before updating
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.question || !question.options || !Array.isArray(question.options)) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} is missing required fields`
          });
        }
        
        if (question.options.length < 2) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} must have at least 2 options`
          });
        }
        
        if (typeof question.correctAnswer !== 'number' || 
            question.correctAnswer < 0 || 
            question.correctAnswer >= question.options.length) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} has invalid correct answer index`
          });
        }
      }
      quiz.questions = questions;
    }
    if (isPublished !== undefined) quiz.isPublished = isPublished;
    if (associatedVideo !== undefined) quiz.associatedVideo = associatedVideo;
    if (sequenceOrder !== undefined) quiz.sequenceOrder = sequenceOrder;
    if (unlockAfterVideo !== undefined) quiz.unlockAfterVideo = unlockAfterVideo;

    quiz.updatedAt = new Date();

    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: { quiz }
    });

  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating quiz',
      error: error.message
    });
  }
});

// @route   DELETE /api/quiz/:id
// @desc    Delete a quiz
// @access  Admin only
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });

  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting quiz',
      error: error.message
    });
  }
});

// @route   GET /api/quiz/module/:moduleId
// @desc    Get quizzes for a specific module
// @access  Public
router.get('/module/:moduleId', async (req, res) => {
  try {
    const { level } = req.query;
    
    const filter = { 
      moduleId: req.params.moduleId, 
      isPublished: true 
    };
    if (level) filter.level = parseInt(level);

    const quizzes = await Quiz.find(filter)
      .sort({ level: 1, createdAt: -1 })
      .populate('moduleId', 'title')
      .select('-questions'); // Don't include questions in list view

    res.json({
      success: true,
      data: { quizzes }
    });

  } catch (error) {
    console.error('Get module quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching module quizzes',
      error: error.message
    });
  }
});

// @route   GET /api/quiz/level/:level
// @desc    Get quizzes for a specific level
// @access  Public
router.get('/level/:level', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ 
      level: parseInt(req.params.level), 
      isPublished: true 
    })
      .sort({ createdAt: -1 })
      .populate('moduleId', 'title')
      .select('-questions'); // Don't include questions in list view

    res.json({
      success: true,
      data: { quizzes }
    });

  } catch (error) {
    console.error('Get level quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching level quizzes',
      error: error.message
    });
  }
});

// @route   POST /api/quiz/:id/submit
// @desc    Submit quiz answers
// @access  Authenticated users
router.post('/:id/submit', auth, async (req, res) => {
  console.log('🚀 QUIZ SUBMISSION ROUTE CALLED!');
  console.log('Quiz ID:', req.params.id);
    console.log('User ID:', req.user?._id);
  console.log('Request body:', req.body);
  
  try {
    const { answers, timeSpent } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required'
      });
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (!quiz.isPublished) {
      return res.status(403).json({
        success: false,
        message: 'Quiz is not published'
      });
    }

    const QuizAttempt = require('../backend/models/QuizAttempt');
    
    // Check if user already has a 100% score - if so, prevent further attempts
    const existingAttempt = await QuizAttempt.findOne({
      userId: req.user._id,
      quizId: req.params.id
    }).sort({ attemptNumber: -1 });
    
    if (existingAttempt && existingAttempt.score === 100) {
      return res.status(400).json({
        success: false,
        message: 'Quiz already completed with perfect score. No further attempts allowed.',
        data: {
          isCompleted: true,
          userScore: existingAttempt.pointsEarned,
          attemptNumber: existingAttempt.attemptNumber
        }
      });
    }
    
    const attemptNumber = await QuizAttempt.getNextAttemptNumber(req.user._id, req.params.id);

    let correctAnswers = 0;
    const answerResults = [];

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const userAnswer = answers[i];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      }

      answerResults.push({
        questionIndex: i,
        userAnswer: userAnswer,
        isCorrect: isCorrect,
        timeSpent: 0
      });
    }

    const rawScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    
    // Calculate points based on new scoring system
    let pointsEarned = 0;
    let status = 'completed';
    let canReAttempt = true;

    console.log('🎯 Quiz Scoring Debug:');
    console.log('Raw Score:', rawScore);
    console.log('Attempt Number:', attemptNumber);
    console.log('Quiz ID:', req.params.id);
    console.log('User ID:', req.user._id);

    if (attemptNumber === 1) {
      // First attempt scoring - points equal percentage score
      pointsEarned = rawScore;
      if (rawScore === 100) {
        status = 'completed';
        canReAttempt = false; // Perfect score, no re-attempt needed
      } else {
        canReAttempt = true;
      }
    } else {
      // Re-attempt: max 85 points even if 100% correct
      pointsEarned = Math.min(rawScore, 85);
      canReAttempt = false; // Only one re-attempt allowed
    }

    console.log('Points Earned:', pointsEarned);
    console.log('Can Re-attempt:', canReAttempt);

    // Adjusted score for display (percentage) - this should be the raw score percentage
    const adjustedScore = rawScore;

    const passed = adjustedScore >= quiz.passingScore;

    const quizAttempt = new QuizAttempt({
      userId: req.user._id,
      quizId: req.params.id,
      moduleId: quiz.moduleId,
      attemptNumber: attemptNumber,
      answers: answerResults,
      score: rawScore,
      adjustedScore: adjustedScore,
      pointsEarned: pointsEarned,
      passed: passed,
      timeSpent: timeSpent || 0,
      status: status
    });
    
    try {
      await quizAttempt.save();
    } catch (saveError) {
      console.error('Error saving quiz attempt:', saveError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save quiz attempt',
        error: saveError.message
      });
    }

    await quiz.updateAnalytics(adjustedScore, passed);
    
    // Update user progress - temporarily disabled due to BSON size error
    // TODO: Fix UserProgress model to handle large documents
    try {
      const UserProgress = require('../backend/models/UserProgress');
      let userProgress = await UserProgress.findOne({
        userId: req.user._id,
        moduleId: quiz.moduleId
      });
      
      if (!userProgress) {
        userProgress = new UserProgress({
          userId: req.user._id,
          moduleId: quiz.moduleId,
          progress: {
            percentage: 0,
            status: 'not-started',
            timeSpent: 0,
            points: 0
          }
        });
      }
      
      await userProgress.updateQuizAttempt(quiz._id, adjustedScore, passed);
      const progressPercentage = Math.min(adjustedScore, 100);
      await userProgress.updateProgress({
        percentage: progressPercentage,
        timeSpent: timeSpent || 0
      });
    } catch (progressError) {
      console.log('Progress update skipped due to BSON size error:', progressError.message);
      // Continue with quiz response even if progress update fails
    }

    const responseData = {
      attemptId: quizAttempt._id,
      attemptNumber: attemptNumber,
      score: rawScore,
      adjustedScore: adjustedScore,
      pointsEarned: pointsEarned,
      passed: passed,
      status: status,
      canReAttempt: canReAttempt,
      correctAnswers: correctAnswers,
      totalQuestions: quiz.questions.length,
      passingScore: quiz.passingScore,
      timeSpent: timeSpent || 0,
      results: answerResults.map((result, index) => ({
        questionIndex: index,
        question: quiz.questions[index].question,
        userAnswer: result.userAnswer,
        correctAnswer: quiz.questions[index].correctAnswer,
        isCorrect: result.isCorrect,
        explanation: quiz.questions[index].explanation || ''
      }))
    };

    console.log('📤 Response Data:', responseData);
    console.log('🎯 Final Points Earned:', pointsEarned);

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting quiz',
      error: error.message
    });
  }
});

// @route   GET /api/quiz/admin/all
// @desc    Get all quizzes for admin (including unpublished)
// @access  Admin only
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      level,
      moduleId,
      search,
      isPublished,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (level) filter.level = parseInt(level);
    if (moduleId) filter.moduleId = moduleId;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const quizzes = await Quiz.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('moduleId', 'title')
      .populate('createdBy', 'name email');

    const total = await Quiz.countDocuments(filter);

    res.json({
      success: true,
      data: {
        quizzes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get admin quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching admin quizzes',
      error: error.message
    });
  }
});

module.exports = router;
