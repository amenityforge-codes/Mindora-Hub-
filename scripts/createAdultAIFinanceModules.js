const mongoose = require('mongoose');
const Module = require('../models/Module');
const User = require('../models/User');

const createAdultAIFinanceModules = async () => {
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

    // Adult AI and Finance modules data
    const adultAIFinanceModules = [
      {
        title: 'AI for Business Professionals',
        description: 'Learn how to leverage AI tools for business productivity and decision making.',
        moduleType: 'ai',
        ageRange: '16+',
        difficulty: 'intermediate',
        estimatedDuration: 60,
        topics: [
          {
            title: 'Introduction to AI in Business',
            description: 'Understanding AI applications in modern business',
            order: 1,
            videos: [
              {
                title: 'AI Fundamentals for Business',
                url: 'https://example.com/ai-fundamentals.mp4',
                duration: 300,
                thumbnail: 'https://example.com/ai-thumb.jpg'
              }
            ],
            questions: [
              {
                question: 'What is the primary benefit of AI in business?',
                options: ['Cost reduction', 'Improved decision making', 'Faster processing', 'All of the above'],
                correctAnswer: 3,
                explanation: 'AI provides multiple benefits including cost reduction, improved decision making, and faster processing.'
              }
            ]
          },
          {
            title: 'AI Tools for Productivity',
            description: 'Practical AI tools for daily business tasks',
            order: 2,
            videos: [
              {
                title: 'ChatGPT for Business Writing',
                url: 'https://example.com/chatgpt-business.mp4',
                duration: 450,
                thumbnail: 'https://example.com/chatgpt-thumb.jpg'
              }
            ],
            questions: [
              {
                question: 'Which AI tool is best for business writing?',
                options: ['ChatGPT', 'Claude', 'Gemini', 'All are effective'],
                correctAnswer: 3,
                explanation: 'Different AI tools have different strengths, and the best choice depends on the specific task.'
              }
            ]
          }
        ],
        tags: ['ai', 'business', 'professional'],
        isFeatured: true,
        isPremium: false
      },
      {
        title: 'Personal Finance Management',
        description: 'Master personal finance skills for financial independence and wealth building.',
        moduleType: 'finance',
        ageRange: '16+',
        difficulty: 'beginner',
        estimatedDuration: 90,
        topics: [
          {
            title: 'Budgeting and Expense Tracking',
            description: 'Learn to create and maintain a personal budget',
            order: 1,
            videos: [
              {
                title: 'Creating Your First Budget',
                url: 'https://example.com/budgeting.mp4',
                duration: 600,
                thumbnail: 'https://example.com/budget-thumb.jpg'
              }
            ],
            questions: [
              {
                question: 'What is the 50/30/20 rule in budgeting?',
                options: ['50% needs, 30% wants, 20% savings', '50% savings, 30% needs, 20% wants', '50% wants, 30% needs, 20% savings', 'None of the above'],
                correctAnswer: 0,
                explanation: 'The 50/30/20 rule allocates 50% to needs, 30% to wants, and 20% to savings and debt repayment.'
              }
            ]
          },
          {
            title: 'Investment Basics',
            description: 'Introduction to investing for beginners',
            order: 2,
            videos: [
              {
                title: 'Stock Market Fundamentals',
                url: 'https://example.com/investing.mp4',
                duration: 720,
                thumbnail: 'https://example.com/invest-thumb.jpg'
              }
            ],
            questions: [
              {
                question: 'What is compound interest?',
                options: ['Interest on interest', 'Simple interest', 'Fixed interest', 'Variable interest'],
                correctAnswer: 0,
                explanation: 'Compound interest is interest calculated on the initial principal and accumulated interest from previous periods.'
              }
            ]
          }
        ],
        tags: ['finance', 'business'],
        isFeatured: true,
        isPremium: false
      },
      {
        title: 'AI-Powered Financial Analysis',
        description: 'Use AI tools for financial data analysis and investment decisions.',
        moduleType: 'ai',
        ageRange: '16+',
        difficulty: 'advanced',
        estimatedDuration: 75,
        topics: [
          {
            title: 'AI in Financial Modeling',
            description: 'Using AI for predictive financial modeling',
            order: 1,
            videos: [
              {
                title: 'Machine Learning for Finance',
                url: 'https://example.com/ml-finance.mp4',
                duration: 900,
                thumbnail: 'https://example.com/ml-thumb.jpg'
              }
            ],
            questions: [
              {
                question: 'What is the main advantage of AI in financial analysis?',
                options: ['Speed', 'Accuracy', 'Pattern recognition', 'All of the above'],
                correctAnswer: 3,
                explanation: 'AI provides speed, accuracy, and superior pattern recognition in financial analysis.'
              }
            ]
          }
        ],
        tags: ['ai', 'finance', 'business'],
        isFeatured: false,
        isPremium: true
      }
    ];

    // Create modules
    for (const moduleData of adultAIFinanceModules) {
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

    console.log('🎉 Adult AI/Finance modules created successfully!');

  } catch (error) {
    console.error('❌ Error creating adult AI/Finance modules:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
createAdultAIFinanceModules();
