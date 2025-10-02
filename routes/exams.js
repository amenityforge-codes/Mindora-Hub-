const express = require('express');
const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const ExamAttempt = require('../models/ExamAttempt');
const Certificate = require('../models/Certificate');
const { authenticate: auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/exams
// @desc    Get all exams (public for students, admin for management)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      difficulty,
      isActive = true,
      isPublished = true,
      limit = 50,
      page = 1
    } = req.query;

    const filter = { isActive: isActive === 'true' || isActive === true };
    
    if (isPublished !== 'false') {
      filter.isPublished = isPublished === 'true' || isPublished === true;
    }
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const exams = await Exam.find(filter)
      .populate('questions', 'questionText questionType marks difficulty')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Exam.countDocuments(filter);

    res.json({
      success: true,
      data: {
        exams,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching exams',
      error: error.message
    });
  }
});

// @route   GET /api/exams/attempts/user/:userId
// @desc    Get user exam attempts
// @access  Public
router.get('/attempts/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const attempts = await ExamAttempt.find({ student: userId })
      .populate('exam', 'title description category difficulty')
      .sort({ completedAt: -1 });

    res.json({
      success: true,
      data: { attempts }
    });

  } catch (error) {
    console.error('Get user attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user attempts',
      error: error.message
    });
  }
});

// @route   GET /api/exams/:id
// @desc    Get a specific exam
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('questions')
      .populate('createdBy', 'name email');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.json({
      success: true,
      data: { exam }
    });

  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching exam',
      error: error.message
    });
  }
});

// @route   POST /api/exams
// @desc    Create a new exam
// @access  Admin only
router.post('/', async (req, res) => {
  try {
    console.log('Exam creation request body:', JSON.stringify(req.body, null, 2));
    
    const {
      title,
      description,
      duration,
      passingMarks,
      totalMarks,
      questions,
      startDate,
      endDate,
      instructions,
      allowMultipleAttempts,
      maxAttempts,
      category,
      difficulty
    } = req.body;

    // Validate required fields
    if (!title || !description || !duration || !passingMarks || !totalMarks || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, duration, passing marks, total marks, start date, and end date are required'
      });
    }

    // Validate questions exist (if any)
    let questionIds = [];
    if (questions && questions.length > 0) {
      questionIds = questions.map(q => mongoose.Types.ObjectId(q));
      const existingQuestions = await Question.find({ _id: { $in: questionIds } });
      
      if (existingQuestions.length !== questions.length) {
        return res.status(400).json({
          success: false,
          message: 'Some questions do not exist'
        });
      }
    }

    const exam = new Exam({
      title,
      description,
      duration: parseInt(duration),
      passingMarks: parseInt(passingMarks),
      totalMarks: parseInt(totalMarks),
      questions: questionIds,
      startDate: new Date(), // Start immediately
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // End in 1 year
      instructions: instructions || '',
      allowMultipleAttempts: allowMultipleAttempts || false,
      maxAttempts: parseInt(maxAttempts) || 1,
      category: category || 'certification',
      difficulty: difficulty || 'medium',
      isActive: true,
      isPublished: true,
      createdBy: new mongoose.Types.ObjectId() // Default admin user since auth is disabled
    });

    await exam.save();

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: { exam }
    });

  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating exam',
      error: error.message
    });
  }
});

// @route   PUT /api/exams/:id
// @desc    Update an exam
// @access  Admin only
router.put('/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      exam[key] = updates[key];
    });

    await exam.save();

    res.json({
      success: true,
      message: 'Exam updated successfully',
      data: { exam }
    });

  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating exam',
      error: error.message
    });
  }
});

// @route   DELETE /api/exams/:id
// @desc    Delete an exam
// @access  Admin only
router.delete('/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    await Exam.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });

  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting exam',
      error: error.message
    });
  }
});

// @route   GET /api/exams/:id/statistics
// @desc    Get exam statistics
// @access  Admin only
router.get('/:id/statistics', async (req, res) => {
  try {
    const examId = req.params.id;
    
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    const statistics = await ExamAttempt.getExamStatistics(examId);
    const topPerformers = await ExamAttempt.getTopPerformers(examId, 10);

    res.json({
      success: true,
      data: {
        exam: {
          title: exam.title,
          totalMarks: exam.totalMarks,
          passingMarks: exam.passingMarks,
          duration: exam.duration
        },
        statistics: statistics[0] || {
          totalAttempts: 0,
          averageScore: 0,
          averagePercentage: 0,
          passedAttempts: 0,
          failedAttempts: 0,
          highestScore: 0,
          lowestScore: 0
        },
        topPerformers
      }
    });

  } catch (error) {
    console.error('Get exam statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching exam statistics',
      error: error.message
    });
  }
});

// @route   POST /api/exams/:id/start
// @desc    Start an exam attempt
// @access  Public (for students)
router.post('/:id/start', async (req, res) => {
  try {
    const examId = req.params.id;
    const { studentId } = req.body;

    console.log('Start exam request:', { examId, studentId, body: req.body });

    if (!studentId) {
      console.log('Missing studentId in request');
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if exam is active
    const now = new Date();
    console.log('Exam dates check:', {
      now: now.toISOString(),
      startDate: exam.startDate.toISOString(),
      endDate: exam.endDate.toISOString(),
      isActive: exam.isActive,
      isPublished: exam.isPublished
    });
    
    if (now < exam.startDate) {
      console.log('Exam has not started yet');
      return res.status(400).json({
        success: false,
        message: 'Exam has not started yet'
      });
    }
    if (now > exam.endDate) {
      console.log('Exam has ended');
      return res.status(400).json({
        success: false,
        message: 'Exam has ended'
      });
    }

    // Check if student has already attempted
    const existingAttempt = await ExamAttempt.findOne({
      exam: examId,
      student: studentId,
      status: 'in_progress'
    });

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active attempt for this exam'
      });
    }

    // Check attempt limits
    if (!exam.allowMultipleAttempts) {
      const previousAttempts = await ExamAttempt.countDocuments({
        exam: examId,
        student: studentId
      });

      if (previousAttempts >= exam.maxAttempts) {
        return res.status(400).json({
          success: false,
          message: 'Maximum attempts reached for this exam'
        });
      }
    }

    // Create new attempt
    console.log('Creating new exam attempt for:', { examId, studentId });
    const attempt = new ExamAttempt({
      exam: examId,
      student: studentId,
      startTime: new Date(),
      status: 'in_progress'
    });

    await attempt.save();
    console.log('Exam attempt created successfully:', attempt._id);

    res.json({
      success: true,
      message: 'Exam started successfully',
      data: {
        attemptId: attempt._id,
        exam: {
          title: exam.title,
          duration: exam.duration,
          totalMarks: exam.totalMarks,
          questions: exam.questions.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            marks: q.marks
          }))
        }
      }
    });

  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting exam',
      error: error.message
    });
  }
});

// @route   POST /api/exams/:id/submit
// @desc    Submit exam answers
// @access  Public (for students)
router.post('/:id/submit', async (req, res) => {
  try {
    const examId = req.params.id;
    const { attemptId, answers } = req.body;

    if (!attemptId || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Attempt ID and answers are required'
      });
    }

    const attempt = await ExamAttempt.findById(attemptId)
      .populate('exam')
      .populate('answers.question');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Exam attempt not found'
      });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'This exam attempt has already been submitted'
      });
    }

    // Process answers and calculate scores
    const processedAnswers = [];
    let totalScore = 0;

    for (const answer of answers) {
      const question = attempt.exam.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) continue;

      const isCorrect = question.checkAnswer ? question.checkAnswer(answer.answer) : false;
      const marksObtained = isCorrect ? question.marks : (question.negativeMarks ? -question.negativeMarks : 0);

      processedAnswers.push({
        question: answer.questionId,
        answer: answer.answer,
        isCorrect,
        marksObtained,
        timeSpent: answer.timeSpent || 0
      });

      totalScore += marksObtained;
    }

    attempt.answers = processedAnswers;
    attempt.score = totalScore;
    attempt.percentage = Math.round((totalScore / attempt.exam.totalMarks) * 100);
    attempt.isPassed = attempt.percentage >= attempt.exam.passingMarks;
    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    attempt.endTime = new Date();

    await attempt.save();

    // Generate certificate and award points if passed
    let certificate = null;
    if (attempt.isPassed) {
      certificate = new Certificate({
        student: attempt.student,
        exam: attempt.exam._id,
        examAttempt: attempt._id,
        studentName: 'Student Name', // This should come from user data
        examTitle: attempt.exam.title,
        score: attempt.score,
        percentage: attempt.percentage,
        grade: attempt.percentage >= 95 ? 'A+' : 
               attempt.percentage >= 90 ? 'A' : 
               attempt.percentage >= 85 ? 'B+' : 
               attempt.percentage >= 80 ? 'B' : 
               attempt.percentage >= 75 ? 'C+' : 
               attempt.percentage >= 70 ? 'C' : 
               attempt.percentage >= 60 ? 'D' : 'F'
      });

      await certificate.save();

      // Award 1000 points for passing the exam
      try {
        const User = require('../models/User');
        const user = await User.findById(attempt.student);
        if (user) {
          user.progress.points = (user.progress.points || 0) + 1000;
          await user.save();
          console.log(`Awarded 1000 points to user ${user._id} for passing exam ${attempt.exam._id}`);
        }
      } catch (pointsError) {
        console.error('Error awarding points:', pointsError);
        // Don't fail the exam submission if points awarding fails
      }
    }

    res.json({
      success: true,
      message: 'Exam submitted successfully',
      data: {
        score: attempt.score,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
        certificate: certificate ? {
          id: certificate._id,
          certificateNumber: certificate.certificateNumber
        } : null
      }
    });

  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting exam',
      error: error.message
    });
  }
});


module.exports = router;
