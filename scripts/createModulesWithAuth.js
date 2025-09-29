const fetch = require('node-fetch');

// Base URL for the API
const BASE_URL = 'http://localhost:5000/api';

// Admin credentials
const ADMIN_EMAIL = 'amenityforge@gmail.com';
const ADMIN_PASSWORD = 'Amenity';

// Sample modules data
const modulesData = [
  {
    title: 'Alphabet & Phonics',
    description: 'Learn the alphabet and basic phonics sounds',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: 30,
    tags: ['alphabet', 'phonics', 'beginner']
  },
  {
    title: 'Basic Vocabulary',
    description: 'Essential words for daily communication',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: 25,
    tags: ['vocabulary', 'words', 'daily']
  },
  {
    title: 'Numbers & Counting',
    description: 'Learn numbers from 1 to 100',
    ageRange: '6-12',
    moduleType: 'math',
    difficulty: 'beginner',
    estimatedDuration: 20,
    tags: ['numbers', 'counting', 'math']
  },
  {
    title: 'Colors & Shapes',
    description: 'Learn basic colors and shapes',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: 15,
    tags: ['colors', 'shapes', 'visual']
  },
  {
    title: 'Animals & Nature',
    description: 'Learn about animals and nature',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: 30,
    tags: ['animals', 'nature', 'wildlife']
  },
  {
    title: 'Food & Drinks',
    description: 'Learn food vocabulary and ordering',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: 20,
    tags: ['food', 'drinks', 'restaurant']
  },
  {
    title: 'Clothing & Fashion',
    description: 'Learn clothing vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: 18,
    tags: ['clothing', 'fashion', 'dress']
  },
  {
    title: 'Home & Furniture',
    description: 'Learn home and furniture vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: 22,
    tags: ['home', 'furniture', 'rooms']
  },
  {
    title: 'School & Education',
    description: 'Learn school-related vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: 25,
    tags: ['school', 'education', 'learning']
  },
  {
    title: 'Body Parts & Health',
    description: 'Learn body parts and health vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: 20,
    tags: ['body', 'health', 'anatomy']
  },
  {
    title: 'Transportation',
    description: 'Learn transportation vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: 18,
    tags: ['transportation', 'vehicles', 'travel']
  },
  {
    title: 'Weather & Seasons',
    description: 'Learn weather and seasons vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: 20,
    tags: ['weather', 'seasons', 'climate']
  },
  {
    title: 'Time & Calendar',
    description: 'Learn time and calendar vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: 25,
    tags: ['time', 'calendar', 'schedule']
  },
  {
    title: 'Basic Grammar',
    description: 'Learn basic grammar rules',
    ageRange: '6-12',
    moduleType: 'grammar',
    difficulty: 'beginner',
    estimatedDuration: 30,
    tags: ['grammar', 'rules', 'sentences']
  },
  {
    title: 'Common Verbs',
    description: 'Learn essential action words',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: 22,
    tags: ['verbs', 'actions', 'words']
  },
  {
    title: 'Adjectives & Descriptions',
    description: 'Learn describing words',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: 20,
    tags: ['adjectives', 'descriptions', 'words']
  },
  {
    title: 'Prepositions & Directions',
    description: 'Learn position and direction words',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: 18,
    tags: ['prepositions', 'directions', 'position']
  },
  {
    title: 'Grammar Fundamentals',
    description: 'Essential grammar rules for teenagers',
    ageRange: '12-18',
    moduleType: 'grammar',
    difficulty: 'intermediate',
    estimatedDuration: 45,
    tags: ['grammar', 'rules', 'structure']
  },
  {
    title: 'Academic Writing',
    description: 'Learn formal writing skills',
    ageRange: '12-18',
    moduleType: 'writing',
    difficulty: 'intermediate',
    estimatedDuration: 60,
    tags: ['writing', 'academic', 'essays']
  },
  {
    title: 'Business Communication',
    description: 'Professional communication skills',
    ageRange: '18+',
    moduleType: 'communication',
    difficulty: 'advanced',
    estimatedDuration: 50,
    tags: ['business', 'professional', 'communication']
  }
];

async function loginAsAdmin() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Admin login successful');
      console.log('Login response:', JSON.stringify(data, null, 2));
      return data.data?.token || data.token;
    } else {
      const errorData = await response.json();
      console.log('❌ Admin login failed:', errorData.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

async function createModulesWithAuth() {
  try {
    console.log('🚀 Creating 20 modules with authentication...');
    
    // First, let's check if the server is running
    try {
      const response = await fetch(`${BASE_URL}/health`);
      if (!response.ok) {
        throw new Error('Server not responding');
      }
    } catch (error) {
      console.log('❌ Server is not running. Please start the server first with: node server.js');
      return;
    }

    // Login as admin
    const token = await loginAsAdmin();
    if (!token) {
      console.log('❌ Cannot proceed without admin authentication');
      return;
    }

    // Create modules
    for (let i = 0; i < modulesData.length; i++) {
      const moduleData = modulesData[i];
      console.log(`\n📖 Creating module ${i + 1}/20: ${moduleData.title}`);
      
      try {
        const response = await fetch(`${BASE_URL}/admin/modules`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(moduleData)
        });

        if (response.ok) {
          const createdModule = await response.json();
          console.log(`✅ Module created: ${createdModule.data.title}`);
        } else {
          const errorData = await response.json();
          console.log(`❌ Failed to create module: ${moduleData.title} - ${errorData.message}`);
          console.log('Full error response:', JSON.stringify(errorData, null, 2));
        }
      } catch (error) {
        console.log(`❌ Error creating module ${moduleData.title}:`, error.message);
      }
    }
    
    console.log('\n🎉 Module creation completed!');
    console.log('\n📊 Summary:');
    console.log(`- Modules: ${modulesData.length}`);
    console.log('\n💡 You can now:');
    console.log('1. Go to the admin dashboard');
    console.log('2. Add videos and quizzes to each module');
    console.log('3. Test the student dashboard to see the content');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createModulesWithAuth();
