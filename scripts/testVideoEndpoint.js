const fetch = require('node-fetch');

async function testVideoEndpoint() {
  try {
    console.log('Testing video endpoint...');
    
    // Login first
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
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

    // Test video creation
    const videoData = {
      title: 'Test Video',
      description: 'Test video description',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Video',
      duration: 120,
      module: '68cfdd9ae3bc97188711e040',
      topic: 'ABC Song Fun',
      topicDescription: 'Test topic description',
      sequenceOrder: 1,
      tags: ['test', 'video'],
      isPublished: true
    };

    console.log('Creating video...');
    const videoResponse = await fetch('http://localhost:5000/api/video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(videoData)
    });

    console.log('Video response status:', videoResponse.status);
    
    if (videoResponse.ok) {
      const videoResult = await videoResponse.json();
      console.log('Video created successfully!');
      console.log('Video ID:', videoResult.data?._id);
    } else {
      const errorData = await videoResponse.json();
      console.log('Video creation failed:', errorData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testVideoEndpoint();
