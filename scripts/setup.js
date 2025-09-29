const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/English-1?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'amenityforge@gmail.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      return existingAdmin;
    }

    // Create admin user (password will be hashed by pre-save middleware)
    const adminUser = new User({
      name: 'Admin User',
      email: 'amenityforge@gmail.com',
      password: 'Amenity',
      role: 'admin',
      isEmailVerified: true,
      profile: {
        bio: 'Platform Administrator',
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India'
        },
        interests: ['communication', 'ai', 'finance']
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          weeklyDigest: true
        },
        language: {
          primary: 'en',
          secondary: 'hi'
        },
        difficulty: 'advanced'
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: amenityforge@gmail.com');
    console.log('🔑 Password: Amenity');
    console.log('👑 Role: admin');
    
    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
};

// Create sample modules for different age groups
const createSampleModules = async (adminUserId) => {
  try {
    const existingModules = await Module.countDocuments();
    if (existingModules > 0) {
      console.log('🗑️  Clearing existing modules...');
      await Module.deleteMany({});
      console.log('✅ Existing modules cleared');
    }

    const sampleModules = [
      // Ages 6-12 - All 20 modules
      {
        title: 'Alphabet & Phonics',
        description: 'Learn the English alphabet and basic phonics sounds',
        moduleType: 'phonics',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 30,
        createdBy: adminUserId,
        content: {
          text: 'Welcome to the world of English! In this lesson, we will learn the alphabet and basic phonics.',
          objectives: [
            'Recognize all 26 letters of the alphabet',
            'Learn basic phonics sounds',
            'Practice letter formation'
          ]
        },
        status: 'published',
        isFeatured: true,
        tags: ['phonics', 'foundations', 'reading']
      },
      {
        title: 'Basic Vocabulary',
        description: 'Learn essential English words for daily use',
        moduleType: 'vocabulary',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 25,
        createdBy: adminUserId,
        content: {
          text: 'Let\'s learn basic English vocabulary words that we use every day.',
          objectives: [
            'Learn 50 essential English words',
            'Practice pronunciation',
            'Use words in sentences'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['vocabulary', 'foundations']
      },
      {
        title: 'Numbers & Counting',
        description: 'Learn numbers from 1 to 100 and basic counting',
        moduleType: 'math',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 20,
        createdBy: adminUserId,
        content: {
          text: 'Let\'s learn numbers and how to count in English.',
          objectives: [
            'Count from 1 to 100',
            'Learn number words',
            'Practice counting objects'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['math', 'foundations']
      },
      {
        title: 'Colors & Shapes',
        description: 'Learn colors and basic shapes in English',
        moduleType: 'vocabulary',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 15,
        createdBy: adminUserId,
        content: {
          text: 'Discover the world of colors and shapes in English.',
          objectives: [
            'Learn 10 basic colors',
            'Identify 8 basic shapes',
            'Describe objects by color and shape'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['vocabulary', 'foundations']
      },
      {
        title: 'Family & Relationships',
        description: 'Learn family members and relationship words',
        moduleType: 'vocabulary',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 20,
        createdBy: adminUserId,
        content: {
          text: 'Learn about family members and how to talk about relationships.',
          objectives: [
            'Learn family member names',
            'Understand relationships',
            'Talk about your family'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['vocabulary', 'vocabulary', 'vocabulary']
      },
      {
        title: 'Animals & Nature',
        description: 'Learn about animals and nature in English',
        moduleType: 'vocabulary',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 25,
        createdBy: adminUserId,
        content: {
          text: 'Explore the animal kingdom and nature in English.',
          objectives: [
            'Learn 20 animal names',
            'Identify nature elements',
            'Describe animals and nature'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['vocabulary', 'vocabulary', 'vocabulary']
      },
      {
        title: 'Food & Drinks',
        description: 'Learn food and drink vocabulary',
        moduleType: 'vocabulary',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 20,
        createdBy: adminUserId,
        content: {
          text: 'Learn about different foods and drinks in English.',
          objectives: [
            'Learn 30 food and drink names',
            'Express food preferences',
            'Order food in English'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['vocabulary', 'vocabulary', 'vocabulary']
      },
      {
        title: 'Clothing & Accessories',
        description: 'Learn clothing and accessory vocabulary',
        moduleType: 'vocabulary',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 18,
        createdBy: adminUserId,
        content: {
          text: 'Learn about different types of clothing and accessories.',
          objectives: [
            'Learn 25 clothing items',
            'Describe what people are wearing',
            'Shop for clothes in English'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['vocabulary', 'vocabulary', 'vocabulary']
      },
      {
        title: 'Home & Furniture',
        description: 'Learn home and furniture vocabulary',
        moduleType: 'vocabulary',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 22,
        createdBy: adminUserId,
        content: {
          text: 'Learn about different rooms and furniture in a home.',
          objectives: [
            'Learn room names',
            'Identify furniture items',
            'Describe your home'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['vocabulary', 'vocabulary', 'vocabulary']
      },
      {
        title: 'School & Education',
        description: 'Learn school and education vocabulary',
        moduleType: 'vocabulary',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 20,
        createdBy: adminUserId,
        content: {
          text: 'Learn about school, subjects, and educational activities.',
          objectives: [
            'Learn school subjects',
            'Identify school supplies',
            'Talk about school activities'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['vocabulary', 'vocabulary', 'vocabulary']
      },
      {
        title: 'Body Parts & Health',
        description: 'Learn body parts and basic health vocabulary',
        moduleType: 'vocabulary',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 18,
        createdBy: adminUserId,
        content: {
          text: 'Learn about different body parts and basic health terms.',
          objectives: [
            'Learn 20 body parts',
            'Understand basic health terms',
            'Describe how you feel'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['vocabulary', 'vocabulary', 'vocabulary']
      },
      {
        title: 'Transportation',
        description: 'Learn transportation and travel vocabulary',
        moduleType: 'vocabulary',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 16,
        createdBy: adminUserId,
        content: {
          text: 'Learn about different ways to travel and transportation.',
          objectives: [
            'Learn 15 transportation methods',
            'Ask for directions',
            'Plan a trip'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['vocabulary', 'vocabulary', 'grammar']
      },
      {
        title: 'Weather & Seasons',
        description: 'Learn weather and seasons vocabulary',
        moduleType: 'vocabulary',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 15,
        createdBy: adminUserId,
        content: {
          text: 'Learn about different weather conditions and seasons.',
          objectives: [
            'Learn weather vocabulary',
            'Identify the four seasons',
            'Describe the weather'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['vocabulary', 'vocabulary', 'vocabulary']
      },
      {
        title: 'Time & Calendar',
        description: 'Learn time and calendar vocabulary',
        moduleType: 'vocabulary',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 20,
        createdBy: adminUserId,
        content: {
          text: 'Learn how to tell time and use calendar vocabulary.',
          objectives: [
            'Tell time in English',
            'Learn days and months',
            'Use calendar vocabulary'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['vocabulary', 'vocabulary', 'vocabulary']
      },
      {
        title: 'Basic Grammar',
        description: 'Learn basic English grammar rules',
        moduleType: 'grammar',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 25,
        createdBy: adminUserId,
        content: {
          text: 'Learn basic English grammar including nouns, verbs, and adjectives.',
          objectives: [
            'Understand basic grammar rules',
            'Identify parts of speech',
            'Form simple sentences'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['grammar', 'grammar']
      },
      {
        title: 'Common Verbs',
        description: 'Learn common English verbs and their usage',
        moduleType: 'grammar',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 22,
        createdBy: adminUserId,
        content: {
          text: 'Learn the most common English verbs and how to use them.',
          objectives: [
            'Learn 30 common verbs',
            'Use verbs in sentences',
            'Understand verb tenses'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['grammar', 'grammar', 'grammar']
      },
      {
        title: 'Adjectives & Descriptions',
        description: 'Learn adjectives to describe people and things',
        moduleType: 'grammar',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 18,
        createdBy: adminUserId,
        content: {
          text: 'Learn adjectives to describe people, places, and things.',
          objectives: [
            'Learn 25 descriptive adjectives',
            'Describe people and objects',
            'Use adjectives correctly'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['grammar', 'grammar', 'grammar']
      },
      {
        title: 'Prepositions & Directions',
        description: 'Learn prepositions and giving directions',
        moduleType: 'grammar',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 16,
        createdBy: adminUserId,
        content: {
          text: 'Learn prepositions and how to give directions in English.',
          objectives: [
            'Learn 15 common prepositions',
            'Give and follow directions',
            'Describe locations'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['grammar', 'grammar', 'grammar']
      },
      {
        title: 'Questions & Answers',
        description: 'Learn how to ask and answer questions',
        moduleType: 'grammar',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 20,
        createdBy: adminUserId,
        content: {
          text: 'Learn how to ask different types of questions and give answers.',
          objectives: [
            'Learn question words',
            'Form different question types',
            'Give appropriate answers'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['grammar', 'grammar', 'communication']
      },
      {
        title: 'Conversation Practice',
        description: 'Practice basic English conversations',
        moduleType: 'communication',
        ageRange: '6-12',
        difficulty: 'beginner',
        estimatedDuration: 25,
        createdBy: adminUserId,
        content: {
          text: 'Practice having basic conversations in English.',
          objectives: [
            'Practice common conversations',
            'Build speaking confidence',
            'Use learned vocabulary'
          ]
        },
        status: 'published',
        isFeatured: false,
        tags: ['communication', 'communication', 'communication']
      },

      // Ages 12-18
      {
        title: 'Advanced Grammar: Tenses',
        description: 'Master all English tenses with practical examples',
        moduleType: 'grammar',
        ageRange: '12-18',
        difficulty: 'intermediate',
        estimatedDuration: 45,
        createdBy: adminUserId,
        content: {
          text: 'This comprehensive lesson covers all 12 English tenses with clear explanations and examples.',
          objectives: [
            'Understand all 12 English tenses',
            'Practice tense usage in context',
            'Improve writing accuracy'
          ]
        },
        media: {
          video: {
            url: 'https://example.com/tenses-video.mp4',
            duration: 2700,
            thumbnail: 'https://example.com/tenses-thumb.jpg'
          },
          pdf: {
            url: 'https://example.com/tenses-notes.pdf',
            pages: 15
          }
        },
        status: 'published',
        isFeatured: true,
        tags: ['grammar', 'exam-prep']
      },
      {
        title: 'Essay Writing Fundamentals',
        description: 'Learn the structure and techniques of effective essay writing',
        moduleType: 'writing',
        ageRange: '12-18',
        difficulty: 'intermediate',
        estimatedDuration: 60,
        createdBy: adminUserId,
        content: {
          text: 'Master the art of essay writing with proper structure, argumentation, and style.',
          objectives: [
            'Learn essay structure (introduction, body, conclusion)',
            'Develop argumentation skills',
            'Improve writing style and vocabulary'
          ]
        },
        media: {
          pdf: {
            url: 'https://example.com/essay-guide.pdf',
            pages: 20
          }
        },
        status: 'published',
        isFeatured: false,
        tags: ['writing', 'academic', 'exam-prep']
      },

      // Ages 18+
      {
        title: 'Academic Writing and Research',
        description: 'Advanced academic writing skills for college and university',
        moduleType: 'writing',
        ageRange: '18+',
        difficulty: 'advanced',
        estimatedDuration: 90,
        createdBy: adminUserId,
        content: {
          text: 'Develop professional academic writing skills including research methodology and citation.',
          objectives: [
            'Master academic writing conventions',
            'Learn research and citation methods',
            'Develop critical thinking skills'
          ]
        },
        media: {
          video: {
            url: 'https://example.com/academic-writing.mp4',
            duration: 5400,
            thumbnail: 'https://example.com/academic-thumb.jpg'
          },
          pdf: {
            url: 'https://example.com/academic-guide.pdf',
            pages: 25
          }
        },
        status: 'published',
        isFeatured: true,
        tags: ['writing', 'academic', 'professional']
      },

      // Business Professionals
      {
        title: 'Business Communication Excellence',
        description: 'Professional communication skills for the workplace',
        moduleType: 'business-writing',
        ageRange: 'business',
        difficulty: 'advanced',
        estimatedDuration: 75,
        createdBy: adminUserId,
        content: {
          text: 'Enhance your professional communication skills for meetings, presentations, and negotiations.',
          objectives: [
            'Master business email writing',
            'Develop presentation skills',
            'Learn negotiation language'
          ]
        },
        media: {
          video: {
            url: 'https://example.com/business-comm.mp4',
            duration: 4500,
            thumbnail: 'https://example.com/business-thumb.jpg'
          }
        },
        status: 'published',
        isFeatured: true,
        tags: ['business', 'professional', 'communication']
      },

      // Life Skills Modules
      {
        title: 'AI Tools for Productivity',
        description: 'Learn to use AI tools effectively for work and learning',
        moduleType: 'ai',
        ageRange: '18+',
        difficulty: 'intermediate',
        estimatedDuration: 40,
        createdBy: adminUserId,
        content: {
          text: 'Discover how to leverage AI tools like ChatGPT, Grammarly, and others for enhanced productivity.',
          objectives: [
            'Understand AI tool capabilities',
            'Learn prompt engineering basics',
            'Apply AI tools in daily work'
          ]
        },
        media: {
          video: {
            url: 'https://example.com/ai-tools.mp4',
            duration: 2400,
            thumbnail: 'https://example.com/ai-thumb.jpg'
          }
        },
        status: 'published',
        isFeatured: false,
        tags: ['ai', 'professional']
      },
      {
        title: 'Personal Finance Management',
        description: 'Essential financial literacy and money management skills',
        moduleType: 'finance',
        ageRange: '18+',
        difficulty: 'intermediate',
        estimatedDuration: 50,
        createdBy: adminUserId,
        content: {
          text: 'Learn the fundamentals of personal finance, budgeting, and investment basics.',
          objectives: [
            'Create and maintain a budget',
            'Understand investment basics',
            'Plan for financial goals'
          ]
        },
        media: {
          pdf: {
            url: 'https://example.com/finance-guide.pdf',
            pages: 18
          }
        },
        status: 'published',
        isFeatured: false,
        tags: ['finance', 'professional']
      }
    ];

    await Module.insertMany(sampleModules);
    console.log('✅ Sample modules created successfully');
    console.log(`📚 Created ${sampleModules.length} sample modules for different age groups`);
    
  } catch (error) {
    console.error('❌ Error creating sample modules:', error);
    throw error;
  }
};

// Main setup function
const setup = async () => {
  try {
    console.log('🚀 Starting platform setup...\n');
    
    await connectDB();
    
    console.log('\n👤 Creating admin user...');
    const adminUser = await createAdminUser();
    
    console.log('\n📚 Creating sample modules...');
    await createSampleModules(adminUser._id);
    
    console.log('\n🎉 Platform setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('   ✅ Database connected');
    console.log('   ✅ Admin user created');
    console.log('   ✅ Sample modules added');
    console.log('\n🔑 Admin Login Credentials:');
    console.log('   Email: amenityforge@gmail.com');
    console.log('   Password: Amenity');
    console.log('\n🚀 You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 Database connection closed');
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setup();
}

module.exports = { setup, createAdminUser, createSampleModules };
