const mongoose = require('mongoose');
const Module = require('../models/Module');
const Video = require('../models/Video');
const Quiz = require('../models/Quiz');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/English-1?retryWrites=true&w=majority&appName=Cluster0');

async function linkVideosToModules() {
  try {
    console.log('🔗 Linking existing videos to modules...');
    
    // Get all modules
    const modules = await Module.find({ ageRange: '6-12' });
    console.log(`Found ${modules.length} modules for 6-12 age range`);
    
    // Get all videos
    const videos = await Video.find({});
    console.log(`Found ${videos.length} videos in database`);
    
    // Get all quizzes
    const quizzes = await Quiz.find({});
    console.log(`Found ${quizzes.length} quizzes in database`);
    
    // Check uploads folder
    const uploadsDir = path.join(__dirname, '../uploads/videos');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      console.log(`Found ${files.length} files in uploads/videos folder`);
      console.log('Files:', files);
    }
    
    // If no videos in database, create some sample videos for the modules
    if (videos.length === 0) {
      console.log('No videos in database, creating sample videos...');
      
      for (let i = 0; i < Math.min(modules.length, 5); i++) {
        const module = modules[i];
        
        // Create sample videos for this module
        const sampleVideos = [
          {
            title: `${module.title} - Introduction Video`,
            description: `Learn the basics of ${module.title.toLowerCase()}`,
            moduleId: module._id,
            level: 1,
            duration: 120,
            tags: [module.moduleType, 'introduction'],
            topic: 'Introduction',
            topicDescription: `Introduction to ${module.title}`,
            sequenceOrder: 1,
            isPublished: true,
            videoUrl: '/uploads/videos/sample-video-1.mp4',
            thumbnail: '/uploads/videos/sample-thumbnail-1.jpg'
          },
          {
            title: `${module.title} - Practice Video`,
            description: `Practice what you learned about ${module.title.toLowerCase()}`,
            moduleId: module._id,
            level: 1,
            duration: 180,
            tags: [module.moduleType, 'practice'],
            topic: 'Practice',
            topicDescription: `Practice exercises for ${module.title}`,
            sequenceOrder: 2,
            isPublished: true,
            videoUrl: '/uploads/videos/sample-video-2.mp4',
            thumbnail: '/uploads/videos/sample-thumbnail-2.jpg'
          }
        ];
        
        for (const videoData of sampleVideos) {
          const video = new Video(videoData);
          await video.save();
          console.log(`✅ Created video: ${video.title}`);
        }
        
        // Create sample quizzes for this module
        const sampleQuizzes = [
          {
            title: `${module.title} - Introduction Quiz`,
            description: `Test your knowledge of ${module.title.toLowerCase()}`,
            moduleId: module._id,
            level: 1,
            questions: [
              {
                question: `What is the main topic of this module?`,
                options: [module.title, 'Something else', 'I don\'t know', 'Maybe'],
                correctAnswer: 0,
                explanation: `This module is about ${module.title}`
              },
              {
                question: `How would you describe this module?`,
                options: ['Easy', 'Medium', 'Hard', 'Very Hard'],
                correctAnswer: 1,
                explanation: 'This module is designed to be medium difficulty'
              }
            ],
            topic: 'Introduction',
            topicDescription: `Introduction to ${module.title}`,
            sequenceOrder: 1,
            isPublished: true
          }
        ];
        
        for (const quizData of sampleQuizzes) {
          const quiz = new Quiz(quizData);
          await quiz.save();
          console.log(`✅ Created quiz: ${quiz.title}`);
        }
      }
    }
    
    // Update existing videos to link them to modules if they're not linked
    const unlinkedVideos = await Video.find({ moduleId: { $exists: false } });
    console.log(`Found ${unlinkedVideos.length} unlinked videos`);
    
    for (let i = 0; i < unlinkedVideos.length && i < modules.length; i++) {
      const video = unlinkedVideos[i];
      const module = modules[i % modules.length];
      
      video.moduleId = module._id;
      video.topic = video.topic || 'General';
      video.topicDescription = video.topicDescription || `Content for ${module.title}`;
      video.sequenceOrder = video.sequenceOrder || 1;
      video.isPublished = true;
      
      await video.save();
      console.log(`✅ Linked video "${video.title}" to module "${module.title}"`);
    }
    
    // Update existing quizzes to link them to modules if they're not linked
    const unlinkedQuizzes = await Quiz.find({ moduleId: { $exists: false } });
    console.log(`Found ${unlinkedQuizzes.length} unlinked quizzes`);
    
    for (let i = 0; i < unlinkedQuizzes.length && i < modules.length; i++) {
      const quiz = unlinkedQuizzes[i];
      const module = modules[i % modules.length];
      
      quiz.moduleId = module._id;
      quiz.topic = quiz.topic || 'General';
      quiz.topicDescription = quiz.topicDescription || `Content for ${module.title}`;
      quiz.sequenceOrder = quiz.sequenceOrder || 1;
      quiz.isPublished = true;
      
      await quiz.save();
      console.log(`✅ Linked quiz "${quiz.title}" to module "${module.title}"`);
    }
    
    console.log('\n🎉 Video and quiz linking completed!');
    console.log('\n📊 Final Summary:');
    
    const finalVideos = await Video.find({});
    const finalQuizzes = await Quiz.find({});
    
    console.log(`- Total videos: ${finalVideos.length}`);
    console.log(`- Total quizzes: ${finalQuizzes.length}`);
    console.log(`- Total modules: ${modules.length}`);
    
    // Show videos per module
    for (const module of modules) {
      const moduleVideos = await Video.find({ moduleId: module._id });
      const moduleQuizzes = await Quiz.find({ moduleId: module._id });
      console.log(`- ${module.title}: ${moduleVideos.length} videos, ${moduleQuizzes.length} quizzes`);
    }
    
  } catch (error) {
    console.error('❌ Error linking videos to modules:', error);
  } finally {
    mongoose.connection.close();
  }
}

linkVideosToModules();















