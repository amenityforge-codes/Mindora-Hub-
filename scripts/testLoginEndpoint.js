const axios = require('axios');

const testLoginEndpoint = async () => {
  try {
    console.log('🧪 Testing Login Endpoint...');
    
    // Test adult admin login
    const loginData = {
      email: 'amenityforge-adult@gmail.com',
      password: 'Amenity'
    };
    
    console.log('📧 Testing login with:', loginData);
    
    const response = await axios.post('http://192.168.1.18:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    
    // Try with children admin
    console.log('\n🧪 Testing Children Admin Login...');
    try {
      const childrenLoginData = {
        email: 'amenityforge@gmail.com',
        password: 'Amenity'
      };
      
      console.log('📧 Testing children admin login with:', childrenLoginData);
      
      const childrenResponse = await axios.post('http://192.168.1.18:5000/api/auth/login', childrenLoginData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Children admin login successful!');
      console.log('Response:', childrenResponse.data);
      
    } catch (childrenError) {
      console.error('❌ Children admin login also failed:', childrenError.response?.data || childrenError.message);
    }
  }
};

// Run the test
testLoginEndpoint();
