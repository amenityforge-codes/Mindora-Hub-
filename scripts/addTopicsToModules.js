const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB using the same URI as server
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/english-learning-platform';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  addTopicsToModules();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Import models
const Module = require('../models/Module');

// Topics data for existing modules
const moduleTopics = {
  '68cfdd9ae3bc97188711e050': [ // Adjectives & Descriptions
    { title: 'Basic Adjectives', description: 'Learn common descriptive words', order: 1 },
    { title: 'Color Adjectives', description: 'Learn color words to describe things', order: 2 },
    { title: 'Size Adjectives', description: 'Learn words for big, small, tall, short', order: 3 },
    { title: 'Personality Adjectives', description: 'Learn words to describe people', order: 4 }
  ],
  '68cfdd9ae3bc97188711e051': [ // Prepositions & Directions
    { title: 'Basic Prepositions', description: 'Learn in, on, under, over', order: 1 },
    { title: 'Direction Words', description: 'Learn left, right, up, down', order: 2 },
    { title: 'Location Prepositions', description: 'Learn near, far, between, among', order: 3 },
    { title: 'Giving Directions', description: 'Practice giving and following directions', order: 4 }
  ],
  '68cfdd9ae3bc97188711e052': [ // Questions & Answers
    { title: 'Question Words', description: 'Learn what, where, when, why, how', order: 1 },
    { title: 'Yes/No Questions', description: 'Learn to ask and answer yes/no questions', order: 2 },
    { title: 'Information Questions', description: 'Learn to ask for specific information', order: 3 },
    { title: 'Answering Questions', description: 'Practice giving complete answers', order: 4 }
  ],
  '68cfdd9ae3bc97188711e053': [ // Conversation Practice
    { title: 'Greetings', description: 'Learn how to say hello and goodbye', order: 1 },
    { title: 'Introductions', description: 'Learn to introduce yourself and others', order: 2 },
    { title: 'Small Talk', description: 'Learn common conversation topics', order: 3 },
    { title: 'Asking for Help', description: 'Learn to ask for help politely', order: 4 }
  ]
};

async function addTopicsToModules() {
  try {
    console.log('=== ADDING TOPICS TO EXISTING MODULES ===');
    
    let totalTopicsAdded = 0;
    
    for (const [moduleId, topics] of Object.entries(moduleTopics)) {
      const module = await Module.findById(moduleId);
      
      if (module) {
        // Add topics to the module
        module.topics = topics;
        await module.save();
        
        console.log(`✅ Added ${topics.length} topics to: ${module.title}`);
        topics.forEach((topic, index) => {
          console.log(`     ${index + 1}. ${topic.title}`);
        });
        totalTopicsAdded += topics.length;
      } else {
        console.log(`❌ Module not found: ${moduleId}`);
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total topics added: ${totalTopicsAdded}`);
    console.log('Topics have been added to existing modules!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding topics to modules:', error);
    process.exit(1);
  }
}
