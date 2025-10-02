const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const fixAdultAdminPassword = async () => {
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
    
    // Hash the password
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash('Amenity', 12);
    console.log('✅ Password hashed successfully');
    
    // Update the user with the hashed password
    console.log('\n💾 Updating user password...');
    adultAdmin.password = hashedPassword;
    await adultAdmin.save();
    
    console.log('✅ Adult admin password updated successfully!');
    console.log('📧 Email: amenityforge-adult@gmail.com');
    console.log('🔑 Password: Amenity');
    console.log('👤 Role: admin');
    console.log('🎯 Age Range: 16+ (Adults)');
    
    // Verify the password works
    console.log('\n🧪 Testing password verification...');
    const isPasswordValid = await bcrypt.compare('Amenity', adultAdmin.password);
    if (isPasswordValid) {
      console.log('✅ Password verification successful!');
    } else {
      console.log('❌ Password verification failed!');
    }
    
    console.log('\n🎉 Adult admin password fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing adult admin password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
};

// Run the fix
fixAdultAdminPassword();
