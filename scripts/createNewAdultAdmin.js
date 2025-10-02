const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createNewAdultAdmin = async () => {
  try {
    // Connect to MongoDB Atlas
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/English-1?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Delete existing adult admin if exists
    console.log('\n🗑️ Removing existing adult admin...');
    await User.deleteOne({ email: 'amenityforge-adult@gmail.com' });
    console.log('✅ Existing adult admin removed');

    // Create new adult admin user
    console.log('\n👤 Creating new adult admin user...');
    const hashedPassword = await bcrypt.hash('Amenity', 12);
    
    const adultAdmin = new User({
      name: 'Adult Admin',
      email: 'amenityforge-adult@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      ageRange: '16+',
      preferences: {
        notifications: {
          email: true,
          push: true,
          weeklyDigest: true
        },
        language: {
          primary: 'en',
          secondary: 'hi'
        }
      },
      profile: {
        avatar: null,
        bio: 'Adult Learning Platform Administrator',
        location: {
          city: 'Global',
          state: 'Global',
          country: 'Global'
        },
        interests: ['communication', 'ai', 'finance']
      },
      progress: {
        totalTimeSpent: 0,
        currentStreak: 0,
        longestStreak: 0,
        points: 0,
        level: 1,
        badges: [],
        lastActivity: new Date(),
        completedModules: [],
        favoriteModules: []
      }
    });

    await adultAdmin.save();
    console.log('✅ New adult admin user created successfully!');
    console.log('📧 Email: amenityforge-adult@gmail.com');
    console.log('🔑 Password: Amenity');
    console.log('👤 Role: admin');
    console.log('🎯 Age Range: 16+ (Adults)');
    
    // Test the login
    console.log('\n🧪 Testing login...');
    const testUser = await User.findOne({ email: 'amenityforge-adult@gmail.com' });
    const isPasswordValid = await testUser.comparePassword('Amenity');
    
    if (isPasswordValid) {
      console.log('✅ Login test successful!');
    } else {
      console.log('❌ Login test failed!');
    }
    
    console.log('\n🎉 New adult admin user creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating new adult admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
};

// Run the creation
createNewAdultAdmin();
