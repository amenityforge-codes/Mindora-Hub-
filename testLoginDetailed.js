const fetch = require('node-fetch');

async function testLoginDetailed() {
  try {
    console.log('Testing login with detailed error info...');
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'amenityforge@gmail.com',
        password: 'Amenity'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('Login successful!');
      console.log('Token received:', !!data.data?.token);
      return data.data?.token;
    } else {
      console.log('Login failed with status:', response.status);
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error data:', errorData);
      } catch (e) {
        console.log('Could not parse error response as JSON');
      }
      return null;
    }
  } catch (error) {
    console.error('Login error:', error.message);
    console.error('Error stack:', error.stack);
    return null;
  }
}

testLoginDetailed();




