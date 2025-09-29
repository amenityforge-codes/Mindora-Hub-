const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixAdminPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');

    console.log('Finding admin user...');
    const adminUser = await User.findOne({ email: 'amenityforge@gmail.com' });
    
    if (adminUser) {
      console.log('✅ Admin user found, updating password...');
      adminUser.password = 'Amenity'; // This will be hashed by the pre-save middleware
      await adminUser.save();
      console.log('✅ Admin password updated successfully');
      
      // Verify the password was saved correctly
      const updatedUser = await User.findOne({ email: 'amenityforge@gmail.com' }).select('+password');
      console.log('Password length after update:', updatedUser.password ? updatedUser.password.length : 0);
      
      // Test password comparison
      const isMatch = await updatedUser.comparePassword('Amenity');
      console.log('Password comparison test:', isMatch ? '✅ SUCCESS' : '❌ FAILED');
      
    } else {
      console.log('❌ Admin user not found');
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixAdminPassword();
