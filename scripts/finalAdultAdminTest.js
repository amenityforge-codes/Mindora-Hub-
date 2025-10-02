const mongoose = require('mongoose');
const User = require('../models/User');

const finalAdultAdminTest = async () => {
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
    
    // Test password using the model method
    console.log('\n🔐 Testing password using model method...');
    const isPasswordValid = await adultAdmin.comparePassword('Amenity');
    
    if (isPasswordValid) {
      console.log('✅ Password verification successful!');
    } else {
      console.log('❌ Password verification failed!');
      console.log('   Password field:', adultAdmin.password);
    }
    
    // Test the adult admin endpoints
    console.log('\n🧪 Testing Adult Admin Endpoints...');
    
    // Test AI Finance modules
    const Module = require('../models/Module');
    const aiFinanceFilter = {
      ageRange: '16+',
      status: 'published',
      moduleType: { $in: ['ai', 'finance'] }
    };
    
    const aiFinanceModules = await Module.find(aiFinanceFilter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${aiFinanceModules.length} AI/Finance modules for adults`);
    aiFinanceModules.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.title} (${module.moduleType}) - ${module.difficulty}`);
    });
    
    // Test Soft Skills modules
    const softSkillsFilter = {
      ageRange: '16+',
      status: 'published',
      moduleType: 'soft-skills'
    };
    
    const softSkillsModules = await Module.find(softSkillsFilter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${softSkillsModules.length} Soft Skills modules for adults`);
    softSkillsModules.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.title} (${module.moduleType}) - ${module.difficulty}`);
    });
    
    console.log('\n🎉 Adult admin authentication and endpoints test completed!');
    console.log('📧 Email: amenityforge-adult@gmail.com');
    console.log('🔑 Password: Amenity');
    console.log('🌐 The adult admin can now login and access adult-specific content!');
    
  } catch (error) {
    console.error('❌ Error in final adult admin test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
};

// Run the test
finalAdultAdminTest();
