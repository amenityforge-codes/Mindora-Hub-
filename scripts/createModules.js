const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ei-english')
  .then(() => {
    console.log('Connected to MongoDB');
    createModules();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import models
const Module = require('../backend/models/Module');

const modulesData = [
  {
    title: 'Alphabet & Phonics',
    description: 'Learn the English alphabet and basic phonics sounds',
    ageRange: '6-12',
    level: 'beginner',
    estimatedDuration: 120,
    topics: [
      {
        title: 'ABC Song Fun',
        description: 'Learn A-Z sounds with fun animations and examples',
        order: 1
      },
      {
        title: 'Letter Recognition',
        description: 'Identify and match uppercase and lowercase letters',
        order: 2
      },
      {
        title: 'Phonics Sounds',
        description: 'Learn the sounds each letter makes',
        order: 3
      }
    ],
    tags: ['alphabet', 'phonics', 'beginner', 'reading'],
    isPublished: true
  },
  {
    title: 'Basic Vocabulary',
    description: 'Essential English words for daily communication',
    ageRange: '6-12',
    level: 'beginner',
    estimatedDuration: 90,
    topics: [
      {
        title: 'Family Words',
        description: 'Learn words for family members',
        order: 1
      },
      {
        title: 'Colors & Shapes',
        description: 'Identify colors and basic shapes',
        order: 2
      },
      {
        title: 'Animals',
        description: 'Learn names of common animals',
        order: 3
      }
    ],
    tags: ['vocabulary', 'words', 'beginner', 'communication'],
    isPublished: true
  },
  {
    title: 'Numbers & Counting',
    description: 'Learn numbers from 1 to 100 and basic counting',
    ageRange: '6-12',
    level: 'beginner',
    estimatedDuration: 60,
    topics: [
      {
        title: 'Numbers 1-10',
        description: 'Learn to count from 1 to 10',
        order: 1
      },
      {
        title: 'Numbers 11-20',
        description: 'Learn to count from 11 to 20',
        order: 2
      },
      {
        title: 'Counting Objects',
        description: 'Practice counting real objects',
        order: 3
      }
    ],
    tags: ['numbers', 'counting', 'math', 'beginner'],
    isPublished: true
  },
  {
    title: 'Simple Sentences',
    description: 'Build basic English sentences',
    ageRange: '6-12',
    level: 'intermediate',
    estimatedDuration: 150,
    topics: [
      {
        title: 'I am...',
        description: 'Learn to introduce yourself',
        order: 1
      },
      {
        title: 'This is...',
        description: 'Point out objects and people',
        order: 2
      },
      {
        title: 'I like...',
        description: 'Express preferences',
        order: 3
      }
    ],
    tags: ['sentences', 'grammar', 'intermediate', 'speaking'],
    isPublished: true
  },
  {
    title: 'Daily Activities',
    description: 'Learn words and phrases for daily routines',
    ageRange: '6-12',
    level: 'intermediate',
    estimatedDuration: 120,
    topics: [
      {
        title: 'Morning Routine',
        description: 'Learn morning activities',
        order: 1
      },
      {
        title: 'School Activities',
        description: 'Words for school and learning',
        order: 2
      },
      {
        title: 'Evening Routine',
        description: 'Learn evening activities',
        order: 3
      }
    ],
    tags: ['daily', 'routine', 'activities', 'intermediate'],
    isPublished: true
  }
];

async function createModules() {
  try {
    console.log('=== CREATING MODULES ===');
    
    // Clear existing modules
    await Module.deleteMany({});
    console.log('Cleared existing modules');
    
    // Create new modules
    for (const moduleData of modulesData) {
      const module = new Module(moduleData);
      await module.save();
      console.log(`✅ Created module: ${module.title}`);
      console.log(`   Topics: ${module.topics.length}`);
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total modules created: ${modulesData.length}`);
    console.log('Modules creation completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating modules:', error);
    process.exit(1);
  }
}















