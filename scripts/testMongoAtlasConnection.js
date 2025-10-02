const mongoose = require('mongoose');
const Module = require('../models/Module');
const User = require('../models/User');

const testMongoAtlasConnection = async () => {
  try {
    // Connect to MongoDB Atlas
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/English-1?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Test database operations
    console.log('\n📊 Testing database operations...');
    
    // Count total modules
    const totalModules = await Module.countDocuments();
    console.log(`📚 Total modules in database: ${totalModules}`);
    
    // Count adult modules
    const adultModules = await Module.countDocuments({ ageRange: '16+' });
    console.log(`👨‍💼 Adult modules (16+): ${adultModules}`);
    
    // Count children modules
    const childrenModules = await Module.countDocuments({ ageRange: '6-15' });
    console.log(`👶 Children modules (6-15): ${childrenModules}`);
    
    // Count AI modules
    const aiModules = await Module.countDocuments({ moduleType: 'ai' });
    console.log(`🤖 AI modules: ${aiModules}`);
    
    // Count Finance modules
    const financeModules = await Module.countDocuments({ moduleType: 'finance' });
    console.log(`💰 Finance modules: ${financeModules}`);
    
    // Count Soft Skills modules
    const softSkillsModules = await Module.countDocuments({ moduleType: 'soft-skills' });
    console.log(`🤝 Soft Skills modules: ${softSkillsModules}`);
    
    // List some adult modules
    console.log('\n📋 Sample Adult Modules:');
    const sampleAdultModules = await Module.find({ ageRange: '16+' })
      .select('title moduleType ageRange difficulty')
      .limit(5);
    
    sampleAdultModules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title} (${module.moduleType}) - ${module.difficulty}`);
    });
    
    // Check adult admin user
    console.log('\n👤 Checking Adult Admin User:');
    const adultAdmin = await User.findOne({ email: 'amenityforge-adult@gmail.com' });
    if (adultAdmin) {
      console.log(`✅ Adult admin found: ${adultAdmin.email}`);
      console.log(`   Role: ${adultAdmin.role}`);
      console.log(`   Age Range: ${adultAdmin.ageRange}`);
    } else {
      console.log('❌ Adult admin user not found');
    }
    
    console.log('\n🎉 MongoDB Atlas connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing MongoDB Atlas connection:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
};

// Run the test
testMongoAtlasConnection();
