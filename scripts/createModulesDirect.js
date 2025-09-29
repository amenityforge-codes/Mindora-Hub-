const mongoose = require('mongoose');
const Module = require('../models/Module');
const Video = require('../models/Video');
const Quiz = require('../models/Quiz');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ei-english');

const modulesData = [
  {
    title: 'Alphabet & Phonics',
    description: 'Learn the alphabet and basic phonics sounds',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 30,
    tags: ['alphabet', 'phonics', 'beginner'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Basic Vocabulary',
    description: 'Essential words for daily communication',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 25,
    tags: ['vocabulary', 'words', 'daily'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Numbers & Counting',
    description: 'Learn numbers from 1 to 100',
    ageRange: '6-12',
    moduleType: 'math',
    difficulty: 'beginner',
    duration: 20,
    tags: ['numbers', 'counting', 'math'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Colors & Shapes',
    description: 'Learn basic colors and shapes',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 15,
    tags: ['colors', 'shapes', 'visual'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Animals & Nature',
    description: 'Learn about animals and nature',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 30,
    tags: ['animals', 'nature', 'wildlife'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Food & Drinks',
    description: 'Learn food vocabulary and ordering',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 20,
    tags: ['food', 'drinks', 'restaurant'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Clothing & Fashion',
    description: 'Learn clothing vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 18,
    tags: ['clothing', 'fashion', 'dress'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Home & Furniture',
    description: 'Learn home and furniture vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 22,
    tags: ['home', 'furniture', 'rooms'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'School & Education',
    description: 'Learn school-related vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 25,
    tags: ['school', 'education', 'learning'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Body Parts & Health',
    description: 'Learn body parts and health vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 20,
    tags: ['body', 'health', 'anatomy'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Transportation',
    description: 'Learn transportation vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 18,
    tags: ['transportation', 'vehicles', 'travel'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Weather & Seasons',
    description: 'Learn weather and seasons vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 20,
    tags: ['weather', 'seasons', 'climate'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Time & Calendar',
    description: 'Learn time and calendar vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 25,
    tags: ['time', 'calendar', 'schedule'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Basic Grammar',
    description: 'Learn basic grammar rules',
    ageRange: '6-12',
    moduleType: 'grammar',
    difficulty: 'beginner',
    duration: 30,
    tags: ['grammar', 'rules', 'sentences'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Common Verbs',
    description: 'Learn essential action words',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 22,
    tags: ['verbs', 'actions', 'words'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Adjectives & Descriptions',
    description: 'Learn describing words',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 20,
    tags: ['adjectives', 'descriptions', 'words'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Prepositions & Directions',
    description: 'Learn position and direction words',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 18,
    tags: ['prepositions', 'directions', 'position'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Grammar Fundamentals',
    description: 'Essential grammar rules for teenagers',
    ageRange: '12-18',
    moduleType: 'grammar',
    difficulty: 'intermediate',
    duration: 45,
    tags: ['grammar', 'rules', 'structure'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Academic Writing',
    description: 'Learn formal writing skills',
    ageRange: '12-18',
    moduleType: 'writing',
    difficulty: 'intermediate',
    duration: 60,
    tags: ['writing', 'academic', 'essays'],
    status: 'published',
    publishAt: new Date()
  },
  {
    title: 'Business Communication',
    description: 'Professional communication skills',
    ageRange: '18+',
    moduleType: 'communication',
    difficulty: 'advanced',
    duration: 50,
    tags: ['business', 'professional', 'communication'],
    status: 'published',
    publishAt: new Date()
  }
];

// Sample videos and quizzes for each module
const contentData = {
  'Alphabet & Phonics': {
    videos: [
      {
        title: 'ABC Song - Learn the Alphabet',
        description: 'Sing along and learn all 26 letters of the alphabet',
        duration: 180,
        tags: ['alphabet', 'song', 'music'],
        topic: 'ABC Song Fun',
        topicDescription: 'Learn A–Z sounds with fun animations and examples'
      },
      {
        title: 'Letter A - Apple',
        description: 'Learn the letter A with apple examples',
        duration: 120,
        tags: ['letter-a', 'apple', 'vocabulary'],
        topic: 'ABC Song Fun',
        topicDescription: 'Learn A–Z sounds with fun animations and examples'
      }
    ],
    quizzes: [
      {
        title: 'ABC Song Quiz',
        description: 'Test your knowledge of the alphabet',
        questions: [
          {
            question: 'What is the first letter of the alphabet?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            explanation: 'A is the first letter of the English alphabet'
          },
          {
            question: 'What letter comes after B?',
            options: ['A', 'C', 'D', 'E'],
            correctAnswer: 1,
            explanation: 'C comes after B in the alphabet'
          }
        ],
        topic: 'ABC Song Fun',
        topicDescription: 'Learn A–Z sounds with fun animations and examples'
      }
    ]
  },
  'Basic Vocabulary': {
    videos: [
      {
        title: 'My Family',
        description: 'Learn family member vocabulary',
        duration: 150,
        tags: ['family', 'relatives', 'vocabulary'],
        topic: 'Family Words',
        topicDescription: 'Learn family member names'
      }
    ],
    quizzes: [
      {
        title: 'Family Quiz',
        description: 'Test your family vocabulary',
        questions: [
          {
            question: 'What do you call your mother\'s sister?',
            options: ['Aunt', 'Uncle', 'Cousin', 'Grandmother'],
            correctAnswer: 0,
            explanation: 'Your mother\'s sister is your aunt'
          }
        ],
        topic: 'Family Words',
        topicDescription: 'Learn family member names'
      }
    ]
  },
  'Numbers & Counting': {
    videos: [
      {
        title: 'Counting 1 to 10',
        description: 'Learn numbers with fun animations',
        duration: 120,
        tags: ['counting', 'numbers', '1-10'],
        topic: 'Numbers 1-10',
        topicDescription: 'Learn to count from 1 to 10'
      }
    ],
    quizzes: [
      {
        title: 'Numbers Quiz',
        description: 'Test your counting skills',
        questions: [
          {
            question: 'What number comes after 5?',
            options: ['4', '6', '7', '8'],
            correctAnswer: 1,
            explanation: '6 comes after 5 in counting'
          }
        ],
        topic: 'Numbers 1-10',
        topicDescription: 'Learn to count from 1 to 10'
      }
    ]
  },
  'Colors & Shapes': {
    videos: [
      {
        title: 'Colors of the Rainbow',
        description: 'Learn red, orange, yellow, green, blue, indigo, violet',
        duration: 100,
        tags: ['colors', 'rainbow', 'visual'],
        topic: 'Rainbow Colors',
        topicDescription: 'Learn all the colors of the rainbow'
      }
    ],
    quizzes: [
      {
        title: 'Colors Quiz',
        description: 'Test your color knowledge',
        questions: [
          {
            question: 'What color do you get when you mix red and blue?',
            options: ['Green', 'Purple', 'Orange', 'Yellow'],
            correctAnswer: 1,
            explanation: 'Red and blue make purple'
          }
        ],
        topic: 'Rainbow Colors',
        topicDescription: 'Learn all the colors of the rainbow'
      }
    ]
  },
  'Animals & Nature': {
    videos: [
      {
        title: 'Farm Animal Sounds',
        description: 'Learn animal names and sounds',
        duration: 180,
        tags: ['farm', 'animals', 'sounds'],
        topic: 'Farm Animals',
        topicDescription: 'Learn about animals on the farm'
      }
    ],
    quizzes: [
      {
        title: 'Farm Animals Quiz',
        description: 'Test your farm animal knowledge',
        questions: [
          {
            question: 'What sound does a cow make?',
            options: ['Moo', 'Baa', 'Oink', 'Cluck'],
            correctAnswer: 0,
            explanation: 'Cows make the sound "moo"'
          }
        ],
        topic: 'Farm Animals',
        topicDescription: 'Learn about animals on the farm'
      }
    ]
  }
};

async function createModulesDirect() {
  try {
    console.log('🗑️ Clearing existing modules, videos, and quizzes...');
    await Module.deleteMany({});
    await Video.deleteMany({});
    await Quiz.deleteMany({});

    console.log('📚 Creating 20 modules with videos and quizzes...');
    
    for (let i = 0; i < modulesData.length; i++) {
      const moduleData = modulesData[i];
      console.log(`\n📖 Creating module ${i + 1}/20: ${moduleData.title}`);
      
      // Create module
      const module = new Module(moduleData);
      await module.save();
      console.log(`✅ Module created: ${module.title}`);
      
      // Create videos and quizzes for this module
      const moduleContent = contentData[moduleData.title];
      if (moduleContent) {
        // Create videos
        for (let j = 0; j < moduleContent.videos.length; j++) {
          const videoData = moduleContent.videos[j];
          const video = new Video({
            ...videoData,
            moduleId: module._id,
            level: 1,
            sequenceOrder: j + 1,
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          await video.save();
          console.log(`  ✅ Video created: ${video.title}`);
        }
        
        // Create quizzes
        for (let k = 0; k < moduleContent.quizzes.length; k++) {
          const quizData = moduleContent.quizzes[k];
          const quiz = new Quiz({
            ...quizData,
            moduleId: module._id,
            level: 1,
            sequenceOrder: k + 1,
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          await quiz.save();
          console.log(`  ✅ Quiz created: ${quiz.title}`);
        }
      } else {
        // Create default content for modules without specific content
        const defaultVideo = new Video({
          title: `${moduleData.title} - Introduction`,
          description: `Learn about ${moduleData.title.toLowerCase()}`,
          moduleId: module._id,
          level: 1,
          duration: 120,
          tags: [moduleData.moduleType],
          topic: 'Introduction',
          topicDescription: `Introduction to ${moduleData.title}`,
          sequenceOrder: 1,
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        await defaultVideo.save();
        console.log(`  ✅ Default video created: ${defaultVideo.title}`);
        
        const defaultQuiz = new Quiz({
          title: `${moduleData.title} - Quiz`,
          description: `Test your knowledge of ${moduleData.title.toLowerCase()}`,
          moduleId: module._id,
          level: 1,
          questions: [
            {
              question: `What is the main topic of this module?`,
              options: [moduleData.title, 'Something else', 'I don\'t know', 'Maybe'],
              correctAnswer: 0,
              explanation: `This module is about ${moduleData.title}`
            }
          ],
          topic: 'Introduction',
          topicDescription: `Introduction to ${moduleData.title}`,
          sequenceOrder: 1,
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        await defaultQuiz.save();
        console.log(`  ✅ Default quiz created: ${defaultQuiz.title}`);
      }
    }
    
    console.log('\n🎉 Successfully created 20 modules with videos and quizzes!');
    console.log('\n📊 Summary:');
    console.log(`- Modules: ${modulesData.length}`);
    
    const totalVideos = await Video.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    
    console.log(`- Videos: ${totalVideos}`);
    console.log(`- Quizzes: ${totalQuizzes}`);
    
    console.log('\n💡 Next steps:');
    console.log('1. Go to the admin dashboard');
    console.log('2. Upload actual video files for each video');
    console.log('3. Add more videos and quizzes as needed');
    console.log('4. Test the student dashboard to see the content');
    
  } catch (error) {
    console.error('❌ Error creating modules:', error);
  } finally {
    mongoose.connection.close();
  }
}

createModulesDirect();












