const fetch = require('node-fetch');

const API_BASE_URL = 'http://192.168.1.11:5000';

const modulesData = [
  {
    title: 'Alphabet & Phonics',
    description: 'Learn the English alphabet and basic phonics sounds',
    ageRange: '6-12',
    level: 'beginner',
    estimatedDuration: 120,
    topics: [
      {
        title: 'ABC Song Fun',
        description: 'Learn A-Z sounds with fun animations and examples',
        order: 1
      },
      {
        title: 'Letter Recognition',
        description: 'Identify and match uppercase and lowercase letters',
        order: 2
      },
      {
        title: 'Phonics Sounds',
        description: 'Learn the sounds each letter makes',
        order: 3
      }
    ],
    tags: ['alphabet', 'phonics', 'beginner', 'reading']
  },
  {
    title: 'Basic Vocabulary',
    description: 'Essential English words for daily communication',
    ageRange: '6-12',
    level: 'beginner',
    estimatedDuration: 90,
    topics: [
      {
        title: 'Family Words',
        description: 'Learn words for family members',
        order: 1
      },
      {
        title: 'Colors & Shapes',
        description: 'Identify colors and basic shapes',
        order: 2
      },
      {
        title: 'Animals',
        description: 'Learn names of common animals',
        order: 3
      }
    ],
    tags: ['vocabulary', 'words', 'beginner', 'communication']
  },
  {
    title: 'Numbers & Counting',
    description: 'Learn numbers from 1 to 100 and basic counting',
    ageRange: '6-12',
    level: 'beginner',
    estimatedDuration: 60,
    topics: [
      {
        title: 'Numbers 1-10',
        description: 'Learn to count from 1 to 10',
        order: 1
      },
      {
        title: 'Numbers 11-20',
        description: 'Learn to count from 11 to 20',
        order: 2
      },
      {
        title: 'Counting Objects',
        description: 'Practice counting real objects',
        order: 3
      }
    ],
    tags: ['numbers', 'counting', 'math', 'beginner']
  },
  {
    title: 'Simple Sentences',
    description: 'Build basic English sentences',
    ageRange: '6-12',
    level: 'intermediate',
    estimatedDuration: 150,
    topics: [
      {
        title: 'I am...',
        description: 'Learn to introduce yourself',
        order: 1
      },
      {
        title: 'This is...',
        description: 'Point out objects and people',
        order: 2
      },
      {
        title: 'I like...',
        description: 'Express preferences',
        order: 3
      }
    ],
    tags: ['sentences', 'grammar', 'intermediate', 'speaking']
  },
  {
    title: 'Daily Activities',
    description: 'Learn words and phrases for daily routines',
    ageRange: '6-12',
    level: 'intermediate',
    estimatedDuration: 120,
    topics: [
      {
        title: 'Morning Routine',
        description: 'Learn morning activities',
        order: 1
      },
      {
        title: 'School Activities',
        description: 'Words for school and learning',
        order: 2
      },
      {
        title: 'Evening Routine',
        description: 'Learn evening activities',
        order: 3
      }
    ],
    tags: ['daily', 'routine', 'activities', 'intermediate']
  }
];

async function loginAsAdmin() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'amenityforge@gmail.com',
        password: 'Amenity'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.token;
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

async function createModule(token, moduleData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/modules`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(moduleData)
    });

    if (response.ok) {
      const data = await response.json();
      return data.data.module;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create module');
    }
  } catch (error) {
    console.error('Error creating module:', error);
    return null;
  }
}

async function createModules() {
  try {
    console.log('=== CREATING MODULES VIA API ===');
    
    // Login as admin
    console.log('Logging in as admin...');
    const token = await loginAsAdmin();
    if (!token) {
      console.error('Failed to login as admin');
      return;
    }
    console.log('✅ Admin login successful');
    
    // Create modules
    let totalCreated = 0;
    for (const moduleData of modulesData) {
      console.log(`\nCreating module: ${moduleData.title}`);
      const module = await createModule(token, moduleData);
      if (module) {
        console.log(`✅ Created module: ${module.title}`);
        console.log(`   ID: ${module._id}`);
        console.log(`   Topics: ${module.topics.length}`);
        totalCreated++;
      } else {
        console.log(`❌ Failed to create module: ${moduleData.title}`);
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total modules created: ${totalCreated}`);
    console.log('Modules creation completed!');
    
  } catch (error) {
    console.error('Error creating modules:', error);
  }
}

// Run the script
createModules();