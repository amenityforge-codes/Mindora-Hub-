const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Module = require('../models/Module');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/english-learning', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestQuiz() {
  try {
    // Find or create a test module
    let testModule = await Module.findOne({ title: 'Alphabet & Phonics' });
    
    if (!testModule) {
      testModule = new Module({
        title: 'Alphabet & Phonics',
        description: 'Learn A–Z sounds, recognition, and basic blending',
        ageRange: '6-12',
        level: 'beginner',
        estimatedDuration: 20,
        topics: [
          { title: 'Letter Recognition', description: 'Learn to identify letters', order: 1 },
          { title: 'Letter Sounds', description: 'Master letter sounds', order: 2 },
          { title: 'Letter Formation', description: 'Practice writing letters', order: 3 },
          { title: 'Beginning Sounds', description: 'Identify beginning sounds', order: 4 },
          { title: 'Rhyming Words', description: 'Learn rhyming words', order: 5 },
          { title: 'Sight Words', description: 'Master sight words', order: 6 }
        ],
        tags: ['phonics', 'alphabet', 'beginner'],
        isPublished: true
      });
      await testModule.save();
      console.log('Created test module:', testModule._id);
    }

    // Create a test quiz
    const testQuiz = new Quiz({
      title: 'Alphabet & Phonics Quiz',
      description: 'Test your knowledge of letters and sounds',
      level: 1,
      moduleId: testModule._id,
      timeLimit: 10,
      passingScore: 70,
      questions: [
        {
          question: 'What is the first letter of the alphabet?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          explanation: 'A is the first letter of the English alphabet.'
        },
        {
          question: 'Which letter makes the "buh" sound?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 1,
          explanation: 'The letter B makes the "buh" sound.'
        },
        {
          question: 'What sound does the letter C make?',
          options: ['kuh', 'suh', 'chuh', 'Both kuh and suh'],
          correctAnswer: 3,
          explanation: 'The letter C can make both "kuh" and "suh" sounds.'
        },
        {
          question: 'Which word starts with the letter D?',
          options: ['Apple', 'Dog', 'Cat', 'Ball'],
          correctAnswer: 1,
          explanation: 'Dog starts with the letter D.'
        },
        {
          question: 'How many letters are in the English alphabet?',
          options: ['24', '25', '26', '27'],
          correctAnswer: 2,
          explanation: 'The English alphabet has 26 letters.'
        }
      ],
      createdBy: testModule._id, // Using module ID as placeholder
      isPublished: true
    });

    await testQuiz.save();
    console.log('Created test quiz:', testQuiz._id);
    console.log('Quiz title:', testQuiz.title);
    console.log('Number of questions:', testQuiz.questions.length);
    console.log('Module ID:', testQuiz.moduleId);

    // Also create a quiz for the module ID '1' (string format)
    const stringModuleQuiz = new Quiz({
      title: 'Alphabet & Phonics Quiz (String ID)',
      description: 'Test quiz for module ID 1',
      level: 1,
      moduleId: testModule._id,
      timeLimit: 10,
      passingScore: 70,
      questions: [
        {
          question: 'What letter comes after A?',
          options: ['B', 'C', 'D', 'E'],
          correctAnswer: 0,
          explanation: 'B comes after A in the alphabet.'
        },
        {
          question: 'Which letter makes the "kuh" sound?',
          options: ['C', 'K', 'Q', 'All of the above'],
          correctAnswer: 3,
          explanation: 'C, K, and Q can all make the "kuh" sound.'
        }
      ],
      createdBy: testModule._id,
      isPublished: true
    });

    await stringModuleQuiz.save();
    console.log('Created string module quiz:', stringModuleQuiz._id);

    console.log('\nTest quiz creation completed!');
    console.log('Module ID:', testModule._id);
    console.log('Quiz IDs:', [testQuiz._id, stringModuleQuiz._id]);
    
  } catch (error) {
    console.error('Error creating test quiz:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestQuiz();











