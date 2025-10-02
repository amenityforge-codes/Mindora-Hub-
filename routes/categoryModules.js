const express = require('express');
const router = express.Router();
const CategoryModule = require('../models/CategoryModule');
const Topic = require('../models/Topic');
const Video = require('../models/Video');
const Quiz = require('../models/Quiz');
const DailyQuestion = require('../models/DailyQuestion');
const { authenticate, adminOnly } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/category-videos';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    // Allow video files and also check for common video extensions
    if (file.mimetype.startsWith('video/') || 
        file.mimetype === 'application/octet-stream' ||
        file.originalname.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i)) {
      cb(null, true);
    } else {
      console.log('File rejected:', file.mimetype, file.originalname);
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Get all category modules with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, limit = 20, page = 1 } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const modules = await CategoryModule.find(filter)
      .populate({
        path: 'topics',
        populate: [
          { path: 'videos', select: 'title duration isActive' },
          { path: 'quizzes', select: 'title isActive allowMultipleAttempts' },
          { path: 'dailyQuestions', select: 'question scenario difficulty date' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await CategoryModule.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: {
        modules,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get category modules error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get single category module
router.get('/:id', async (req, res) => {
  try {
    const module = await CategoryModule.findById(req.params.id)
      .populate({
        path: 'topics',
        populate: [
          { path: 'videos' },
          { path: 'quizzes' },
          { path: 'dailyQuestions' }
        ]
      });

    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    res.json({ success: true, data: { module } });
  } catch (error) {
    console.error('Get category module error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Create new category module
router.post('/', async (req, res) => {
  try {
    const { title, description, category, difficulty, estimatedDuration } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, description, and category are required' 
      });
    }

    const module = new CategoryModule({
      title,
      description,
      category,
      difficulty: difficulty || 'Beginner',
      estimatedDuration: estimatedDuration || 30,
      topics: [],
      isActive: true,
      createdBy: null
    });

    await module.save();

    res.status(201).json({
      success: true,
      message: 'Category module created successfully',
      data: { module }
    });
  } catch (error) {
    console.error('Create category module error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update category module
router.put('/:id', async (req, res) => {
  try {
    const { title, description, difficulty, estimatedDuration, isActive } = req.body;

    const module = await CategoryModule.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    if (title) module.title = title;
    if (description) module.description = description;
    if (difficulty) module.difficulty = difficulty;
    if (estimatedDuration) module.estimatedDuration = estimatedDuration;
    if (typeof isActive === 'boolean') module.isActive = isActive;

    await module.save();

    res.json({
      success: true,
      message: 'Module updated successfully',
      data: { module }
    });
  } catch (error) {
    console.error('Update category module error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete category module
router.delete('/:id', async (req, res) => {
  try {
    const module = await CategoryModule.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Delete associated topics, videos, quizzes, and daily questions
    for (const topicId of module.topics) {
      const topic = await Topic.findById(topicId);
      if (topic) {
        // Delete videos
        for (const videoId of topic.videos) {
          const video = await Video.findById(videoId);
          if (video && video.videoUrl) {
            const videoPath = path.join(__dirname, '..', video.videoUrl);
            if (fs.existsSync(videoPath)) {
              fs.unlinkSync(videoPath);
            }
          }
          await Video.findByIdAndDelete(videoId);
        }
        
        // Delete quizzes
        await Quiz.deleteMany({ _id: { $in: topic.quizzes } });
        
        // Delete daily questions
        await DailyQuestion.deleteMany({ _id: { $in: topic.dailyQuestions } });
        
        // Delete topic
        await Topic.findByIdAndDelete(topicId);
      }
    }

    await CategoryModule.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Module and all associated content deleted successfully'
    });
  } catch (error) {
    console.error('Delete category module error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Add topic to module
router.post('/:moduleId/topics', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and description are required' 
      });
    }

    const module = await CategoryModule.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const topic = new Topic({
      title,
      description,
      videos: [],
      quizzes: [],
      dailyQuestions: [],
      isActive: true,
      moduleId: module._id
    });

    await topic.save();

    module.topics.push(topic._id);
    await module.save();

    res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      data: { topic }
    });
  } catch (error) {
    console.error('Add topic error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Upload video to topic
router.post('/:moduleId/topics/:topicId/videos', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Video file is required' });
    }

    const { title, description, duration } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const topic = await Topic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const video = new Video({
      title,
      description: description || '',
      videoUrl: req.file.path,
      duration: parseInt(duration) || 0,
      isActive: true,
      topicId: topic._id,
      moduleId: req.params.moduleId
    });

    await video.save();

    topic.videos.push(video._id);
    await topic.save();

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: { video }
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Create quiz for topic
router.post('/:moduleId/topics/:topicId/quizzes', async (req, res) => {
  try {
    const { title, description, questions, allowMultipleAttempts = true } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and questions are required' 
      });
    }

    const topic = await Topic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const quiz = new Quiz({
      title,
      description: description || '',
      questions,
      isActive: true,
      allowMultipleAttempts,
      topicId: topic._id,
      moduleId: req.params.moduleId
    });

    await quiz.save();

    topic.quizzes.push(quiz._id);
    await topic.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz }
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Add daily question to topic
router.post('/:moduleId/topics/:topicId/daily-questions', async (req, res) => {
  try {
    const { question, scenario, correctAnswer, explanation, difficulty = 'Medium' } = req.body;

    if (!question || !scenario || !correctAnswer || !explanation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Question, scenario, correct answer, and explanation are required' 
      });
    }

    const topic = await Topic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const dailyQuestion = new DailyQuestion({
      question,
      scenario,
      correctAnswer,
      explanation,
      difficulty,
      category: topic.title,
      date: new Date(),
      topicId: topic._id,
      moduleId: req.params.moduleId
    });

    await dailyQuestion.save();

    topic.dailyQuestions.push(dailyQuestion._id);
    await topic.save();

    res.status(201).json({
      success: true,
      message: 'Daily question created successfully',
      data: { dailyQuestion }
    });
  } catch (error) {
    console.error('Create daily question error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get daily questions for practice
router.get('/daily-questions/practice', async (req, res) => {
  try {
    const { category, difficulty, limit = 10 } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const dailyQuestions = await DailyQuestion.find(filter)
      .populate('topicId', 'title')
      .populate('moduleId', 'title category')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { dailyQuestions }
    });
  } catch (error) {
    console.error('Get daily questions error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Submit daily question answer
router.post('/daily-questions/:questionId/answer', authenticate, async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({ success: false, message: 'Answer is required' });
    }

    const dailyQuestion = await DailyQuestion.findById(req.params.questionId);
    if (!dailyQuestion) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const isCorrect = answer.toLowerCase().trim() === dailyQuestion.correctAnswer.toLowerCase().trim();
    
    // Award points for correct answers
    let pointsEarned = 0;
    if (isCorrect) {
      switch (dailyQuestion.difficulty) {
        case 'Easy': pointsEarned = 10; break;
        case 'Medium': pointsEarned = 20; break;
        case 'Hard': pointsEarned = 30; break;
        default: pointsEarned = 15;
      }
    }

    res.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: dailyQuestion.correctAnswer,
        explanation: dailyQuestion.explanation,
        pointsEarned
      }
    });
  } catch (error) {
    console.error('Submit daily question answer error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ===== TOPIC-SPECIFIC ROUTES (for frontend compatibility) =====

// Get videos for a topic
router.get('/topics/:topicId/videos', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const videos = await Video.find({ topicId: req.params.topicId });
    res.json(videos);
  } catch (error) {
    console.error('Get topic videos error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Upload video to topic (direct route)
router.post('/topics/:topicId/videos', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Video file is required' });
    }

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const topic = await Topic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const video = new Video({
      title,
      description: description || '',
      videoUrl: req.file.path,
      duration: 0, // Will be calculated later
      topicId: topic._id,
      moduleId: topic.moduleId,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      level: 1 // Default level as number
      // uploadedBy is now optional, so we don't need to set it
    });

    await video.save();

    topic.videos.push(video._id);
    await topic.save();

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: { video }
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get questions for a topic
router.get('/topics/:topicId/questions', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    // Get both quiz questions and daily questions
    const quizzes = await Quiz.find({ topicId: req.params.topicId, isActive: true });
    const dailyQuestions = await DailyQuestion.find({ topicId: req.params.topicId });
    
    // Combine and format questions
    const allQuestions = [];
    
    quizzes.forEach(quiz => {
      quiz.questions.forEach((question, index) => {
        allQuestions.push({
          _id: `${quiz._id}_${index}`,
          question: question.prompt,
          options: question.options || [],
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          type: 'basic',
          maxAttempts: 3,
          quizId: quiz._id
        });
      });
    });
    
    dailyQuestions.forEach(dq => {
      allQuestions.push({
        _id: dq._id,
        question: dq.question,
        scenario: dq.scenario,
        correctAnswer: dq.correctAnswer,
        explanation: dq.explanation,
        type: 'scenario',
        maxAttempts: 3,
        difficulty: dq.difficulty
      });
    });

    res.json(allQuestions);
  } catch (error) {
    console.error('Get topic questions error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Add question to topic
router.post('/topics/:topicId/questions', async (req, res) => {
  try {
    const { question, options, correctAnswer, explanation, type, scenario, maxAttempts } = req.body;

    if (!question || !options || !Array.isArray(options)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Question and options are required' 
      });
    }

    const topic = await Topic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    if (type === 'scenario') {
      // Create daily question for scenario-based questions
      const dailyQuestion = new DailyQuestion({
        question,
        scenario: scenario || '',
        correctAnswer: options[correctAnswer] || '',
        explanation: explanation || '',
        difficulty: 'Medium',
        category: topic.title,
        date: new Date(),
        topicId: topic._id,
        moduleId: topic.moduleId
      });

      await dailyQuestion.save();
      topic.dailyQuestions.push(dailyQuestion._id);
      await topic.save();

      res.status(201).json({
        success: true,
        message: 'Scenario question created successfully',
        data: { question: dailyQuestion }
      });
    } else {
      // Create quiz for basic questions
      const quiz = new Quiz({
        title: `Question for ${topic.title}`,
        description: 'Auto-generated quiz',
        questions: [{
          prompt: question,
          options: options.map(opt => ({ text: opt, isCorrect: false })),
          correctAnswer: options[correctAnswer],
          explanation: explanation || '',
          marks: 1,
          difficulty: 'medium',
          timeLimit: 60
        }],
        isActive: true,
        allowMultipleAttempts: true,
        topicId: topic._id,
        moduleId: topic.moduleId
      });

      // Mark correct option
      if (quiz.questions[0] && quiz.questions[0].options && quiz.questions[0].options[correctAnswer]) {
        quiz.questions[0].options[correctAnswer].isCorrect = true;
      }

      await quiz.save();
      topic.quizzes.push(quiz._id);
      await topic.save();

      res.status(201).json({
        success: true,
        message: 'Question created successfully',
        data: { question: quiz.questions[0] }
      });
    }
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get notes for a topic
router.get('/topics/:topicId/notes', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const Note = require('../models/Note');
    const notes = await Note.find({ topicId: req.params.topicId, isActive: true });
    res.json(notes);
  } catch (error) {
    console.error('Get topic notes error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Configure multer for document uploads
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/category-documents';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const documentUpload = multer({ 
  storage: documentStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow common document types
    if (file.mimetype.startsWith('application/') || 
        file.mimetype.startsWith('text/') ||
        file.originalname.match(/\.(pdf|doc|docx|txt|rtf)$/i)) {
      cb(null, true);
    } else {
      console.log('Document rejected:', file.mimetype, file.originalname);
      cb(new Error('Only document files are allowed'), false);
    }
  }
});

// Upload note to topic
router.post('/topics/:topicId/notes', documentUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const topic = await Topic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const Note = require('../models/Note');
    const note = new Note({
      title,
      description: description || '',
      fileUrl: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      topicId: topic._id,
      moduleId: topic.moduleId,
      isActive: true
    });

    await note.save();

    // Add note to topic's notes array
    topic.notes = topic.notes || [];
    topic.notes.push(note._id);
    await topic.save();

    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully',
      data: note
    });
  } catch (error) {
    console.error('Upload note error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get links for a topic
router.get('/topics/:topicId/links', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const Link = require('../models/Link');
    const links = await Link.find({ topicId: req.params.topicId, isActive: true });
    res.json(links);
  } catch (error) {
    console.error('Get topic links error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Add link to topic
router.post('/topics/:topicId/links', async (req, res) => {
  try {
    const { title, url, description, type } = req.body;

    if (!title || !url) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and URL are required' 
      });
    }

    const topic = await Topic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const Link = require('../models/Link');
    const link = new Link({
      title,
      url,
      description: description || '',
      type: type || 'resource',
      topicId: topic._id,
      moduleId: topic.moduleId,
      isActive: true
    });

    await link.save();

    // Add link to topic's links array
    topic.links = topic.links || [];
    topic.links.push(link._id);
    await topic.save();

    res.status(201).json({
      success: true,
      message: 'Link added successfully',
      data: link
    });
  } catch (error) {
    console.error('Add link error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
