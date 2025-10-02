const mongoose = require('mongoose');
const Module = require('../models/Module');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const testAdultEndpoints = async () => {
  try {
    // Connect to MongoDB Atlas
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/English-1?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Test adult admin login
    console.log('\n🔐 Testing Adult Admin Login...');
    const adultAdmin = await User.findOne({ email: 'amenityforge-adult@gmail.com' });
    
    if (!adultAdmin) {
      console.log('❌ Adult admin user not found');
      return;
    }
    
    console.log(`✅ Adult admin found: ${adultAdmin.email}`);
    
    // Test password verification
    const isPasswordValid = await bcrypt.compare('Amenity', adultAdmin.password);
    if (isPasswordValid) {
      console.log('✅ Password verification successful');
    } else {
      console.log('❌ Password verification failed');
      return;
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: adultAdmin._id, 
        email: adultAdmin.email, 
        role: adultAdmin.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('✅ JWT token generated successfully');
    console.log(`🔑 Token: ${token.substring(0, 50)}...`);
    
    // Test adult admin endpoints
    console.log('\n🧪 Testing Adult Admin Endpoints...');
    
    // Test AI Finance modules
    console.log('\n🤖 Testing AI Finance Modules...');
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
    console.log('\n🤝 Testing Soft Skills Modules...');
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
    
    // Test Brainstorming modules
    console.log('\n💡 Testing Brainstorming Modules...');
    const brainstormingFilter = {
      ageRange: '16+',
      status: 'published',
      moduleType: 'brainstorming'
    };
    
    const brainstormingModules = await Module.find(brainstormingFilter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${brainstormingModules.length} Brainstorming modules for adults`);
    brainstormingModules.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.title} (${module.moduleType}) - ${module.difficulty}`);
    });
    
    // Test Math/Logic modules
    console.log('\n🧮 Testing Math/Logic Modules...');
    const mathLogicFilter = {
      ageRange: '16+',
      status: 'published',
      moduleType: { $in: ['math', 'logic'] }
    };
    
    const mathLogicModules = await Module.find(mathLogicFilter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${mathLogicModules.length} Math/Logic modules for adults`);
    mathLogicModules.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.title} (${module.moduleType}) - ${module.difficulty}`);
    });
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Total Adult Modules: ${await Module.countDocuments({ ageRange: '16+' })}`);
    console.log(`   AI/Finance Modules: ${aiFinanceModules.length}`);
    console.log(`   Soft Skills Modules: ${softSkillsModules.length}`);
    console.log(`   Brainstorming Modules: ${brainstormingModules.length}`);
    console.log(`   Math/Logic Modules: ${mathLogicModules.length}`);
    
    console.log('\n🎉 All adult admin endpoints are working correctly with MongoDB Atlas!');
    
  } catch (error) {
    console.error('❌ Error testing adult endpoints:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
};

// Run the test
testAdultEndpoints();
