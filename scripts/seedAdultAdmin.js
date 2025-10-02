const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const seedAdultAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/English-1?retryWrites=true&w=majority&appName=Cluster0');

    console.log('🔗 Connected to MongoDB');

    // Check if adult admin already exists
    const existingAdmin = await User.findOne({ 
      email: 'amenityforge-adult@gmail.com',
      role: 'admin'
    });

    if (existingAdmin) {
      console.log('⚠️  Adult admin user already exists');
      console.log('📧 Email: amenityforge-adult@gmail.com');
      console.log('🔑 Password: Amenity');
      console.log('👤 Role: admin');
      return;
    }

    // Create adult admin user
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
      }
    });

    await adultAdmin.save();

    console.log('✅ Adult admin user created successfully!');
    console.log('📧 Email: amenityforge-adult@gmail.com');
    console.log('🔑 Password: Amenity');
    console.log('👤 Role: admin');
    console.log('🎯 Age Range: 16+ (Adults)');

  } catch (error) {
    console.error('❌ Error creating adult admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
seedAdultAdmin();
