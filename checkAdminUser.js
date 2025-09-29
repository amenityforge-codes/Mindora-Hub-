const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');

    console.log('Checking for admin user...');
    const adminUser = await User.findOne({ email: 'amenityforge@gmail.com' });
    
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log('  - Name:', adminUser.name);
      console.log('  - Email:', adminUser.email);
      console.log('  - Role:', adminUser.role);
      console.log('  - Is Active:', adminUser.isActive);
      console.log('  - Has Password:', !!adminUser.password);
      console.log('  - Password Length:', adminUser.password ? adminUser.password.length : 0);
    } else {
      console.log('❌ Admin user not found');
    }

    // Test password comparison
    if (adminUser) {
      console.log('Testing password comparison...');
      try {
        const isMatch = await adminUser.comparePassword('Amenity');
        console.log('Password match result:', isMatch);
      } catch (error) {
        console.error('Password comparison error:', error.message);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkAdminUser();




