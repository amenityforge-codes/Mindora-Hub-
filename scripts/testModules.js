const fetch = require('node-fetch');

async function testModules() {
  try {
    // Login first
    console.log('Logging in...');
    const loginResponse = await fetch('http://192.168.1.11:5000/api/auth/login', {
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
    const token = loginData.token;
    console.log('Login successful!');

    // Get modules
    console.log('Fetching modules...');
    const modulesResponse = await fetch('http://192.168.1.11:5000/api/content/modules', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Modules response status:', modulesResponse.status);
    console.log('Modules response ok:', modulesResponse.ok);
    
    if (modulesResponse.ok) {
      const modulesData = await modulesResponse.json();
      console.log('Modules data:', modulesData);
      const modules = modulesData.data?.modules || [];
      console.log(`Found ${modules.length} modules:`);
      
      modules.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title}`);
        console.log(`   ID: ${module._id}`);
        console.log(`   Age Range: ${module.ageRange}`);
        console.log(`   Topics: ${module.topics?.length || 0}`);
        if (module.topics && module.topics.length > 0) {
          module.topics.forEach((topic, i) => {
            console.log(`     ${i + 1}. ${topic.title}`);
          });
        }
        console.log('   ---');
      });
    } else {
      const errorData = await modulesResponse.json();
      console.log('Failed to fetch modules:', errorData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testModules();
