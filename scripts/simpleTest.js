const fetch = require('node-fetch');

async function simpleTest() {
  try {
    console.log('Testing basic connectivity...');
    
    // Test login
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

    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login successful!');
      console.log('Login data:', loginData);
      const token = loginData.data.token;
      console.log('Token received:', !!token);
      
      // Test video creation
      console.log('\nTesting video creation...');
      const videoData = {
        title: 'Test Video',
        description: 'Test video description',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: 120,
        module: '68cfdd9ae3bc97188711e040',
        topic: 'ABC Song Fun',
        topicDescription: 'Test topic description',
        sequenceOrder: 1,
        tags: ['test', 'video'],
        isPublished: true
      };

      const formData = new FormData();
      Object.keys(videoData).forEach(key => {
        if (Array.isArray(videoData[key])) {
          formData.append(key, videoData[key].join(','));
        } else {
          formData.append(key, videoData[key].toString());
        }
      });

      const videoResponse = await fetch('http://192.168.1.11:5000/api/video/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Video creation response status:', videoResponse.status);
      
      if (videoResponse.ok) {
        const videoResult = await videoResponse.json();
        console.log('Video created successfully!');
        console.log('Video ID:', videoResult.data?._id);
      } else {
        const errorData = await videoResponse.json();
        console.log('Video creation failed:', errorData);
      }
    } else {
      console.log('Login failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

simpleTest();
