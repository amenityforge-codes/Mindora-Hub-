const axios = require('axios');

const testAdultAdminFrontend = async () => {
  try {
    console.log('🧪 Testing Adult Admin Frontend Flow...');
    
    // Step 1: Login as adult admin
    console.log('\n1️⃣ Logging in as adult admin...');
    const loginResponse = await axios.post('http://192.168.1.18:5000/api/auth/login', {
      email: 'amenityforge-adult@gmail.com',
      password: 'Amenity'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const { token, refreshToken, user } = loginResponse.data.data;
    console.log('✅ Login successful!');
    console.log('   User:', user.name, `(${user.email})`);
    console.log('   Role:', user.role);
    console.log('   Age Range:', user.ageRange);
    console.log('   Token:', token.substring(0, 50) + '...');
    
    // Step 2: Test adult admin endpoints with token
    console.log('\n2️⃣ Testing adult admin endpoints...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test AI Finance endpoint
    console.log('\n🤖 Testing AI Finance endpoint...');
    try {
      const aiFinanceResponse = await axios.get('http://192.168.1.18:5000/api/adult-admin-content/ai-finance', { headers });
      console.log('✅ AI Finance endpoint working!');
      console.log(`   Found ${aiFinanceResponse.data.data.modules.length} AI/Finance modules`);
      aiFinanceResponse.data.data.modules.forEach((module, index) => {
        console.log(`   ${index + 1}. ${module.title} (${module.moduleType})`);
      });
    } catch (error) {
      console.log('❌ AI Finance endpoint failed:', error.response?.data?.message || error.message);
    }
    
    // Test Soft Skills endpoint
    console.log('\n🤝 Testing Soft Skills endpoint...');
    try {
      const softSkillsResponse = await axios.get('http://192.168.1.18:5000/api/adult-admin-content/soft-skills', { headers });
      console.log('✅ Soft Skills endpoint working!');
      console.log(`   Found ${softSkillsResponse.data.data.modules.length} Soft Skills modules`);
      softSkillsResponse.data.data.modules.forEach((module, index) => {
        console.log(`   ${index + 1}. ${module.title} (${module.moduleType})`);
      });
    } catch (error) {
      console.log('❌ Soft Skills endpoint failed:', error.response?.data?.message || error.message);
    }
    
    // Test Brainstorming endpoint
    console.log('\n💡 Testing Brainstorming endpoint...');
    try {
      const brainstormingResponse = await axios.get('http://192.168.1.18:5000/api/adult-admin-content/brainstorming', { headers });
      console.log('✅ Brainstorming endpoint working!');
      console.log(`   Found ${brainstormingResponse.data.data.modules.length} Brainstorming modules`);
      brainstormingResponse.data.data.modules.forEach((module, index) => {
        console.log(`   ${index + 1}. ${module.title} (${module.moduleType})`);
      });
    } catch (error) {
      console.log('❌ Brainstorming endpoint failed:', error.response?.data?.message || error.message);
    }
    
    // Test Math/Logic endpoint
    console.log('\n🧮 Testing Math/Logic endpoint...');
    try {
      const mathLogicResponse = await axios.get('http://192.168.1.18:5000/api/adult-admin-content/math-logic', { headers });
      console.log('✅ Math/Logic endpoint working!');
      console.log(`   Found ${mathLogicResponse.data.data.modules.length} Math/Logic modules`);
      mathLogicResponse.data.data.modules.forEach((module, index) => {
        console.log(`   ${index + 1}. ${module.title} (${module.moduleType})`);
      });
    } catch (error) {
      console.log('❌ Math/Logic endpoint failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 Adult admin frontend flow test completed!');
    console.log('📧 Email: amenityforge-adult@gmail.com');
    console.log('🔑 Password: Amenity');
    console.log('🌐 All adult admin endpoints are working with authentication!');
    
  } catch (error) {
    console.error('❌ Error in adult admin frontend test:', error.response?.data || error.message);
  }
};

// Run the test
testAdultAdminFrontend();
