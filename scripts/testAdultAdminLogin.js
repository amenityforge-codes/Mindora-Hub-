const mongoose = require('mongoose');
const User = require('../models/User');

const testAdultAdminLogin = async () => {
  try {
    // Connect to MongoDB Atlas
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/English-1?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Find adult admin user
    console.log('\n👤 Finding Adult Admin User...');
    const adultAdmin = await User.findOne({ email: 'amenityforge-adult@gmail.com' });
    
    if (!adultAdmin) {
      console.log('❌ Adult admin user not found');
      return;
    }
    
    console.log('✅ Adult admin user found');
    console.log(`   Email: ${adultAdmin.email}`);
    console.log(`   Name: ${adultAdmin.name}`);
    console.log(`   Role: ${adultAdmin.role}`);
    console.log(`   Age Range: ${adultAdmin.ageRange}`);
    
    // Test password using the model method
    console.log('\n🔐 Testing password using model method...');
    const isPasswordValid = await adultAdmin.comparePassword('Amenity');
    
    if (isPasswordValid) {
      console.log('✅ Password verification successful!');
    } else {
      console.log('❌ Password verification failed!');
      console.log('   Setting new password...');
      
      // Set password (will be hashed by pre-save hook)
      adultAdmin.password = 'Amenity';
      await adultAdmin.save();
      
      console.log('✅ Password set successfully!');
      
      // Test the new password
      const isPasswordValidAfterUpdate = await adultAdmin.comparePassword('Amenity');
      if (isPasswordValidAfterUpdate) {
        console.log('✅ Password verification successful after update!');
      } else {
        console.log('❌ Password verification still failed after update!');
      }
    }
    
    console.log('\n🎉 Adult admin login test completed!');
    
  } catch (error) {
    console.error('❌ Error testing adult admin login:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
};

// Run the test
testAdultAdminLogin();
