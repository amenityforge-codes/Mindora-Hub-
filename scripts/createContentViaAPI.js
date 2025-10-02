const fetch = require('node-fetch');
require('dotenv').config();

const API_BASE_URL = 'http://192.168.1.11:5000';

// Sample video URLs
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
      },
      {
        prompt: 'How many letters are in the English alphabet?',
        type: 'mcq',
        options: [
          { text: '24' },
          { text: '25' },
          { text: '26' },
          { text: '27' }
        ],
        correctAnswer: 2,
        explanation: 'The English alphabet has 26 letters.'
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
      },
      {
        prompt: 'What do you use to write?',
        type: 'mcq',
        options: [
          { text: 'Spoon' },
          { text: 'Pen' },
          { text: 'Ball' },
          { text: 'Book' }
        ],
        correctAnswer: 1,
        explanation: 'A pen is used for writing.'
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
      },
      {
        prompt: 'How many fingers do you have on one hand?',
        type: 'mcq',
        options: [
          { text: '4' },
          { text: '5' },
          { text: '6' },
          { text: '10' }
        ],
        correctAnswer: 1,
        explanation: 'You have 5 fingers on one hand.'
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
    },
    {
      prompt: `Which of these is related to "${topicTitle}"?`,
      type: 'mcq',
      options: [
        { text: 'Education' },
        { text: 'Cooking' },
        { text: 'Sports' },
        { text: 'Music' }
      ],
      correctAnswer: 0,
      explanation: `"${topicTitle}" is educational content.`
    }
  ];
};

async function loginAsAdmin() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'amenityforge@gmail.com',
        password: 'Amenity'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.token;
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

async function getAllModules(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/content/modules`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data?.modules || [];
    } else {
      throw new Error('Failed to fetch modules');
    }
  } catch (error) {
    console.error('Error fetching modules:', error);
    return [];
  }
}

async function createVideo(token, videoData) {
  try {
    const formData = new FormData();
    formData.append('title', videoData.title);
    formData.append('description', videoData.description);
    formData.append('url', videoData.url);
    formData.append('thumbnail', videoData.thumbnail);
    formData.append('duration', videoData.duration.toString());
    formData.append('module', videoData.module);
    formData.append('topic', videoData.topic);
    formData.append('topicDescription', videoData.topicDescription);
    formData.append('sequenceOrder', videoData.sequenceOrder.toString());
    formData.append('tags', videoData.tags.join(','));
    formData.append('isPublished', 'true');

    const response = await fetch(`${API_BASE_URL}/api/video/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create video');
    }
  } catch (error) {
    console.error('Error creating video:', error);
    return null;
  }
}

async function createQuiz(token, quizData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quiz`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quizData)
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create quiz');
    }
  } catch (error) {
    console.error('Error creating quiz:', error);
    return null;
  }
}

async function createContentForAllModules() {
  try {
    console.log('=== CREATING CONTENT FOR ALL MODULES VIA API ===');
    
    // Login as admin
    console.log('Logging in as admin...');
    const token = await loginAsAdmin();
    if (!token) {
      console.error('Failed to login as admin');
      return;
    }
    console.log('✅ Admin login successful');
    
    // Get all modules
    console.log('Fetching all modules...');
    const modules = await getAllModules(token);
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
          tags: [module.title, topic.title, 'educational', 'video']
        };
        
        const video = await createVideo(token, videoData);
        if (video) {
          console.log(`    ✅ Created video: ${video.title}`);
          totalVideosCreated++;
        } else {
          console.log(`    ❌ Failed to create video for topic: ${topic.title}`);
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
          isPublished: true
        };
        
        const quiz = await createQuiz(token, quizData);
        if (quiz) {
          console.log(`    ✅ Created quiz: ${quiz.title}`);
          totalQuizzesCreated++;
        } else {
          console.log(`    ❌ Failed to create quiz for topic: ${topic.title}`);
        }
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total modules processed: ${modules.length}`);
    console.log(`Total videos created: ${totalVideosCreated}`);
    console.log(`Total quizzes created: ${totalQuizzesCreated}`);
    console.log('Content creation completed successfully!');
    
  } catch (error) {
    console.error('Error creating content:', error);
  }
}

// Run the script
createContentForAllModules();















