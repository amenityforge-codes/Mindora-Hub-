const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000';

async function testModuleCreation() {
  try {
    console.log('Testing module creation...');
    
    // Login first
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'amenityforge@gmail.com',
        password: 'Amenity'
      })
    });

    if (!loginResponse.ok) {
      console.log('Login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('Login successful!');

    // Test with a simple module
    const simpleModule = {
      title: 'Test Module',
      description: 'A test module',
      ageRange: '6-12',
      level: 'beginner',
      estimatedDuration: 60,
      topics: [
        { title: 'Test Topic', description: 'A test topic', order: 1 }
      ],
      tags: ['test']
    };

    console.log('Creating test module...');
    const moduleResponse = await fetch(`${API_BASE_URL}/api/admin/modules`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(simpleModule)
    });

    console.log('Module response status:', moduleResponse.status);
    
    if (moduleResponse.ok) {
      const moduleResult = await moduleResponse.json();
      console.log('Module created successfully!');
      console.log('Module ID:', moduleResult.data?.module?._id);
    } else {
      const errorData = await moduleResponse.json();
      console.log('Module creation failed:', errorData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testModuleCreation();















