const mongoose = require('mongoose');
const User = require('../models/User');

const checkAdultAdminUser = async () => {
  try {
    // Connect to MongoDB Atlas
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/English-1?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Check adult admin user
    console.log('\n👤 Checking Adult Admin User...');
    const adultAdmin = await User.findOne({ email: 'amenityforge-adult@gmail.com' });
    
    if (!adultAdmin) {
      console.log('❌ Adult admin user not found');
      return;
    }
    
    console.log('✅ Adult admin user found:');
    console.log(`   Email: ${adultAdmin.email}`);
    console.log(`   Name: ${adultAdmin.name}`);
    console.log(`   Role: ${adultAdmin.role}`);
    console.log(`   Age Range: ${adultAdmin.ageRange}`);
    console.log(`   Is Active: ${adultAdmin.isActive}`);
    console.log(`   Password field exists: ${!!adultAdmin.password}`);
    console.log(`   Password length: ${adultAdmin.password ? adultAdmin.password.length : 'N/A'}`);
    console.log(`   Password starts with $2b$: ${adultAdmin.password ? adultAdmin.password.startsWith('$2b$') : false}`);
    
    // Test login endpoint directly
    console.log('\n🔐 Testing Login Endpoint...');
    const loginData = {
      email: 'amenityforge-adult@gmail.com',
      password: 'Amenity'
    };
    
    console.log('Login data:', loginData);
    
    console.log('\n🎉 Adult admin user check completed!');
    
  } catch (error) {
    console.error('❌ Error checking adult admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
};

// Run the check
checkAdultAdminUser();
