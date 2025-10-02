const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const verifyAdultAdminLogin = async () => {
  try {
    // Connect to MongoDB Atlas
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/English-1?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Find adult admin user with password field
    console.log('\n👤 Finding Adult Admin User with password...');
    const adultAdmin = await User.findOne({ email: 'amenityforge-adult@gmail.com' }).select('+password');
    
    if (!adultAdmin) {
      console.log('❌ Adult admin user not found');
      return;
    }
    
    console.log('✅ Adult admin user found');
    console.log(`   Email: ${adultAdmin.email}`);
    console.log(`   Name: ${adultAdmin.name}`);
    console.log(`   Role: ${adultAdmin.role}`);
    console.log(`   Age Range: ${adultAdmin.ageRange}`);
    console.log(`   Password exists: ${!!adultAdmin.password}`);
    console.log(`   Password length: ${adultAdmin.password ? adultAdmin.password.length : 'N/A'}`);
    console.log(`   Password starts with $2b$: ${adultAdmin.password ? adultAdmin.password.startsWith('$2b$') : false}`);
    
    // Test password verification
    console.log('\n🔐 Testing password verification...');
    if (adultAdmin.password) {
      const isPasswordValid = await bcrypt.compare('Amenity', adultAdmin.password);
      if (isPasswordValid) {
        console.log('✅ Password verification successful!');
      } else {
        console.log('❌ Password verification failed!');
        console.log('   Trying to hash and update password...');
        
        // Hash the password
        const hashedPassword = await bcrypt.hash('Amenity', 12);
        adultAdmin.password = hashedPassword;
        await adultAdmin.save();
        
        console.log('✅ Password updated successfully!');
        
        // Test again
        const isPasswordValidAfterUpdate = await bcrypt.compare('Amenity', adultAdmin.password);
        if (isPasswordValidAfterUpdate) {
          console.log('✅ Password verification successful after update!');
        } else {
          console.log('❌ Password verification still failed after update!');
        }
      }
    } else {
      console.log('❌ No password field found, creating one...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('Amenity', 12);
      adultAdmin.password = hashedPassword;
      await adultAdmin.save();
      
      console.log('✅ Password created successfully!');
      
      // Test the new password
      const isPasswordValid = await bcrypt.compare('Amenity', adultAdmin.password);
      if (isPasswordValid) {
        console.log('✅ Password verification successful!');
      } else {
        console.log('❌ Password verification failed!');
      }
    }
    
    console.log('\n🎉 Adult admin login verification completed!');
    
  } catch (error) {
    console.error('❌ Error verifying adult admin login:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
};

// Run the verification
verifyAdultAdminLogin();
