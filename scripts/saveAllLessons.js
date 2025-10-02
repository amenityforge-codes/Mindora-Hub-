const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');
const Topic = require('../models/Topic');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/english-learning', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const lessons = [
  {
    title: 'Alphabet & Phonics',
    description: 'Learn the English alphabet and basic phonics sounds',
    difficulty: 'Beginner',
    estimatedDuration: 120,
    ageRange: '6-15',
    topics: [
      { title: 'ABC Song Fun', description: 'Learn A-Z sounds with fun animations and examples', order: 1 },
      { title: 'Letter Hunt Game', description: 'Practice recognizing letters A through Z', order: 2 },
      { title: 'Magic Writing', description: 'Practice writing letters with guided tracing exercises', order: 3 }
    ]
  },
  {
    title: 'Basic Vocabulary',
    description: 'Essential words for daily communication',
    difficulty: 'Beginner',
    estimatedDuration: 90,
    ageRange: '6-15',
    topics: [
      { title: 'Around Me Words', description: 'Words for objects, animals, people, and daily life', order: 1 },
      { title: 'Picture Cards', description: 'Learn vocabulary using flashcards with pictures', order: 2 },
      { title: 'Match & Learn', description: 'Match pictures with their correct words', order: 3 }
    ]
  },
  {
    title: 'Numbers & Counting',
    description: 'Learn numbers 1-100 and basic counting',
    difficulty: 'Beginner',
    estimatedDuration: 60,
    ageRange: '6-15',
    topics: [
      { title: 'Counting to 100', description: 'Learn to count from 1 to 100', order: 1 },
      { title: 'Number Songs', description: 'Fun songs to learn numbers', order: 2 },
      { title: 'Counting Games', description: 'Interactive counting activities', order: 3 }
    ]
  },
  {
    title: 'Colors & Shapes',
    description: 'Identify and name different colors and shapes',
    difficulty: 'Beginner',
    estimatedDuration: 75,
    ageRange: '6-15',
    topics: [
      { title: 'Rainbow Colors', description: 'Learn all the colors of the rainbow', order: 1 },
      { title: 'Drawing Fun', description: 'Draw and color different shapes', order: 2 }
    ]
  },
  {
    title: 'Family & Friends',
    description: 'Learn about family members and relationships',
    difficulty: 'Beginner',
    estimatedDuration: 80,
    ageRange: '6-15',
    topics: [
      { title: 'Family Tree', description: 'Learn about family relationships', order: 1 },
      { title: 'Meet My Family', description: 'Introduce family members', order: 2 }
    ]
  },
  {
    title: 'Animals & Nature',
    description: 'Discover animals and natural world',
    difficulty: 'Beginner',
    estimatedDuration: 85,
    ageRange: '6-15',
    topics: [
      { title: 'Zoo & Farm Animals', description: 'Learn about different animals', order: 1 },
      { title: 'Nature Stories', description: 'Stories about nature and wildlife', order: 2 }
    ]
  },
  {
    title: 'Food & Cooking',
    description: 'Learn about food and cooking vocabulary',
    difficulty: 'Beginner',
    estimatedDuration: 70,
    ageRange: '6-15',
    topics: [
      { title: 'Food Around Me', description: 'Learn about different foods', order: 1 },
      { title: 'Restaurant Game', description: 'Practice ordering food', order: 2 }
    ]
  },
  {
    title: 'Clothing & Fashion',
    description: 'Learn about different types of clothing',
    difficulty: 'Beginner',
    estimatedDuration: 65,
    ageRange: '6-15',
    topics: [
      { title: 'My Clothes', description: 'Learn about different clothing items', order: 1 },
      { title: 'Fashion Show', description: 'Describe what people are wearing', order: 2 }
    ]
  },
  {
    title: 'Home & School',
    description: 'Learn about home and school environments',
    difficulty: 'Beginner',
    estimatedDuration: 60,
    ageRange: '6-15',
    topics: [
      { title: 'House Tour', description: 'Learn about different rooms in a house', order: 1 },
      { title: 'Label My Home', description: 'Label objects around the house', order: 2 }
    ]
  },
  {
    title: 'School Life',
    description: 'Learn about school activities and objects',
    difficulty: 'Beginner',
    estimatedDuration: 55,
    ageRange: '6-15',
    topics: [
      { title: 'My School Bag', description: 'Learn about school supplies', order: 1 },
      { title: 'Classroom Fun', description: 'Learn about classroom activities', order: 2 }
    ]
  },
  {
    title: 'Health & Body',
    description: 'Learn about health and body parts',
    difficulty: 'Beginner',
    estimatedDuration: 50,
    ageRange: '6-15',
    topics: [
      { title: 'Body Explorer', description: 'Learn about different body parts', order: 1 },
      { title: 'Doctor Visit', description: 'Learn about health and medical vocabulary', order: 2 }
    ]
  },
  {
    title: 'Transportation',
    description: 'Learn about different ways to travel',
    difficulty: 'Beginner',
    estimatedDuration: 45,
    ageRange: '6-15',
    topics: [
      { title: 'Wheels & Wings', description: 'Learn about different vehicles', order: 1 },
      { title: 'Adventure Map', description: 'Plan trips and journeys', order: 2 }
    ]
  },
  {
    title: 'Weather & Time',
    description: 'Learn about weather and time concepts',
    difficulty: 'Beginner',
    estimatedDuration: 40,
    ageRange: '6-15',
    topics: [
      { title: 'Sunny & Rainy', description: 'Learn about different weather conditions', order: 1 },
      { title: 'Weather News', description: 'Report the weather', order: 2 },
      { title: 'Calendar Magic', description: 'Learn about days, months, and seasons', order: 3 },
      { title: 'My Schedule', description: 'Learn about daily routines and schedules', order: 4 }
    ]
  },
  {
    title: 'Daily Routines',
    description: 'Learn about daily activities and routines',
    difficulty: 'Beginner',
    estimatedDuration: 35,
    ageRange: '6-15',
    topics: [
      { title: 'Sentence Builder', description: 'Build sentences about daily activities', order: 1 },
      { title: 'Word Puzzle', description: 'Solve word puzzles and games', order: 2 }
    ]
  },
  {
    title: 'Actions & Movement',
    description: 'Learn action words and movement vocabulary',
    difficulty: 'Beginner',
    estimatedDuration: 30,
    ageRange: '6-15',
    topics: [
      { title: 'Move & Play', description: 'Learn action words through movement', order: 1 },
      { title: 'Action Charades', description: 'Act out different actions', order: 2 }
    ]
  },
  {
    title: 'Stories & Imagination',
    description: 'Develop storytelling and imagination skills',
    difficulty: 'Beginner',
    estimatedDuration: 25,
    ageRange: '6-15',
    topics: [
      { title: 'Big & Small', description: 'Learn about size and comparison', order: 1 },
      { title: 'Picture Story', description: 'Create stories from pictures', order: 2 },
      { title: 'Position Words', description: 'Learn about location and position', order: 3 },
      { title: 'Treasure Hunt', description: 'Follow directions to find treasure', order: 4 }
    ]
  },
  {
    title: 'Questions & Answers',
    description: 'Learn to ask and answer questions',
    difficulty: 'Beginner',
    estimatedDuration: 20,
    ageRange: '6-15',
    topics: [
      { title: 'Question Time', description: 'Learn to ask different types of questions', order: 1 },
      { title: 'Quick Quiz', description: 'Answer questions quickly and accurately', order: 2 }
    ]
  },
  {
    title: 'Conversation Practice',
    description: 'Practice real-world conversations',
    difficulty: 'Beginner',
    estimatedDuration: 100,
    ageRange: '6-15',
    topics: [
      { title: 'Real Talk', description: 'Real-world dialogues: shopping, school, friends', order: 1 },
      { title: 'Story Adventure', description: 'Roleplay and storytelling', order: 2 }
    ]
  }
];

async function saveAllLessons() {
  try {
    console.log('Clearing existing lessons...');
    await Lesson.deleteMany({});
    await Topic.deleteMany({});
    
    console.log('Saving all lessons...');
    
    for (const lessonData of lessons) {
      console.log(`Creating lesson: ${lessonData.title}`);
      
      // Create lesson
      const lesson = new Lesson({
        title: lessonData.title,
        description: lessonData.description,
        difficulty: lessonData.difficulty,
        estimatedDuration: lessonData.estimatedDuration,
        ageRange: lessonData.ageRange
      });
      
      await lesson.save();
      
      // Create topics for this lesson
      for (const topicData of lessonData.topics) {
        console.log(`  Creating topic: ${topicData.title}`);
        
        const topic = new Topic({
          title: topicData.title,
          description: topicData.description,
          lesson: lesson._id,
          order: topicData.order
        });
        
        await topic.save();
        
        // Add topic to lesson
        await Lesson.findByIdAndUpdate(
          lesson._id,
          { $push: { topics: topic._id } }
        );
      }
    }
    
    console.log('All lessons saved successfully!');
    console.log(`Total lessons: ${lessons.length}`);
    
    // Verify the save
    const savedLessons = await Lesson.find().populate('topics');
    console.log(`Verified: ${savedLessons.length} lessons in database`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error saving lessons:', error);
    process.exit(1);
  }
}

saveAllLessons();
