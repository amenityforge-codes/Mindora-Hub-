const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');

const createTestUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test users for each dashboard
    const testUsers = [
      // Children (6-12)
      {
        name: 'Rahul Sharma',
        email: 'rahul.child@example.com',
        password: 'password123',
        role: 'student',
        ageRange: '6-12',
        profile: {
          bio: 'I love learning English with fun games and stories!',
          location: {
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India'
          },
          interests: ['grammar', 'vocabulary', 'speaking']
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            weeklyDigest: true
          },
          language: {
            primary: 'en',
            secondary: 'hi'
          },
          difficulty: 'beginner'
        }
      },
      {
        name: 'Priya Patel',
        email: 'priya.child@example.com',
        password: 'password123',
        role: 'student',
        ageRange: '6-12',
        profile: {
          bio: 'Learning English is so much fun!',
          location: {
            city: 'Delhi',
            state: 'Delhi',
            country: 'India'
          },
          interests: ['grammar', 'vocabulary', 'speaking']
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            weeklyDigest: true
          },
          language: {
            primary: 'en',
            secondary: 'hi'
          },
          difficulty: 'beginner'
        }
      },

      // Teens (12-18)
      {
        name: 'Arjun Singh',
        email: 'arjun.teen@example.com',
        password: 'password123',
        role: 'student',
        ageRange: '12-18',
        profile: {
          bio: 'Preparing for board exams and improving my English skills',
          location: {
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India'
          },
          interests: ['grammar', 'writing', 'vocabulary']
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            weeklyDigest: true
          },
          language: {
            primary: 'en',
            secondary: 'hi'
          },
          difficulty: 'intermediate'
        }
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.teen@example.com',
        password: 'password123',
        role: 'student',
        ageRange: '12-18',
        profile: {
          bio: 'Love reading and writing essays in English',
          location: {
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India'
          },
          interests: ['writing', 'vocabulary', 'speaking']
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            weeklyDigest: true
          },
          language: {
            primary: 'en',
            secondary: 'te'
          },
          difficulty: 'intermediate'
        }
      },

      // Adults (18+)
      {
        name: 'Vikram Kumar',
        email: 'vikram.adult@example.com',
        password: 'password123',
        role: 'student',
        ageRange: '18+',
        profile: {
          bio: 'College student working on academic English and professional communication',
          location: {
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India'
          },
          interests: ['writing', 'communication', 'vocabulary']
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            weeklyDigest: true
          },
          language: {
            primary: 'en',
            secondary: 'ta'
          },
          difficulty: 'advanced'
        }
      },
      {
        name: 'Anita Desai',
        email: 'anita.adult@example.com',
        password: 'password123',
        role: 'student',
        ageRange: '18+',
        profile: {
          bio: 'Working professional looking to improve business communication skills',
          location: {
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India'
          },
          interests: ['writing', 'communication', 'soft-skills']
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            weeklyDigest: true
          },
          language: {
            primary: 'en',
            secondary: 'hi'
          },
          difficulty: 'advanced'
        }
      },

      // Business Professionals (25+)
      {
        name: 'Rajesh Gupta',
        email: 'rajesh.business@example.com',
        password: 'password123',
        role: 'professional',
        ageRange: 'business',
        profile: {
          bio: 'Senior Manager at IT company, focusing on leadership communication and client relations',
          location: {
            city: 'Gurgaon',
            state: 'Haryana',
            country: 'India'
          },
          interests: ['communication', 'soft-skills', 'finance']
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            weeklyDigest: true
          },
          language: {
            primary: 'en',
            secondary: 'hi'
          },
          difficulty: 'advanced'
        }
      },
      {
        name: 'Meera Joshi',
        email: 'meera.business@example.com',
        password: 'password123',
        role: 'professional',
        ageRange: 'business',
        profile: {
          bio: 'Marketing Director enhancing presentation skills and cross-cultural communication',
          location: {
            city: 'Ahmedabad',
            state: 'Gujarat',
            country: 'India'
          },
          interests: ['communication', 'soft-skills', 'ai']
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            weeklyDigest: true
          },
          language: {
            primary: 'en',
            secondary: 'gu'
          },
          difficulty: 'advanced'
        }
      }
    ];

    console.log('🔄 Creating test users for all dashboards...');

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`ℹ️  User ${userData.email} already exists`);
        continue;
      }

      // Create user (password will be hashed by pre-save middleware)
      const user = new User({
        ...userData,
        isEmailVerified: true,
        isActive: true
      });

      await user.save();
      console.log(`✅ Created user: ${userData.name} (${userData.email}) - ${userData.ageRange}`);
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Login Credentials for Testing:');
    console.log('=====================================');
    
    console.log('\n👶 CHILDREN (6-12):');
    console.log('• rahul.child@example.com / password123');
    console.log('• priya.child@example.com / password123');
    
    console.log('\n🧑 TEENS (12-18):');
    console.log('• arjun.teen@example.com / password123');
    console.log('• sneha.teen@example.com / password123');
    
    console.log('\n👨 ADULTS (18+):');
    console.log('• vikram.adult@example.com / password123');
    console.log('• anita.adult@example.com / password123');
    
    console.log('\n💼 BUSINESS PROFESSIONALS:');
    console.log('• rajesh.business@example.com / password123');
    console.log('• meera.business@example.com / password123');
    
    console.log('\n👑 ADMIN:');
    console.log('• amenityforge@gmail.com / Amenity');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the script
createTestUsers();
