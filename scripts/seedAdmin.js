const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/English-1?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'amenityforge@gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('Amenity', saltRounds);

    // Create admin user
    const adminUser = new User({
      email: 'amenityforge@gmail.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true,
      profile: {
        age: 25,
        location: 'India',
        nativeLanguage: 'English',
        learningGoals: ['Admin Management'],
        interests: ['Content Management', 'User Analytics']
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          weeklyDigest: true
        },
        language: 'en',
        theme: 'light'
      }
    });

    await adminUser.save();
    console.log('Admin user created successfully:');
    console.log('Email: amenityforge@gmail.com');
    console.log('Password: Amenity');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createAdminUser();
  mongoose.connection.close();
  console.log('Database connection closed');
};

// Run the script
main().catch(console.error);















