const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000';

// Comprehensive list of modules and topics for 6-12 age range
const allModulesData = [
  {
    title: 'Alphabet & Phonics',
    description: 'Learn the English alphabet and basic phonics sounds',
    ageRange: '6-12',
    level: 'beginner',
    estimatedDuration: 120,
    topics: [
      { title: 'ABC Song Fun', description: 'Learn A-Z sounds with fun animations and examples', order: 1 },
      { title: 'Letter Recognition', description: 'Identify and match uppercase and lowercase letters', order: 2 },
      { title: 'Phonics Sounds', description: 'Learn the sounds each letter makes', order: 3 },
      { title: 'Letter Hunt Game', description: 'Practice recognizing letters A through Z', order: 4 },
      { title: 'Vowel Sounds', description: 'Learn A, E, I, O, U sounds', order: 5 }
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
      { title: 'Family Words', description: 'Learn words for family members', order: 1 },
      { title: 'Colors & Shapes', description: 'Identify colors and basic shapes', order: 2 },
      { title: 'Animals', description: 'Learn names of common animals', order: 3 },
      { title: 'Food & Drinks', description: 'Learn names of common foods and drinks', order: 4 },
      { title: 'Body Parts', description: 'Learn names of body parts', order: 5 }
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
      { title: 'Numbers 1-10', description: 'Learn to count from 1 to 10', order: 1 },
      { title: 'Numbers 11-20', description: 'Learn to count from 11 to 20', order: 2 },
      { title: 'Counting Objects', description: 'Practice counting real objects', order: 3 },
      { title: 'Number Recognition', description: 'Recognize and write numbers', order: 4 },
      { title: 'Simple Addition', description: 'Learn basic addition with numbers 1-10', order: 5 }
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
      { title: 'I am...', description: 'Learn to introduce yourself', order: 1 },
      { title: 'This is...', description: 'Point out objects and people', order: 2 },
      { title: 'I like...', description: 'Express preferences', order: 3 },
      { title: 'I can...', description: 'Express abilities', order: 4 },
      { title: 'I have...', description: 'Express possession', order: 5 }
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
      { title: 'Morning Routine', description: 'Learn morning activities', order: 1 },
      { title: 'School Activities', description: 'Words for school and learning', order: 2 },
      { title: 'Evening Routine', description: 'Learn evening activities', order: 3 },
      { title: 'Weekend Fun', description: 'Learn weekend activities', order: 4 },
      { title: 'Hobbies', description: 'Learn about different hobbies', order: 5 }
    ],
    tags: ['daily', 'routine', 'activities', 'intermediate']
  },
  {
    title: 'Weather & Seasons',
    description: 'Learn about weather and seasons',
    ageRange: '6-12',
    level: 'beginner',
    estimatedDuration: 90,
    topics: [
      { title: 'Sunny Days', description: 'Learn about sunny weather', order: 1 },
      { title: 'Rainy Days', description: 'Learn about rainy weather', order: 2 },
      { title: 'Four Seasons', description: 'Learn about spring, summer, fall, winter', order: 3 },
      { title: 'Weather Clothes', description: 'Learn what to wear in different weather', order: 4 },
      { title: 'Weather Activities', description: 'Learn activities for different weather', order: 5 }
    ],
    tags: ['weather', 'seasons', 'nature', 'beginner']
  },
  {
    title: 'My Home',
    description: 'Learn about rooms and furniture in a house',
    ageRange: '6-12',
    level: 'beginner',
    estimatedDuration: 100,
    topics: [
      { title: 'Living Room', description: 'Learn about living room items', order: 1 },
      { title: 'Kitchen', description: 'Learn about kitchen items', order: 2 },
      { title: 'Bedroom', description: 'Learn about bedroom items', order: 3 },
      { title: 'Bathroom', description: 'Learn about bathroom items', order: 4 },
      { title: 'Garden', description: 'Learn about garden and outdoor items', order: 5 }
    ],
    tags: ['home', 'furniture', 'rooms', 'beginner']
  },
  {
    title: 'Transportation',
    description: 'Learn about different ways to travel',
    ageRange: '6-12',
    level: 'beginner',
    estimatedDuration: 80,
    topics: [
      { title: 'Cars & Buses', description: 'Learn about road vehicles', order: 1 },
      { title: 'Trains', description: 'Learn about trains and railways', order: 2 },
      { title: 'Planes', description: 'Learn about airplanes', order: 3 },
      { title: 'Boats & Ships', description: 'Learn about water transportation', order: 4 },
      { title: 'Bicycles', description: 'Learn about bicycles and cycling', order: 5 }
    ],
    tags: ['transportation', 'vehicles', 'travel', 'beginner']
  },
  {
    title: 'Sports & Games',
    description: 'Learn about different sports and games',
    ageRange: '6-12',
    level: 'intermediate',
    estimatedDuration: 110,
    topics: [
      { title: 'Ball Games', description: 'Learn about football, basketball, tennis', order: 1 },
      { title: 'Water Sports', description: 'Learn about swimming, diving', order: 2 },
      { title: 'Indoor Games', description: 'Learn about board games and puzzles', order: 3 },
      { title: 'Outdoor Games', description: 'Learn about playground games', order: 4 },
      { title: 'Team Sports', description: 'Learn about working together in sports', order: 5 }
    ],
    tags: ['sports', 'games', 'teamwork', 'intermediate']
  },
  {
    title: 'Music & Art',
    description: 'Learn about music and art',
    ageRange: '6-12',
    level: 'intermediate',
    estimatedDuration: 100,
    topics: [
      { title: 'Musical Instruments', description: 'Learn about different instruments', order: 1 },
      { title: 'Singing', description: 'Learn about singing and songs', order: 2 },
      { title: 'Drawing', description: 'Learn about drawing and art', order: 3 },
      { title: 'Colors in Art', description: 'Learn about colors and painting', order: 4 },
      { title: 'Creative Activities', description: 'Learn about being creative', order: 5 }
    ],
    tags: ['music', 'art', 'creativity', 'intermediate']
  },
  {
    title: 'Nature & Environment',
    description: 'Learn about nature and taking care of the environment',
    ageRange: '6-12',
    level: 'intermediate',
    estimatedDuration: 120,
    topics: [
      { title: 'Trees & Plants', description: 'Learn about different plants', order: 1 },
      { title: 'Insects & Bugs', description: 'Learn about small creatures', order: 2 },
      { title: 'Birds', description: 'Learn about different birds', order: 3 },
      { title: 'Recycling', description: 'Learn about recycling and environment', order: 4 },
      { title: 'Gardening', description: 'Learn about growing plants', order: 5 }
    ],
    tags: ['nature', 'environment', 'plants', 'intermediate']
  },
  {
    title: 'Community Helpers',
    description: 'Learn about people who help in our community',
    ageRange: '6-12',
    level: 'intermediate',
    estimatedDuration: 100,
    topics: [
      { title: 'Doctors & Nurses', description: 'Learn about medical helpers', order: 1 },
      { title: 'Teachers', description: 'Learn about teachers and education', order: 2 },
      { title: 'Police & Firefighters', description: 'Learn about safety helpers', order: 3 },
      { title: 'Mail Carriers', description: 'Learn about postal workers', order: 4 },
      { title: 'Shop Keepers', description: 'Learn about store workers', order: 5 }
    ],
    tags: ['community', 'helpers', 'jobs', 'intermediate']
  },
  {
    title: 'Holidays & Celebrations',
    description: 'Learn about different holidays and celebrations',
    ageRange: '6-12',
    level: 'intermediate',
    estimatedDuration: 90,
    topics: [
      { title: 'Birthday Party', description: 'Learn about birthday celebrations', order: 1 },
      { title: 'Christmas', description: 'Learn about Christmas traditions', order: 2 },
      { title: 'Halloween', description: 'Learn about Halloween fun', order: 3 },
      { title: 'Easter', description: 'Learn about Easter celebrations', order: 4 },
      { title: 'New Year', description: 'Learn about New Year celebrations', order: 5 }
    ],
    tags: ['holidays', 'celebrations', 'traditions', 'intermediate']
  },
  {
    title: 'Time & Calendar',
    description: 'Learn about time, days, and calendar',
    ageRange: '6-12',
    level: 'intermediate',
    estimatedDuration: 80,
    topics: [
      { title: 'Days of the Week', description: 'Learn the seven days', order: 1 },
      { title: 'Months of the Year', description: 'Learn the twelve months', order: 2 },
      { title: 'Telling Time', description: 'Learn to read clocks', order: 3 },
      { title: 'Morning, Afternoon, Evening', description: 'Learn about different times of day', order: 4 },
      { title: 'Calendar', description: 'Learn about using a calendar', order: 5 }
    ],
    tags: ['time', 'calendar', 'schedule', 'intermediate']
  },
  {
    title: 'Health & Safety',
    description: 'Learn about staying healthy and safe',
    ageRange: '6-12',
    level: 'intermediate',
    estimatedDuration: 100,
    topics: [
      { title: 'Healthy Food', description: 'Learn about good food choices', order: 1 },
      { title: 'Exercise', description: 'Learn about staying active', order: 2 },
      { title: 'Personal Hygiene', description: 'Learn about staying clean', order: 3 },
      { title: 'Safety Rules', description: 'Learn about staying safe', order: 4 },
      { title: 'Emergency Help', description: 'Learn about getting help in emergencies', order: 5 }
    ],
    tags: ['health', 'safety', 'hygiene', 'intermediate']
  },
  {
    title: 'Technology',
    description: 'Learn about modern technology',
    ageRange: '6-12',
    level: 'intermediate',
    estimatedDuration: 90,
    topics: [
      { title: 'Computers', description: 'Learn about computers and laptops', order: 1 },
      { title: 'Tablets & Phones', description: 'Learn about mobile devices', order: 2 },
      { title: 'Internet', description: 'Learn about using the internet safely', order: 3 },
      { title: 'Apps & Games', description: 'Learn about educational apps', order: 4 },
      { title: 'Digital Safety', description: 'Learn about staying safe online', order: 5 }
    ],
    tags: ['technology', 'computers', 'digital', 'intermediate']
  },
  {
    title: 'Space & Planets',
    description: 'Learn about space and our solar system',
    ageRange: '6-12',
    level: 'advanced',
    estimatedDuration: 120,
    topics: [
      { title: 'The Sun', description: 'Learn about our star', order: 1 },
      { title: 'Planets', description: 'Learn about the eight planets', order: 2 },
      { title: 'The Moon', description: 'Learn about Earth\'s moon', order: 3 },
      { title: 'Stars', description: 'Learn about stars in the sky', order: 4 },
      { title: 'Space Travel', description: 'Learn about astronauts and rockets', order: 5 }
    ],
    tags: ['space', 'planets', 'astronomy', 'advanced']
  },
  {
    title: 'World Cultures',
    description: 'Learn about different countries and cultures',
    ageRange: '6-12',
    level: 'advanced',
    estimatedDuration: 150,
    topics: [
      { title: 'Countries', description: 'Learn about different countries', order: 1 },
      { title: 'Languages', description: 'Learn about different languages', order: 2 },
      { title: 'Food Around the World', description: 'Learn about international foods', order: 3 },
      { title: 'Traditional Clothes', description: 'Learn about cultural clothing', order: 4 },
      { title: 'Festivals', description: 'Learn about cultural festivals', order: 5 }
    ],
    tags: ['cultures', 'countries', 'diversity', 'advanced']
  },
  {
    title: 'Science & Experiments',
    description: 'Learn about science through fun experiments',
    ageRange: '6-12',
    level: 'advanced',
    estimatedDuration: 140,
    topics: [
      { title: 'Water Experiments', description: 'Learn about water properties', order: 1 },
      { title: 'Light & Shadows', description: 'Learn about light and dark', order: 2 },
      { title: 'Magnets', description: 'Learn about magnetic forces', order: 3 },
      { title: 'Plants Growing', description: 'Learn about plant life cycles', order: 4 },
      { title: 'Simple Machines', description: 'Learn about basic machines', order: 5 }
    ],
    tags: ['science', 'experiments', 'discovery', 'advanced']
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
      return data.data.token;
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

async function createAllModules() {
  try {
    console.log('=== CREATING ALL MODULES AND TOPICS ===');
    
    // Login as admin
    console.log('Logging in as admin...');
    const token = await loginAsAdmin();
    if (!token) {
      console.error('Failed to login as admin');
      return;
    }
    console.log('✅ Admin login successful');
    
    let totalModulesCreated = 0;
    let totalTopicsCreated = 0;
    
    // Create all modules
    for (const moduleData of allModulesData) {
      console.log(`\nCreating module: ${moduleData.title}`);
      const module = await createModule(token, moduleData);
      if (module) {
        console.log(`✅ Created module: ${module.title}`);
        console.log(`   ID: ${module._id}`);
        console.log(`   Topics: ${module.topics.length}`);
        totalModulesCreated++;
        totalTopicsCreated += module.topics.length;
        
        // Log all topics for this module
        module.topics.forEach((topic, index) => {
          console.log(`     ${index + 1}. ${topic.title}`);
        });
      } else {
        console.log(`❌ Failed to create module: ${moduleData.title}`);
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total modules created: ${totalModulesCreated}`);
    console.log(`Total topics created: ${totalTopicsCreated}`);
    console.log('All modules and topics are now ready for content!');
    console.log('\nYou can now add videos and quizzes to any topic through the admin dashboard.');
    
  } catch (error) {
    console.error('Error creating modules:', error);
  }
}

// Run the script
createAllModules();












