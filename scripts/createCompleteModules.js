const mongoose = require('mongoose');
const Module = require('../models/Module');
const Video = require('../models/Video');
const Quiz = require('../models/Quiz');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ei-english');

const completeModules = [
  // Children (6-12) Modules
  {
    title: 'Alphabet & Phonics',
    description: 'Learn the alphabet and basic phonics sounds',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 30,
    tags: ['alphabet', 'phonics', 'beginner'],
    topics: [
      {
        title: 'ABC Song Fun',
        description: 'Learn A–Z sounds with fun animations and examples',
        videos: [
          {
            title: 'ABC Song - Learn the Alphabet',
            description: 'Sing along and learn all 26 letters of the alphabet',
            duration: 180,
            tags: ['alphabet', 'song', 'music'],
            topic: 'ABC Song Fun',
            topicDescription: 'Learn A–Z sounds with fun animations and examples'
          },
          {
            title: 'Letter A - Apple',
            description: 'Learn the letter A with apple examples',
            duration: 120,
            tags: ['letter-a', 'apple', 'vocabulary'],
            topic: 'ABC Song Fun',
            topicDescription: 'Learn A–Z sounds with fun animations and examples'
          }
        ],
        quizzes: [
          {
            title: 'ABC Song Quiz',
            description: 'Test your knowledge of the alphabet',
            questions: [
              {
                question: 'What is the first letter of the alphabet?',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 0,
                explanation: 'A is the first letter of the English alphabet'
              },
              {
                question: 'What letter comes after B?',
                options: ['A', 'C', 'D', 'E'],
                correctAnswer: 1,
                explanation: 'C comes after B in the alphabet'
              }
            ],
            topic: 'ABC Song Fun',
            topicDescription: 'Learn A–Z sounds with fun animations and examples'
          }
        ]
      },
      {
        title: 'Letter Sounds',
        description: 'Master individual letter sounds and pronunciation',
        videos: [
          {
            title: 'Consonant Sounds',
            description: 'Learn all consonant sounds',
            duration: 200,
            tags: ['consonants', 'sounds', 'pronunciation'],
            topic: 'Letter Sounds',
            topicDescription: 'Master individual letter sounds and pronunciation'
          }
        ],
        quizzes: [
          {
            title: 'Letter Sounds Quiz',
            description: 'Test your letter sound knowledge',
            questions: [
              {
                question: 'What sound does the letter B make?',
                options: ['/b/', '/p/', '/d/', '/t/'],
                correctAnswer: 0,
                explanation: 'B makes the /b/ sound as in "ball"'
              }
            ],
            topic: 'Letter Sounds',
            topicDescription: 'Master individual letter sounds and pronunciation'
          }
        ]
      }
    ]
  },
  {
    title: 'Basic Vocabulary',
    description: 'Essential words for daily communication',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 25,
    tags: ['vocabulary', 'words', 'daily'],
    topics: [
      {
        title: 'Family Words',
        description: 'Learn family member names',
        videos: [
          {
            title: 'My Family',
            description: 'Learn family member vocabulary',
            duration: 150,
            tags: ['family', 'relatives', 'vocabulary'],
            topic: 'Family Words',
            topicDescription: 'Learn family member names'
          }
        ],
        quizzes: [
          {
            title: 'Family Quiz',
            description: 'Test your family vocabulary',
            questions: [
              {
                question: 'What do you call your mother\'s sister?',
                options: ['Aunt', 'Uncle', 'Cousin', 'Grandmother'],
                correctAnswer: 0,
                explanation: 'Your mother\'s sister is your aunt'
              }
            ],
            topic: 'Family Words',
            topicDescription: 'Learn family member names'
          }
        ]
      }
    ]
  },
  {
    title: 'Numbers & Counting',
    description: 'Learn numbers from 1 to 100',
    ageRange: '6-12',
    moduleType: 'math',
    difficulty: 'beginner',
    duration: 20,
    tags: ['numbers', 'counting', 'math'],
    topics: [
      {
        title: 'Numbers 1-10',
        description: 'Learn to count from 1 to 10',
        videos: [
          {
            title: 'Counting 1 to 10',
            description: 'Learn numbers with fun animations',
            duration: 120,
            tags: ['counting', 'numbers', '1-10'],
            topic: 'Numbers 1-10',
            topicDescription: 'Learn to count from 1 to 10'
          }
        ],
        quizzes: [
          {
            title: 'Numbers Quiz',
            description: 'Test your counting skills',
            questions: [
              {
                question: 'What number comes after 5?',
                options: ['4', '6', '7', '8'],
                correctAnswer: 1,
                explanation: '6 comes after 5 in counting'
              }
            ],
            topic: 'Numbers 1-10',
            topicDescription: 'Learn to count from 1 to 10'
          }
        ]
      }
    ]
  },
  {
    title: 'Colors & Shapes',
    description: 'Learn basic colors and shapes',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 15,
    tags: ['colors', 'shapes', 'visual'],
    topics: [
      {
        title: 'Rainbow Colors',
        description: 'Learn all the colors of the rainbow',
        videos: [
          {
            title: 'Colors of the Rainbow',
            description: 'Learn red, orange, yellow, green, blue, indigo, violet',
            duration: 100,
            tags: ['colors', 'rainbow', 'visual'],
            topic: 'Rainbow Colors',
            topicDescription: 'Learn all the colors of the rainbow'
          }
        ],
        quizzes: [
          {
            title: 'Colors Quiz',
            description: 'Test your color knowledge',
            questions: [
              {
                question: 'What color do you get when you mix red and blue?',
                options: ['Green', 'Purple', 'Orange', 'Yellow'],
                correctAnswer: 1,
                explanation: 'Red and blue make purple'
              }
            ],
            topic: 'Rainbow Colors',
            topicDescription: 'Learn all the colors of the rainbow'
          }
        ]
      }
    ]
  },
  {
    title: 'Animals & Nature',
    description: 'Learn about animals and nature',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 30,
    tags: ['animals', 'nature', 'wildlife'],
    topics: [
      {
        title: 'Farm Animals',
        description: 'Learn about animals on the farm',
        videos: [
          {
            title: 'Farm Animal Sounds',
            description: 'Learn animal names and sounds',
            duration: 180,
            tags: ['farm', 'animals', 'sounds'],
            topic: 'Farm Animals',
            topicDescription: 'Learn about animals on the farm'
          }
        ],
        quizzes: [
          {
            title: 'Farm Animals Quiz',
            description: 'Test your farm animal knowledge',
            questions: [
              {
                question: 'What sound does a cow make?',
                options: ['Moo', 'Baa', 'Oink', 'Cluck'],
                correctAnswer: 0,
                explanation: 'Cows make the sound "moo"'
              }
            ],
            topic: 'Farm Animals',
            topicDescription: 'Learn about animals on the farm'
          }
        ]
      }
    ]
  },

  // Teens (12-18) Modules
  {
    title: 'Grammar Fundamentals',
    description: 'Essential grammar rules for teenagers',
    ageRange: '12-18',
    moduleType: 'grammar',
    difficulty: 'intermediate',
    duration: 45,
    tags: ['grammar', 'rules', 'structure'],
    topics: [
      {
        title: 'Present Tense',
        description: 'Learn present simple and continuous',
        videos: [
          {
            title: 'Present Simple vs Continuous',
            description: 'Master the difference between present tenses',
            duration: 300,
            tags: ['present', 'tense', 'grammar'],
            topic: 'Present Tense',
            topicDescription: 'Learn present simple and continuous'
          }
        ],
        quizzes: [
          {
            title: 'Present Tense Quiz',
            description: 'Test your present tense knowledge',
            questions: [
              {
                question: 'Which sentence is correct?',
                options: [
                  'I am go to school',
                  'I go to school',
                  'I going to school',
                  'I goes to school'
                ],
                correctAnswer: 1,
                explanation: 'Present simple uses base form: "I go to school"'
              }
            ],
            topic: 'Present Tense',
            topicDescription: 'Learn present simple and continuous'
          }
        ]
      }
    ]
  },
  {
    title: 'Academic Writing',
    description: 'Learn formal writing skills',
    ageRange: '12-18',
    moduleType: 'writing',
    difficulty: 'intermediate',
    duration: 60,
    tags: ['writing', 'academic', 'essays'],
    topics: [
      {
        title: 'Essay Structure',
        description: 'Learn how to structure an essay',
        videos: [
          {
            title: 'Introduction, Body, Conclusion',
            description: 'Master the three-part essay structure',
            duration: 400,
            tags: ['essay', 'structure', 'writing'],
            topic: 'Essay Structure',
            topicDescription: 'Learn how to structure an essay'
          }
        ],
        quizzes: [
          {
            title: 'Essay Structure Quiz',
            description: 'Test your essay writing knowledge',
            questions: [
              {
                question: 'What should an introduction contain?',
                options: [
                  'Only the thesis statement',
                  'Hook, background, and thesis',
                  'Only examples',
                  'Only questions'
                ],
                correctAnswer: 1,
                explanation: 'A good introduction has a hook, background info, and thesis'
              }
            ],
            topic: 'Essay Structure',
            topicDescription: 'Learn how to structure an essay'
          }
        ]
      }
    ]
  },

  // Adults (18+) Modules
  {
    title: 'Business Communication',
    description: 'Professional communication skills',
    ageRange: '18+',
    moduleType: 'communication',
    difficulty: 'advanced',
    duration: 50,
    tags: ['business', 'professional', 'communication'],
    topics: [
      {
        title: 'Email Etiquette',
        description: 'Learn professional email writing',
        videos: [
          {
            title: 'Professional Email Writing',
            description: 'Master formal email communication',
            duration: 350,
            tags: ['email', 'professional', 'business'],
            topic: 'Email Etiquette',
            topicDescription: 'Learn professional email writing'
          }
        ],
        quizzes: [
          {
            title: 'Email Etiquette Quiz',
            description: 'Test your email writing skills',
            questions: [
              {
                question: 'What is the best way to start a formal email?',
                options: [
                  'Hey there!',
                  'Dear Mr. Smith,',
                  'Hi!',
                  'Yo!'
                ],
                correctAnswer: 1,
                explanation: 'Formal emails should start with "Dear [Title] [Name],"'
              }
            ],
            topic: 'Email Etiquette',
            topicDescription: 'Learn professional email writing'
          }
        ]
      }
    ]
  },
  {
    title: 'Presentation Skills',
    description: 'Master public speaking and presentations',
    ageRange: '18+',
    moduleType: 'communication',
    difficulty: 'advanced',
    duration: 55,
    tags: ['presentation', 'speaking', 'public'],
    topics: [
      {
        title: 'Overcoming Stage Fright',
        description: 'Techniques to manage presentation anxiety',
        videos: [
          {
            title: 'Confidence Building',
            description: 'Build confidence for public speaking',
            duration: 400,
            tags: ['confidence', 'anxiety', 'speaking'],
            topic: 'Overcoming Stage Fright',
            topicDescription: 'Techniques to manage presentation anxiety'
          }
        ],
        quizzes: [
          {
            title: 'Presentation Skills Quiz',
            description: 'Test your presentation knowledge',
            questions: [
              {
                question: 'What is the best way to start a presentation?',
                options: [
                  'Jump straight to the content',
                  'Tell a relevant story or ask a question',
                  'Read from your notes',
                  'Show all your slides at once'
                ],
                correctAnswer: 1,
                explanation: 'Starting with a story or question engages the audience'
              }
            ],
            topic: 'Overcoming Stage Fright',
            topicDescription: 'Techniques to manage presentation anxiety'
          }
        ]
      }
    ]
  },

  // Business (25+) Modules
  {
    title: 'Leadership Communication',
    description: 'Advanced leadership and team communication',
    ageRange: '25+',
    moduleType: 'leadership',
    difficulty: 'expert',
    duration: 70,
    tags: ['leadership', 'management', 'teams'],
    topics: [
      {
        title: 'Team Motivation',
        description: 'Learn to motivate and inspire teams',
        videos: [
          {
            title: 'Motivational Leadership',
            description: 'Techniques for inspiring team performance',
            duration: 450,
            tags: ['motivation', 'leadership', 'teams'],
            topic: 'Team Motivation',
            topicDescription: 'Learn to motivate and inspire teams'
          }
        ],
        quizzes: [
          {
            title: 'Leadership Quiz',
            description: 'Test your leadership knowledge',
            questions: [
              {
                question: 'What is the most important leadership quality?',
                options: [
                  'Being the smartest person',
                  'Effective communication',
                  'Having all the answers',
                  'Being the most experienced'
                ],
                correctAnswer: 1,
                explanation: 'Effective communication is key to successful leadership'
              }
            ],
            topic: 'Team Motivation',
            topicDescription: 'Learn to motivate and inspire teams'
          }
        ]
      }
    ]
  }
];

// Add more modules to reach 20 total
const additionalModules = [
  {
    title: 'Food & Drinks',
    description: 'Learn food vocabulary and ordering',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 20,
    tags: ['food', 'drinks', 'restaurant'],
    topics: [
      {
        title: 'Breakfast Foods',
        description: 'Learn morning meal vocabulary',
        videos: [
          {
            title: 'What\'s for Breakfast?',
            description: 'Learn breakfast food names',
            duration: 120,
            tags: ['breakfast', 'food', 'morning'],
            topic: 'Breakfast Foods',
            topicDescription: 'Learn morning meal vocabulary'
          }
        ],
        quizzes: [
          {
            title: 'Breakfast Quiz',
            description: 'Test your breakfast vocabulary',
            questions: [
              {
                question: 'What do you drink in the morning?',
                options: ['Pizza', 'Coffee', 'Ice cream', 'Candy'],
                correctAnswer: 1,
                explanation: 'Coffee is a common morning drink'
              }
            ],
            topic: 'Breakfast Foods',
            topicDescription: 'Learn morning meal vocabulary'
          }
        ]
      }
    ]
  },
  {
    title: 'Clothing & Fashion',
    description: 'Learn clothing vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 18,
    tags: ['clothing', 'fashion', 'dress'],
    topics: [
      {
        title: 'What to Wear',
        description: 'Learn different types of clothing',
        videos: [
          {
            title: 'Getting Dressed',
            description: 'Learn clothing vocabulary',
            duration: 100,
            tags: ['clothing', 'dressing', 'fashion'],
            topic: 'What to Wear',
            topicDescription: 'Learn different types of clothing'
          }
        ],
        quizzes: [
          {
            title: 'Clothing Quiz',
            description: 'Test your clothing vocabulary',
            questions: [
              {
                question: 'What do you wear on your feet?',
                options: ['Hat', 'Shoes', 'Gloves', 'Scarf'],
                correctAnswer: 1,
                explanation: 'Shoes are worn on the feet'
              }
            ],
            topic: 'What to Wear',
            topicDescription: 'Learn different types of clothing'
          }
        ]
      }
    ]
  },
  {
    title: 'Home & Furniture',
    description: 'Learn home and furniture vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 22,
    tags: ['home', 'furniture', 'rooms'],
    topics: [
      {
        title: 'My House',
        description: 'Learn rooms and furniture names',
        videos: [
          {
            title: 'House Tour',
            description: 'Explore different rooms in a house',
            duration: 150,
            tags: ['house', 'rooms', 'furniture'],
            topic: 'My House',
            topicDescription: 'Learn rooms and furniture names'
          }
        ],
        quizzes: [
          {
            title: 'House Quiz',
            description: 'Test your house vocabulary',
            questions: [
              {
                question: 'Where do you sleep?',
                options: ['Kitchen', 'Bedroom', 'Bathroom', 'Garage'],
                correctAnswer: 1,
                explanation: 'You sleep in the bedroom'
              }
            ],
            topic: 'My House',
            topicDescription: 'Learn rooms and furniture names'
          }
        ]
      }
    ]
  },
  {
    title: 'School & Education',
    description: 'Learn school-related vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 25,
    tags: ['school', 'education', 'learning'],
    topics: [
      {
        title: 'School Subjects',
        description: 'Learn different school subjects',
        videos: [
          {
            title: 'My School Day',
            description: 'Learn about school subjects and activities',
            duration: 180,
            tags: ['school', 'subjects', 'education'],
            topic: 'School Subjects',
            topicDescription: 'Learn different school subjects'
          }
        ],
        quizzes: [
          {
            title: 'School Quiz',
            description: 'Test your school vocabulary',
            questions: [
              {
                question: 'What subject teaches you about numbers?',
                options: ['English', 'Math', 'Art', 'Music'],
                correctAnswer: 1,
                explanation: 'Math teaches you about numbers'
              }
            ],
            topic: 'School Subjects',
            topicDescription: 'Learn different school subjects'
          }
        ]
      }
    ]
  },
  {
    title: 'Body Parts & Health',
    description: 'Learn body parts and health vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 20,
    tags: ['body', 'health', 'anatomy'],
    topics: [
      {
        title: 'My Body',
        description: 'Learn body part names',
        videos: [
          {
            title: 'Body Parts Song',
            description: 'Learn body parts with a fun song',
            duration: 120,
            tags: ['body', 'parts', 'song'],
            topic: 'My Body',
            topicDescription: 'Learn body part names'
          }
        ],
        quizzes: [
          {
            title: 'Body Parts Quiz',
            description: 'Test your body parts knowledge',
            questions: [
              {
                question: 'What do you use to see?',
                options: ['Ears', 'Eyes', 'Nose', 'Mouth'],
                correctAnswer: 1,
                explanation: 'You use your eyes to see'
              }
            ],
            topic: 'My Body',
            topicDescription: 'Learn body part names'
          }
        ]
      }
    ]
  },
  {
    title: 'Transportation',
    description: 'Learn transportation vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 18,
    tags: ['transportation', 'vehicles', 'travel'],
    topics: [
      {
        title: 'How Do You Go?',
        description: 'Learn different ways to travel',
        videos: [
          {
            title: 'Transportation Song',
            description: 'Learn vehicles and transportation',
            duration: 100,
            tags: ['transportation', 'vehicles', 'travel'],
            topic: 'How Do You Go?',
            topicDescription: 'Learn different ways to travel'
          }
        ],
        quizzes: [
          {
            title: 'Transportation Quiz',
            description: 'Test your transportation vocabulary',
            questions: [
              {
                question: 'What has four wheels and carries people?',
                options: ['Boat', 'Car', 'Plane', 'Bicycle'],
                correctAnswer: 1,
                explanation: 'A car has four wheels and carries people'
              }
            ],
            topic: 'How Do You Go?',
            topicDescription: 'Learn different ways to travel'
          }
        ]
      }
    ]
  },
  {
    title: 'Weather & Seasons',
    description: 'Learn weather and seasons vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 20,
    tags: ['weather', 'seasons', 'climate'],
    topics: [
      {
        title: 'What\'s the Weather?',
        description: 'Learn weather vocabulary',
        videos: [
          {
            title: 'Weather Song',
            description: 'Learn about different weather conditions',
            duration: 120,
            tags: ['weather', 'seasons', 'climate'],
            topic: 'What\'s the Weather?',
            topicDescription: 'Learn weather vocabulary'
          }
        ],
        quizzes: [
          {
            title: 'Weather Quiz',
            description: 'Test your weather knowledge',
            questions: [
              {
                question: 'What falls from the sky when it rains?',
                options: ['Snow', 'Rain', 'Sunshine', 'Wind'],
                correctAnswer: 1,
                explanation: 'Rain falls from the sky when it rains'
              }
            ],
            topic: 'What\'s the Weather?',
            topicDescription: 'Learn weather vocabulary'
          }
        ]
      }
    ]
  },
  {
    title: 'Time & Calendar',
    description: 'Learn time and calendar vocabulary',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 25,
    tags: ['time', 'calendar', 'schedule'],
    topics: [
      {
        title: 'What Time Is It?',
        description: 'Learn to tell time',
        videos: [
          {
            title: 'Clock Song',
            description: 'Learn to read clocks and tell time',
            duration: 150,
            tags: ['time', 'clock', 'schedule'],
            topic: 'What Time Is It?',
            topicDescription: 'Learn to tell time'
          }
        ],
        quizzes: [
          {
            title: 'Time Quiz',
            description: 'Test your time knowledge',
            questions: [
              {
                question: 'How many hours are in a day?',
                options: ['12', '24', '30', '60'],
                correctAnswer: 1,
                explanation: 'There are 24 hours in a day'
              }
            ],
            topic: 'What Time Is It?',
            topicDescription: 'Learn to tell time'
          }
        ]
      }
    ]
  },
  {
    title: 'Basic Grammar',
    description: 'Learn basic grammar rules',
    ageRange: '6-12',
    moduleType: 'grammar',
    difficulty: 'beginner',
    duration: 30,
    tags: ['grammar', 'rules', 'sentences'],
    topics: [
      {
        title: 'Making Sentences',
        description: 'Learn to make simple sentences',
        videos: [
          {
            title: 'Sentence Building',
            description: 'Learn to build simple sentences',
            duration: 180,
            tags: ['sentences', 'grammar', 'structure'],
            topic: 'Making Sentences',
            topicDescription: 'Learn to make simple sentences'
          }
        ],
        quizzes: [
          {
            title: 'Sentence Quiz',
            description: 'Test your sentence building skills',
            questions: [
              {
                question: 'Which is a complete sentence?',
                options: [
                  'The cat',
                  'The cat is sleeping',
                  'Sleeping cat',
                  'Cat sleeping'
                ],
                correctAnswer: 1,
                explanation: 'A complete sentence needs a subject and verb'
              }
            ],
            topic: 'Making Sentences',
            topicDescription: 'Learn to make simple sentences'
          }
        ]
      }
    ]
  },
  {
    title: 'Common Verbs',
    description: 'Learn essential action words',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 22,
    tags: ['verbs', 'actions', 'words'],
    topics: [
      {
        title: 'Action Words',
        description: 'Learn common action verbs',
        videos: [
          {
            title: 'Action Verbs Song',
            description: 'Learn action words with movement',
            duration: 120,
            tags: ['verbs', 'actions', 'movement'],
            topic: 'Action Words',
            topicDescription: 'Learn common action verbs'
          }
        ],
        quizzes: [
          {
            title: 'Action Verbs Quiz',
            description: 'Test your action verb knowledge',
            questions: [
              {
                question: 'What do you do with a ball?',
                options: ['Eat', 'Play', 'Sleep', 'Read'],
                correctAnswer: 1,
                explanation: 'You play with a ball'
              }
            ],
            topic: 'Action Words',
            topicDescription: 'Learn common action verbs'
          }
        ]
      }
    ]
  },
  {
    title: 'Adjectives & Descriptions',
    description: 'Learn describing words',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 20,
    tags: ['adjectives', 'descriptions', 'words'],
    topics: [
      {
        title: 'Describing Words',
        description: 'Learn adjectives to describe things',
        videos: [
          {
            title: 'Adjective Song',
            description: 'Learn describing words',
            duration: 100,
            tags: ['adjectives', 'descriptions', 'words'],
            topic: 'Describing Words',
            topicDescription: 'Learn adjectives to describe things'
          }
        ],
        quizzes: [
          {
            title: 'Adjectives Quiz',
            description: 'Test your adjective knowledge',
            questions: [
              {
                question: 'What word describes the sun?',
                options: ['Cold', 'Dark', 'Bright', 'Quiet'],
                correctAnswer: 2,
                explanation: 'The sun is bright'
              }
            ],
            topic: 'Describing Words',
            topicDescription: 'Learn adjectives to describe things'
          }
        ]
      }
    ]
  },
  {
    title: 'Prepositions & Directions',
    description: 'Learn position and direction words',
    ageRange: '6-12',
    moduleType: 'vocabulary',
    difficulty: 'beginner',
    duration: 18,
    tags: ['prepositions', 'directions', 'position'],
    topics: [
      {
        title: 'Where Is It?',
        description: 'Learn position words',
        videos: [
          {
            title: 'Preposition Song',
            description: 'Learn position and direction words',
            duration: 100,
            tags: ['prepositions', 'position', 'directions'],
            topic: 'Where Is It?',
            topicDescription: 'Learn position words'
          }
        ],
        quizzes: [
          {
            title: 'Prepositions Quiz',
            description: 'Test your preposition knowledge',
            questions: [
              {
                question: 'The cat is ___ the table',
                options: ['On', 'In', 'Under', 'All of the above'],
                correctAnswer: 3,
                explanation: 'The cat could be on, in, or under the table'
              }
            ],
            topic: 'Where Is It?',
            topicDescription: 'Learn position words'
          }
        ]
      }
    ]
  }
];

// Combine all modules
const allModules = [...completeModules, ...additionalModules];

async function createCompleteModules() {
  try {
    console.log('🗑️ Clearing existing modules, videos, and quizzes...');
    await Module.deleteMany({});
    await Video.deleteMany({});
    await Quiz.deleteMany({});

    console.log('📚 Creating 20 complete modules with videos and quizzes...');
    
    for (let i = 0; i < allModules.length; i++) {
      const moduleData = allModules[i];
      console.log(`\n📖 Creating module ${i + 1}/20: ${moduleData.title}`);
      
      // Create module
      const module = new Module({
        title: moduleData.title,
        description: moduleData.description,
        ageRange: moduleData.ageRange,
        moduleType: moduleData.moduleType,
        difficulty: moduleData.difficulty,
        duration: moduleData.duration,
        tags: moduleData.tags,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await module.save();
      console.log(`✅ Module created: ${module.title}`);
      
      // Create videos and quizzes for each topic
      for (const topic of moduleData.topics) {
        console.log(`  📹 Creating content for topic: ${topic.title}`);
        
        // Create videos
        for (let j = 0; j < topic.videos.length; j++) {
          const videoData = topic.videos[j];
          const video = new Video({
            title: videoData.title,
            description: videoData.description,
            moduleId: module._id,
            level: 1,
            duration: videoData.duration,
            tags: videoData.tags,
            topic: videoData.topic,
            topicDescription: videoData.topicDescription,
            sequenceOrder: j + 1,
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await video.save();
          console.log(`    ✅ Video created: ${video.title}`);
        }
        
        // Create quizzes
        for (let k = 0; k < topic.quizzes.length; k++) {
          const quizData = topic.quizzes[k];
          const quiz = new Quiz({
            title: quizData.title,
            description: quizData.description,
            moduleId: module._id,
            level: 1,
            questions: quizData.questions,
            topic: quizData.topic,
            topicDescription: quizData.topicDescription,
            sequenceOrder: k + 1,
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await quiz.save();
          console.log(`    ✅ Quiz created: ${quiz.title}`);
        }
      }
    }
    
    console.log('\n🎉 Successfully created 20 complete modules with videos and quizzes!');
    console.log('\n📊 Summary:');
    console.log(`- Modules: ${allModules.length}`);
    
    const totalVideos = allModules.reduce((sum, module) => 
      sum + module.topics.reduce((topicSum, topic) => topicSum + topic.videos.length, 0), 0);
    const totalQuizzes = allModules.reduce((sum, module) => 
      sum + module.topics.reduce((topicSum, topic) => topicSum + topic.quizzes.length, 0), 0);
    
    console.log(`- Videos: ${totalVideos}`);
    console.log(`- Quizzes: ${totalQuizzes}`);
    console.log(`- Topics: ${allModules.reduce((sum, module) => sum + module.topics.length, 0)}`);
    
  } catch (error) {
    console.error('❌ Error creating modules:', error);
  } finally {
    mongoose.connection.close();
  }
}

createCompleteModules();
