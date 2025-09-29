const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testServerConnection() {
  try {
    console.log('Testing server connection...');
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');

    console.log('Testing User model...');
    const adminUser = await User.findOne({ email: 'amenityforge@gmail.com' }).select('+password');
    
    if (adminUser) {
      console.log('✅ Admin user found');
      console.log('  - Name:', adminUser.name);
      console.log('  - Email:', adminUser.email);
      console.log('  - Role:', adminUser.role);
      console.log('  - Has Password:', !!adminUser.password);
      console.log('  - Password Length:', adminUser.password ? adminUser.password.length : 0);
      
      // Test password comparison
      console.log('Testing password comparison...');
      const isMatch = await adminUser.comparePassword('Amenity');
      console.log('Password match result:', isMatch);
      
      // Test JWT token generation
      console.log('Testing JWT token generation...');
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );
      console.log('JWT token generated:', !!token);
      console.log('Token length:', token.length);
      
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

testServerConnection();




