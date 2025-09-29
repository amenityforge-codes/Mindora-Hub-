const fetch = require('node-fetch');

const API_BASE_URL = 'http://192.168.1.11:5000';

// Sample video URLs
const sampleVideoUrls = [
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_2mb.mp4'
];

// Content data for existing modules
const contentData = {
  'Alphabet & Phonics': {
    topics: [
      {
        title: 'ABC Song Fun',
        videos: [
          {
            title: 'ABC Song - Learn the Alphabet',
            description: 'Sing along and learn the English alphabet with this fun ABC song',
            url: sampleVideoUrls[0],
            duration: 180
          },
          {
            title: 'Letter A to Z Sounds',
            description: 'Learn the sounds each letter makes from A to Z',
            url: sampleVideoUrls[1],
            duration: 240
          }
        ],
        quizzes: [
          {
            title: 'ABC Song Quiz',
            description: 'Test your knowledge of the alphabet',
            questions: [
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
            ]
          }
        ]
      },
      {
        title: 'Letter Recognition',
        videos: [
          {
            title: 'Uppercase Letters',
            description: 'Learn to recognize uppercase letters A-Z',
            url: sampleVideoUrls[2],
            duration: 200
          }
        ],
        quizzes: [
          {
            title: 'Letter Recognition Quiz',
            description: 'Test your ability to recognize letters',
            questions: [
              {
                prompt: 'Which letter is this: A',
                type: 'mcq',
                options: [
                  { text: 'A' },
                  { text: 'B' },
                  { text: 'C' },
                  { text: 'D' }
                ],
                correctAnswer: 0,
                explanation: 'This is the letter A.'
              }
            ]
          }
        ]
      }
    ]
  }
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

async function createVideo(token, videoData) {
  try {
    const formData = new FormData();
    formData.append('title', videoData.title);
    formData.append('description', videoData.description);
    formData.append('url', videoData.url);
    formData.append('thumbnail', 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Video');
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

async function createContentForExistingModules() {
  try {
    console.log('=== CREATING CONTENT FOR EXISTING MODULES ===');
    
    // Login as admin
    console.log('Logging in as admin...');
    const token = await loginAsAdmin();
    if (!token) {
      console.error('Failed to login as admin');
      return;
    }
    console.log('✅ Admin login successful');
    
    // Use the known module ID for Alphabet & Phonics
    const moduleId = '68cfdd9ae3bc97188711e040';
    const moduleTitle = 'Alphabet & Phonics';
    
    console.log(`\n--- Processing Module: ${moduleTitle} ---`);
    console.log(`Module ID: ${moduleId}`);
    
    const moduleContent = contentData[moduleTitle];
    if (!moduleContent) {
      console.log('No content data found for this module');
      return;
    }
    
    let totalVideosCreated = 0;
    let totalQuizzesCreated = 0;
    
    for (let i = 0; i < moduleContent.topics.length; i++) {
      const topic = moduleContent.topics[i];
      console.log(`\n  Processing Topic: ${topic.title}`);
      
      // Create videos for this topic
      for (let j = 0; j < topic.videos.length; j++) {
        const videoData = topic.videos[j];
        const videoPayload = {
          title: videoData.title,
          description: videoData.description,
          url: videoData.url,
          duration: videoData.duration,
          module: moduleId,
          topic: topic.title,
          topicDescription: `Learn about ${topic.title}`,
          sequenceOrder: j + 1,
          tags: [moduleTitle, topic.title, 'educational', 'video']
        };
        
        const video = await createVideo(token, videoPayload);
        if (video) {
          console.log(`    ✅ Created video: ${video.title}`);
          totalVideosCreated++;
        } else {
          console.log(`    ❌ Failed to create video: ${videoData.title}`);
        }
      }
      
      // Create quizzes for this topic
      for (let k = 0; k < topic.quizzes.length; k++) {
        const quizData = topic.quizzes[k];
        const quizPayload = {
          title: quizData.title,
          description: quizData.description,
          questions: quizData.questions,
          module: moduleId,
          topic: topic.title,
          topicDescription: `Learn about ${topic.title}`,
          sequenceOrder: k + 1,
          settings: {
            timeLimit: 10,
            passingScore: 70,
            allowRetake: true,
            showCorrectAnswers: true
          },
          tags: [moduleTitle, topic.title, 'quiz', 'assessment'],
          isPublished: true
        };
        
        const quiz = await createQuiz(token, quizPayload);
        if (quiz) {
          console.log(`    ✅ Created quiz: ${quiz.title}`);
          totalQuizzesCreated++;
        } else {
          console.log(`    ❌ Failed to create quiz: ${quizData.title}`);
        }
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`Module processed: ${moduleTitle}`);
    console.log(`Total videos created: ${totalVideosCreated}`);
    console.log(`Total quizzes created: ${totalQuizzesCreated}`);
    console.log('Content creation completed successfully!');
    
  } catch (error) {
    console.error('Error creating content:', error);
  }
}

// Run the script
createContentForExistingModules();












