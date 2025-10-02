const mongoose = require('mongoose');
const User = require('../models/User');

const fixAdultAdminLogin = async () => {
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
    
    // Set a simple password that will be hashed by the pre-save hook
    console.log('\n🔐 Setting password...');
    adultAdmin.password = 'Amenity';
    await adultAdmin.save();
    
    console.log('✅ Password set successfully!');
    
    // Test login by finding user and comparing password
    console.log('\n🧪 Testing login...');
    const testUser = await User.findOne({ email: 'amenityforge-adult@gmail.com' });
    const isPasswordValid = await testUser.comparePassword('Amenity');
    
    if (isPasswordValid) {
      console.log('✅ Login test successful!');
    } else {
      console.log('❌ Login test failed!');
      console.log('   Trying alternative approach...');
      
      // Try to manually hash and set password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Amenity', 12);
      
      // Update password directly in database
      await User.updateOne(
        { email: 'amenityforge-adult@gmail.com' },
        { password: hashedPassword }
      );
      
      console.log('✅ Password updated directly in database');
      
      // Test again
      const testUser2 = await User.findOne({ email: 'amenityforge-adult@gmail.com' });
      const isPasswordValid2 = await testUser2.comparePassword('Amenity');
      
      if (isPasswordValid2) {
        console.log('✅ Login test successful after direct update!');
      } else {
        console.log('❌ Login test still failed after direct update!');
      }
    }
    
    console.log('\n🎉 Adult admin login fix completed!');
    console.log('📧 Email: amenityforge-adult@gmail.com');
    console.log('🔑 Password: Amenity');
    
  } catch (error) {
    console.error('❌ Error fixing adult admin login:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
};

// Run the fix
fixAdultAdminLogin();
