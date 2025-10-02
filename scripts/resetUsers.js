const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');

const resetUsers = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Delete all existing users
    console.log('🗑️  Deleting all existing users...');
    const deleteResult = await User.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} users`);

    console.log('🎉 All users cleared from MongoDB Atlas');
    console.log('📝 Run "npm run setup" to recreate admin user');
    console.log('📝 Run "npm run create-test-users" to recreate test users');

  } catch (error) {
    console.error('❌ Error resetting users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
};

// Run the script
resetUsers();



















