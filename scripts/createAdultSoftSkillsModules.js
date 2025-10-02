const mongoose = require('mongoose');
const Module = require('../models/Module');
const User = require('../models/User');

const createAdultSoftSkillsModules = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/English-1?retryWrites=true&w=majority&appName=Cluster0');

    console.log('🔗 Connected to MongoDB');

    // Find adult admin user
    const adultAdmin = await User.findOne({ email: 'amenityforge-adult@gmail.com' });
    if (!adultAdmin) {
      console.log('❌ Adult admin user not found. Please run seedAdultAdmin.js first.');
      return;
    }

    console.log('👤 Found adult admin:', adultAdmin.email);

    // Adult Soft Skills modules data
    const adultSoftSkillsModules = [
      {
        title: 'Leadership and Team Management',
        description: 'Develop essential leadership skills for managing teams and driving organizational success.',
        moduleType: 'soft-skills',
        ageRange: '16+',
        difficulty: 'intermediate',
        estimatedDuration: 120,
        topics: [
          {
            title: 'Effective Communication',
            description: 'Master communication skills for leadership',
            order: 1,
            videos: [
              {
                title: 'Leadership Communication Styles',
                url: 'https://example.com/leadership-comm.mp4',
                duration: 600,
                thumbnail: 'https://example.com/leadership-thumb.jpg'
              }
            ],
            questions: [
              {
                question: 'What is the most important trait of a good leader?',
                options: ['Technical skills', 'Communication', 'Experience', 'Education'],
                correctAnswer: 1,
                explanation: 'Effective communication is the cornerstone of good leadership.'
              }
            ]
          }
        ],
        tags: ['soft-skills', 'business', 'professional'],
        isFeatured: true,
        isPremium: false
      },
      {
        title: 'Emotional Intelligence at Work',
        description: 'Learn to manage emotions and build better workplace relationships.',
        moduleType: 'soft-skills',
        ageRange: '16+',
        difficulty: 'beginner',
        estimatedDuration: 90,
        topics: [
          {
            title: 'Understanding Emotional Intelligence',
            description: 'Introduction to EQ in professional settings',
            order: 1,
            videos: [
              {
                title: 'EQ Fundamentals',
                url: 'https://example.com/eq-fundamentals.mp4',
                duration: 540,
                thumbnail: 'https://example.com/eq-thumb.jpg'
              }
            ],
            questions: [
              {
                question: 'What are the four components of emotional intelligence?',
                options: ['Self-awareness, self-regulation, motivation, empathy', 'Intelligence, memory, focus, creativity', 'Speed, accuracy, efficiency, quality', 'None of the above'],
                correctAnswer: 0,
                explanation: 'The four components are self-awareness, self-regulation, motivation, and empathy.'
              }
            ]
          }
        ],
        tags: ['soft-skills', 'business'],
        isFeatured: false,
        isPremium: false
      }
    ];

    // Create modules
    for (const moduleData of adultSoftSkillsModules) {
      const existingModule = await Module.findOne({ 
        title: moduleData.title,
        ageRange: '16+'
      });

      if (existingModule) {
        console.log(`⚠️  Module "${moduleData.title}" already exists`);
        continue;
      }

      const module = new Module({
        ...moduleData,
        createdBy: adultAdmin._id,
        status: 'published',
        publishAt: new Date()
      });

      await module.save();
      console.log(`✅ Created module: "${moduleData.title}"`);
    }

    console.log('🎉 Adult Soft Skills modules created successfully!');

  } catch (error) {
    console.error('❌ Error creating adult Soft Skills modules:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
createAdultSoftSkillsModules();
