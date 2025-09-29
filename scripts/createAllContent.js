const fetch = require('node-fetch');

const API_BASE_URL = 'http://192.168.1.11:5000';

// Content data for all modules and topics
const allContentData = {
  '68cfdd9ae3bc97188711e040': { // Alphabet & Phonics module ID
    title: 'Alphabet & Phonics',
    topics: [
      {
        title: 'ABC Song Fun',
        description: 'Learn A-Z sounds with fun animations and examples',
        videos: [
          {
            title: 'ABC Song - Learn the Alphabet',
            description: 'Sing along and learn the English alphabet with this fun ABC song',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            duration: 180
          },
          {
            title: 'Letter A to Z Sounds',
            description: 'Learn the sounds each letter makes from A to Z',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
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
        description: 'Identify and match uppercase and lowercase letters',
        videos: [
          {
            title: 'Uppercase Letters A-Z',
            description: 'Learn to recognize uppercase letters A-Z',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
            duration: 200
          },
          {
            title: 'Lowercase Letters a-z',
            description: 'Learn to recognize lowercase letters a-z',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_2mb.mp4',
            duration: 220
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
              },
              {
                prompt: 'Which letter is this: b',
                type: 'mcq',
                options: [
                  { text: 'a' },
                  { text: 'b' },
                  { text: 'c' },
                  { text: 'd' }
                ],
                correctAnswer: 1,
                explanation: 'This is the lowercase letter b.'
              }
            ]
          }
        ]
      },
      {
        title: 'Phonics Sounds',
        description: 'Learn the sounds each letter makes',
        videos: [
          {
            title: 'Consonant Sounds',
            description: 'Learn the sounds of consonant letters',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
            duration: 300
          }
        ],
        quizzes: [
          {
            title: 'Phonics Sounds Quiz',
            description: 'Test your knowledge of letter sounds',
            questions: [
              {
                prompt: 'What sound does the letter B make?',
                type: 'mcq',
                options: [
                  { text: 'buh' },
                  { text: 'bee' },
                  { text: 'bah' },
                  { text: 'boo' }
                ],
                correctAnswer: 0,
                explanation: 'The letter B makes the "buh" sound.'
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
      return data.data.token;
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

async function createVideoWithURL(token, videoData) {
  try {
    // Since the upload endpoint expects a file, let's create a video record directly
    // We'll use a different approach - create the video record in the database
    const response = await fetch(`${API_BASE_URL}/api/video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(videoData)
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

async function createAllContent() {
  try {
    console.log('=== CREATING CONTENT FOR ALL MODULES ===');
    
    // Login as admin
    console.log('Logging in as admin...');
    const token = await loginAsAdmin();
    if (!token) {
      console.error('Failed to login as admin');
      return;
    }
    console.log('✅ Admin login successful');
    
    let totalVideosCreated = 0;
    let totalQuizzesCreated = 0;
    
    // Process each module
    for (const [moduleId, moduleData] of Object.entries(allContentData)) {
      console.log(`\n--- Processing Module: ${moduleData.title} ---`);
      console.log(`Module ID: ${moduleId}`);
      console.log(`Topics: ${moduleData.topics.length}`);
      
      // Process each topic in the module
      for (let i = 0; i < moduleData.topics.length; i++) {
        const topic = moduleData.topics[i];
        console.log(`\n  Processing Topic: ${topic.title}`);
        
        // Create videos for this topic
        for (let j = 0; j < topic.videos.length; j++) {
          const videoData = topic.videos[j];
          const videoPayload = {
            title: videoData.title,
            description: videoData.description,
            url: videoData.url,
            thumbnail: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Video',
            duration: videoData.duration,
            module: moduleId,
            topic: topic.title,
            topicDescription: topic.description,
            sequenceOrder: j + 1,
            tags: [moduleData.title, topic.title, 'educational', 'video'],
            isPublished: true
          };
          
          const video = await createVideoWithURL(token, videoPayload);
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
            level: 'beginner',
            moduleId: moduleId,
            timeLimit: 10,
            passingScore: 70,
            topic: topic.title,
            topicDescription: topic.description,
            sequenceOrder: k + 1,
            tags: [moduleData.title, topic.title, 'quiz', 'assessment'],
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
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total modules processed: ${Object.keys(allContentData).length}`);
    console.log(`Total videos created: ${totalVideosCreated}`);
    console.log(`Total quizzes created: ${totalQuizzesCreated}`);
    console.log('Content creation completed successfully!');
    
  } catch (error) {
    console.error('Error creating content:', error);
  }
}

// Run the script
createAllContent();
