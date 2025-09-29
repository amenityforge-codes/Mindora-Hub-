const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login...');
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
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Login successful!');
      console.log('Token received:', !!data.token);
      return data.token;
    } else {
      const errorData = await response.json();
      console.log('Login failed:', errorData);
      return null;
    }
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

testLogin();