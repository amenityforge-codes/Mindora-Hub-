const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ei-english')
  .then(() => {
    console.log('Connected to MongoDB');
    createContentForAllModules();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import models
const Module = require('../models/Module');
const Video = require('../models/Video');
const Quiz = require('../models/Quiz');

// Sample video URLs (you can replace these with actual video files)
const sampleVideoUrls = [
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_2mb.mp4'
];

// Sample quiz questions for different topics
const getQuizQuestions = (topicTitle, moduleTitle) => {
  const baseQuestions = {
    'ABC Song Fun': [
      {
        prompt: 'What is the first letter of the alphabet?',
        type: 'mcq',
        options: [
          { text: 'A' },
          { text: 'B' },
          { text: 'C' },
          { text: 'D' }
        ],
        correctAnswer: 0,
        explanation: 'A is the first letter of the English alphabet.'
      },
      {
        prompt: 'Which letter comes after B?',
        type: 'mcq',
        options: [
          { text: 'A' },
          { text: 'B' },
          { text: 'C' },
          { text: 'D' }
        ],
        correctAnswer: 2,
        explanation: 'C comes after B in the alphabet.'
      }
    ],
    'Basic Vocabulary': [
      {
        prompt: 'What do you call a place where you live?',
        type: 'mcq',
        options: [
          { text: 'School' },
          { text: 'Home' },
          { text: 'Park' },
          { text: 'Store' }
        ],
        correctAnswer: 1,
        explanation: 'Home is where you live with your family.'
      }
    ],
    'Numbers & Counting': [
      {
        prompt: 'What number comes after 5?',
        type: 'mcq',
        options: [
          { text: '4' },
          { text: '5' },
          { text: '6' },
          { text: '7' }
        ],
        correctAnswer: 2,
        explanation: '6 comes after 5 when counting.'
      }
    ]
  };

  // Return questions for the specific topic, or default questions
  return baseQuestions[topicTitle] || [
    {
      prompt: `What is the main topic of "${topicTitle}"?`,
      type: 'mcq',
      options: [
        { text: 'Learning' },
        { text: 'Playing' },
        { text: 'Sleeping' },
        { text: 'Eating' }
      ],
      correctAnswer: 0,
      explanation: `"${topicTitle}" is about learning new things.`
    }
  ];
};

async function createContentForAllModules() {
  try {
    console.log('=== CREATING CONTENT FOR ALL MODULES ===');
    
    // Get all modules
    const modules = await Module.find({});
    console.log(`Found ${modules.length} modules`);
    
    let totalVideosCreated = 0;
    let totalQuizzesCreated = 0;
    
    for (const module of modules) {
      console.log(`\n--- Processing Module: ${module.title} ---`);
      console.log(`Module ID: ${module._id}`);
      console.log(`Topics: ${module.topics?.length || 0}`);
      
      if (!module.topics || module.topics.length === 0) {
        console.log('No topics found, skipping...');
        continue;
      }
      
      for (let i = 0; i < module.topics.length; i++) {
        const topic = module.topics[i];
        console.log(`\n  Processing Topic: ${topic.title}`);
        
        // Create video for this topic
        const videoData = {
          title: `${topic.title} - Video Lesson`,
          description: `Learn about ${topic.title} with this interactive video lesson.`,
          url: sampleVideoUrls[i % sampleVideoUrls.length],
          thumbnail: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Video',
          duration: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
          module: module._id,
          topic: topic.title,
          topicDescription: topic.description,
          sequenceOrder: i + 1,
          tags: [module.title, topic.title, 'educational', 'video'],
          isPublished: true,
          createdBy: 'system'
        };
        
        try {
          const video = new Video(videoData);
          await video.save();
          console.log(`    ✅ Created video: ${video.title}`);
          totalVideosCreated++;
        } catch (error) {
          console.log(`    ❌ Failed to create video: ${error.message}`);
        }
        
        // Create quiz for this topic
        const quizQuestions = getQuizQuestions(topic.title, module.title);
        const quizData = {
          title: `${topic.title} - Quiz`,
          description: `Test your knowledge of ${topic.title} with this quiz.`,
          questions: quizQuestions,
          module: module._id,
          topic: topic.title,
          topicDescription: topic.description,
          sequenceOrder: i + 1,
          settings: {
            timeLimit: 10, // 10 minutes
            passingScore: 70,
            allowRetake: true,
            showCorrectAnswers: true
          },
          tags: [module.title, topic.title, 'quiz', 'assessment'],
          isPublished: true,
          createdBy: 'system'
        };
        
        try {
          const quiz = new Quiz(quizData);
          await quiz.save();
          console.log(`    ✅ Created quiz: ${quiz.title}`);
          totalQuizzesCreated++;
        } catch (error) {
          console.log(`    ❌ Failed to create quiz: ${error.message}`);
        }
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total modules processed: ${modules.length}`);
    console.log(`Total videos created: ${totalVideosCreated}`);
    console.log(`Total quizzes created: ${totalQuizzesCreated}`);
    console.log('Content creation completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating content:', error);
    process.exit(1);
  }
}












