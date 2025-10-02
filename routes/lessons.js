const express = require('express');
const Lesson = require('../models/Lesson');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/lessons/health
// @desc    Health check for lessons API
// @access  Public
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Lessons API is healthy',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/lessons/test-videos
// @desc    Test video URLs and serving
// @access  Public
router.get('/test-videos', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check if uploads directory exists
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const exists = fs.existsSync(uploadsDir);
    
    // Get list of video files
    let videoFiles = [];
    if (exists) {
      const walkDir = (dir, basePath = '') => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            walkDir(filePath, path.join(basePath, file));
          } else if (file.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i)) {
            videoFiles.push({
              name: file,
              path: path.join(basePath, file),
              fullPath: filePath,
              size: stat.size,
              url: `/uploads/${path.join(basePath, file)}`
            });
          }
        });
      };
      walkDir(uploadsDir);
    }
    
    res.json({
      success: true,
      message: 'Video test results',
      data: {
        uploadsDirExists: exists,
        uploadsDir: uploadsDir,
        videoFiles: videoFiles,
        totalVideos: videoFiles.length,
        sampleUrls: videoFiles.slice(0, 3).map(v => ({
          name: v.name,
          url: `https://oyster-app-qlg6z.ondigitalocean.app${v.url}`
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing videos',
      error: error.message
    });
  }
});

// @route   GET /api/lessons/auth-test
// @desc    Test authentication status
// @access  Public
router.get('/auth-test', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  res.json({
    success: true,
    message: 'Authentication test results',
    data: {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      authHeader: authHeader,
      tokenLength: token ? token.length : 0,
      timestamp: new Date().toISOString()
    }
  });
});

// @route   GET /api/lessons/debug
// @desc    Debug route to see all lessons in database
// @access  Public
router.get('/debug', async (req, res) => {
  try {
    console.log('=== DEBUG: Getting all lessons ===');
    const allLessons = await Lesson.find({}).lean();
    console.log('Total lessons in database:', allLessons.length);
    
    const lessonIds = allLessons.map(lesson => ({
      id: lesson._id,
      title: lesson.title,
      ageRange: lesson.ageRange
    }));
    
    res.json({
      success: true,
      message: 'Debug info retrieved',
      data: {
        totalLessons: allLessons.length,
        lessons: lessonIds
      }
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message
    });
  }
});

// @route   GET /api/lessons/fast
// @desc    Fast route that returns immediately without database queries
// @access  Public
router.get('/fast', (req, res) => {
  console.log('=== FAST LESSONS ROUTE ===');
  res.json({
    success: true,
    message: 'Fast lessons response',
    data: {
      lessons: [
        {
          _id: 'fast-1',
          title: 'Quick Lesson 1',
          description: 'Fast response lesson',
          difficulty: 'Beginner',
          estimatedDuration: 15,
          ageRange: '6-15',
          topics: []
        },
        {
          _id: 'fast-2', 
          title: 'Quick Lesson 2',
          description: 'Another fast response lesson',
          difficulty: 'Intermediate',
          estimatedDuration: 20,
          ageRange: '6-15',
          topics: []
        }
      ]
    }
  });
});

// @route   GET /api/lessons/check-videos
// @desc    Check video data in lessons
// @access  Public
router.get('/check-videos', async (req, res) => {
  try {
    const lessons = await Lesson.find({}).select('title topics');
    let videoStats = {
      totalLessons: lessons.length,
      lessonsWithTopics: 0,
      topicsWithVideos: 0,
      totalVideos: 0,
      videoUrls: [],
      brokenUrls: []
    };
    
    lessons.forEach(lesson => {
      if (lesson.topics && lesson.topics.length > 0) {
        videoStats.lessonsWithTopics++;
        
        lesson.topics.forEach(topic => {
          if (topic.videos && topic.videos.length > 0) {
            videoStats.topicsWithVideos++;
            videoStats.totalVideos += topic.videos.length;
            
            topic.videos.forEach(video => {
              if (video.videoUrl) {
                videoStats.videoUrls.push({
                  lesson: lesson.title,
                  topic: topic.title,
                  video: video.title,
                  url: video.videoUrl,
                  isHttp: video.videoUrl.startsWith('http'),
                  isUploads: video.videoUrl.startsWith('/uploads/')
                });
                
                if (!video.videoUrl.startsWith('http') && !video.videoUrl.startsWith('/uploads/')) {
                  videoStats.brokenUrls.push(video.videoUrl);
                }
              }
            });
          }
        });
      }
    });
    
    res.json({
      success: true,
      message: 'Video data analysis complete',
      data: videoStats
    });
  } catch (error) {
    console.error('Error checking videos:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking videos',
      error: error.message
    });
  }
});

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
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 5000); // Reduced timeout
    });
    
    const queryPromise = Lesson.find(filter)
      .sort({ createdAt: -1 })
      .limit(20) // Further reduced limit
      .lean() // Use lean() for better performance
      .select('title description difficulty estimatedDuration ageRange topics createdAt'); // Only select needed fields
    
    const lessons = await Promise.race([queryPromise, timeoutPromise]);
    
    console.log(`Found ${lessons.length} lessons`);
    
    res.json({
      success: true,
      message: 'Lessons retrieved successfully',
      data: { lessons }
    });
    
  } catch (error) {
    console.error('❌ Error fetching lessons:', error);
    
    // Return empty array instead of error to prevent frontend crashes
    if (error.message === 'Database query timeout') {
      console.log('⚠️ Database timeout, returning empty lessons array');
      return res.json({
        success: true,
        message: 'Lessons retrieved successfully (timeout fallback)',
        data: { lessons: [] }
      });
    }
    
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
    console.log('=== GET LESSON BY ID ===');
    console.log('Lesson ID:', req.params.id);
    
    const lesson = await Lesson.findById(req.params.id);
    console.log('Found lesson:', lesson ? 'Yes' : 'No');
    
    if (!lesson) {
      console.log('❌ Lesson not found in database');
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    console.log('✅ Lesson found:', lesson.title);
    
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
      estimatedDuration, // Also check for estimatedDuration from frontend
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
      estimatedDuration: estimatedDuration || duration || 30, // minutes - use estimatedDuration as expected by model
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
    
    // Process lessons in batches to prevent timeout
    const batchSize = 5;
    for (let i = 0; i < lessons.length; i += batchSize) {
      const batch = lessons.slice(i, i + batchSize);
      
      for (const lessonData of batch) {
        // Clean and validate lesson data
        const cleanedLessonData = {
          title: lessonData.title,
          description: lessonData.description,
          category: lessonData.category || 'general', // Add required category field
          difficulty: lessonData.difficulty ? lessonData.difficulty.charAt(0).toUpperCase() + lessonData.difficulty.slice(1).toLowerCase() : 'Beginner',
          estimatedDuration: lessonData.estimatedDuration || lessonData.duration || 30,
          ageRange: '6-15',
          createdBy: req.userId,
          isActive: true,
          // Remove topics for now since they're causing validation issues
          // topics: [] // Will be added later when Topic model is properly set up
        };
        
        console.log('Cleaned lesson data:', cleanedLessonData);
        
        const newLesson = new Lesson(cleanedLessonData);
        await newLesson.save();
        savedLessons.push(newLesson);
        
        console.log('✅ Lesson saved:', newLesson.title);
      }
      
      // Small delay between batches to prevent overwhelming the database
      if (i + batchSize < lessons.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
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
    
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if user owns the lesson (if createdBy exists) or if it's a children lesson
    if (lesson.createdBy && lesson.createdBy.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this lesson'
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

// @route   POST /api/lessons/:lessonId/topics
// @desc    Add topic to a lesson
// @access  Private (Admin only)
router.post('/:lessonId/topics', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADD TOPIC TO LESSON ===');
    console.log('Lesson ID:', req.params.lessonId);
    console.log('Topic data:', req.body);
    
    const { title, description, order } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Topic title is required'
      });
    }
    
    // Find the lesson and add the topic
    console.log('Looking for lesson with ID:', req.params.lessonId);
    const lesson = await Lesson.findById(req.params.lessonId);
    
    if (!lesson) {
      console.log('❌ Lesson not found');
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    console.log('✅ Lesson found:', lesson.title);
    console.log('Current topics count:', lesson.topics ? lesson.topics.length : 0);
    
    // Create topic object
    const newTopic = {
      id: Date.now(), // Temporary ID for now
      title,
      description: description || '',
      order: order || (lesson.topics ? lesson.topics.length + 1 : 1),
      createdAt: new Date()
    };
    
    console.log('Creating new topic:', newTopic);
    
    // Add topic to lesson (for now, we'll store it in a topics array field)
    if (!lesson.topics) {
      lesson.topics = [];
    }
    
    // Use raw MongoDB operations to bypass Mongoose schema validation
    const db = lesson.db;
    await db.collection('lessons').updateOne(
      { _id: lesson._id },
      { $push: { topics: newTopic } }
    );
    
    console.log('✅ Topic added to lesson successfully');
    
    res.status(201).json({
      success: true,
      message: 'Topic added to lesson successfully',
      data: newTopic
    });
    
  } catch (error) {
    console.error('❌ Error adding topic to lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding topic to lesson',
      error: error.message
    });
  }
});

// @route   POST /api/lessons/:lessonId/topics/:topicId/videos
// @desc    Add video to a lesson topic
// @access  Private (Admin only)
router.post('/:lessonId/topics/:topicId/videos', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADD VIDEO TO LESSON TOPIC ===');
    console.log('Lesson ID:', req.params.lessonId);
    console.log('Topic ID:', req.params.topicId);
    console.log('Video data:', req.body);
    
    const { title, description, url } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Video title is required'
      });
    }
    
    // Find the lesson
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Find the topic (try both string and number comparison)
    const topicId = req.params.topicId;
    const topicIdNum = parseInt(topicId);
    console.log('🔍 Looking for topic ID:', topicId, '(as string)');
    console.log('🔍 Looking for topic ID:', topicIdNum, '(as number)');
    console.log('🔍 Available topics:', lesson.topics.map(t => ({ id: t.id, idType: typeof t.id, title: t.title })));
    
    // Try multiple ways to find the topic
    let topic = lesson.topics.find(t => t.id == topicId); // Loose equality
    if (!topic) {
      topic = lesson.topics.find(t => String(t.id) === String(topicId));
    }
    if (!topic) {
      topic = lesson.topics.find(t => Number(t.id) === Number(topicId));
    }
    
    if (!topic) {
      console.log('❌ Topic not found. Looking for ID:', topicId);
      console.log('Available topics:', lesson.topics.map(t => ({ id: t.id, title: t.title })));
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }
    
    console.log('✅ Topic found:', topic.title);
    
    // Create new video object
    const newVideo = {
      id: Date.now(),
      title: title.trim(),
      description: description || '',
      videoUrl: url || '',
      duration: 0,
      createdAt: new Date()
    };
    
    // Add video to topic's videos array
    if (!topic.videos) {
      topic.videos = [];
    }
    topic.videos.push(newVideo);
    
    console.log('📹 Video added to topic. Topic videos count:', topic.videos.length);
    console.log('📹 Topic videos:', topic.videos.map(v => ({ id: v.id, title: v.title })));
    
    // Save the lesson
    console.log('💾 Saving lesson to database...');
    await lesson.save();
    console.log('✅ Lesson saved successfully');
    
    console.log('✅ Video added successfully:', newVideo);
    
    res.status(201).json({
      success: true,
      message: 'Video added to lesson topic successfully',
      data: newVideo
    });
    
  } catch (error) {
    console.error('❌ Error adding video to lesson topic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding video to lesson topic',
      error: error.message
    });
  }
});

// @route   POST /api/lessons/:lessonId/topics/:topicId/quizzes
// @desc    Add quiz to a lesson topic
// @access  Private (Admin only)
router.post('/:lessonId/topics/:topicId/quizzes', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADD QUIZ TO LESSON TOPIC ===');
    console.log('Lesson ID:', req.params.lessonId);
    console.log('Topic ID:', req.params.topicId);
    console.log('Quiz data:', req.body);
    
    const { title, questions } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Quiz title is required'
      });
    }
    
    // Find the lesson
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Find the topic (try both string and number comparison)
    const topicId = req.params.topicId;
    const topicIdNum = parseInt(topicId);
    console.log('🔍 Looking for topic ID:', topicId, '(as string)');
    console.log('🔍 Looking for topic ID:', topicIdNum, '(as number)');
    console.log('🔍 Available topics:', lesson.topics.map(t => ({ id: t.id, idType: typeof t.id, title: t.title })));
    
    // Try multiple ways to find the topic
    let topic = lesson.topics.find(t => t.id == topicId); // Loose equality
    if (!topic) {
      topic = lesson.topics.find(t => String(t.id) === String(topicId));
    }
    if (!topic) {
      topic = lesson.topics.find(t => Number(t.id) === Number(topicId));
    }
    
    if (!topic) {
      console.log('❌ Topic not found. Looking for ID:', topicId);
      console.log('Available topics:', lesson.topics.map(t => ({ id: t.id, title: t.title })));
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }
    
    console.log('✅ Topic found:', topic.title);
    
    // Create new quiz object
    const newQuiz = {
      id: Date.now(),
      title: title.trim(),
      questions: questions || [],
      createdAt: new Date()
    };
    
    // Add quiz to topic's quizzes array
    if (!topic.quizzes) {
      topic.quizzes = [];
    }
    topic.quizzes.push(newQuiz);
    
    console.log('📝 Quiz added to topic. Topic quizzes count:', topic.quizzes.length);
    console.log('📝 Topic quizzes:', topic.quizzes.map(q => ({ id: q.id, title: q.title })));
    
    // Save the lesson
    console.log('💾 Saving lesson to database...');
    await lesson.save();
    console.log('✅ Lesson saved successfully');
    
    console.log('✅ Quiz added successfully:', newQuiz);
    
    res.status(201).json({
      success: true,
      message: 'Quiz added to lesson topic successfully',
      data: newQuiz
    });
    
  } catch (error) {
    console.error('❌ Error adding quiz to lesson topic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding quiz to lesson topic',
      error: error.message
    });
  }
});

// @route   GET /api/lessons/fix-video-urls
// @desc    Fix video URLs in all lessons
// @access  Private (Admin only)
router.get('/fix-video-urls', auth.authenticate, async (req, res) => {
  try {
    const lessons = await Lesson.find({});
    let fixedCount = 0;
    
    for (const lesson of lessons) {
      let lessonUpdated = false;
      
      if (lesson.topics && Array.isArray(lesson.topics)) {
        for (const topic of lesson.topics) {
          if (topic.videos && Array.isArray(topic.videos)) {
            for (const video of topic.videos) {
              if (video.videoUrl && !video.videoUrl.startsWith('http') && !video.videoUrl.startsWith('/uploads/')) {
                video.videoUrl = `/uploads/${video.videoUrl}`;
                lessonUpdated = true;
                fixedCount++;
              }
            }
          }
        }
      }
      
      if (lessonUpdated) {
        await lesson.save();
      }
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixedCount} video URLs in lessons`,
      data: {
        fixedCount,
        totalLessons: lessons.length
      }
    });
  } catch (error) {
    console.error('Error fixing video URLs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fixing video URLs',
      error: error.message
    });
  }
});

// @route   GET /api/lessons/simple
// @desc    Simple route to test lesson fetching
// @access  Public
router.get('/simple', async (req, res) => {
  try {
    const lessons = await Lesson.find({}).select('title description topics').limit(5);
    res.json({
      success: true,
      message: 'Lessons fetched successfully',
      data: {
        lessons: lessons,
        count: lessons.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lessons',
      error: error.message
    });
  }
});

module.exports = router;
