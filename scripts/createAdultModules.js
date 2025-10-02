const mongoose = require('mongoose');
const Module = require('../models/Module');
const User = require('../models/User');
require('dotenv').config();

const createAdultModules = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/English-1?retryWrites=true&w=majority&appName=Cluster0');

    console.log('🔗 Connected to MongoDB');

    // Find adult admin user
    const adultAdmin = await User.findOne({ email: 'amenityforge-adult@gmail.com' });
    if (!adultAdmin) {
      console.log('❌ Adult admin user not found. Please run seedAdultAdmin.js first.');
      return;
    }

    console.log('👤 Found adult admin:', adultAdmin.email);

    // Adult modules data
    const adultModules = [
      {
        title: 'Business Writing Fundamentals',
        description: 'Master professional business writing skills for emails, reports, and proposals.',
        moduleType: 'business-writing',
        ageRange: '16+',
        difficulty: 'intermediate',
        estimatedDuration: 45,
        topics: [
          {
            title: 'Email Writing',
            description: 'Professional email communication',
            content: 'Learn to write clear, professional emails that get results.',
            videos: [
              {
                title: 'Email Structure and Tone',
                description: 'Understanding proper email format',
                url: '/uploads/videos/email-structure.mp4',
                duration: 300
              }
            ],
            questions: [
              {
                question: 'What is the most important part of a business email?',
                options: ['Subject line', 'Body', 'Signature', 'Attachments'],
                correctAnswer: 0,
                explanation: 'The subject line determines if your email gets opened.'
              }
            ],
            notes: [
              {
                title: 'Email Best Practices',
                content: 'Always use a clear subject line, be concise, and proofread before sending.'
              }
            ],
            links: [
              {
                title: 'Business Email Templates',
                url: 'https://example.com/email-templates',
                description: 'Professional email templates for various business scenarios'
              }
            ]
          },
          {
            title: 'Report Writing',
            description: 'Creating comprehensive business reports',
            content: 'Learn to structure and write effective business reports.',
            videos: [
              {
                title: 'Report Structure',
                description: 'How to organize information in reports',
                url: '/uploads/videos/report-structure.mp4',
                duration: 420
              }
            ],
            questions: [
              {
                question: 'What should come first in a business report?',
                options: ['Executive Summary', 'Introduction', 'Conclusion', 'Appendices'],
                correctAnswer: 0,
                explanation: 'Executive summary provides a quick overview for busy executives.'
              }
            ],
            notes: [
              {
                title: 'Report Writing Tips',
                content: 'Use clear headings, include data visualization, and provide actionable recommendations.'
              }
            ],
            links: [
              {
                title: 'Report Writing Guide',
                url: 'https://example.com/report-guide',
                description: 'Comprehensive guide to business report writing'
              }
            ]
          }
        ]
      },
      {
        title: 'Presentation Skills Mastery',
        description: 'Develop confident presentation skills for meetings, conferences, and client pitches.',
        moduleType: 'presentation',
        ageRange: '16+',
        difficulty: 'intermediate',
        estimatedDuration: 60,
        topics: [
          {
            title: 'Public Speaking Basics',
            description: 'Overcoming fear and building confidence',
            content: 'Learn techniques to overcome presentation anxiety and speak with confidence.',
            videos: [
              {
                title: 'Overcoming Presentation Anxiety',
                description: 'Techniques to manage nervousness',
                url: '/uploads/videos/presentation-anxiety.mp4',
                duration: 360
              }
            ],
            questions: [
              {
                question: 'What is the best way to overcome presentation anxiety?',
                options: ['Practice', 'Avoid eye contact', 'Speak quickly', 'Read from notes'],
                correctAnswer: 0,
                explanation: 'Practice is the most effective way to build confidence and reduce anxiety.'
              }
            ],
            notes: [
              {
                title: 'Confidence Building',
                content: 'Practice regularly, know your material, and focus on your audience\'s needs.'
              }
            ],
            links: [
              {
                title: 'Public Speaking Resources',
                url: 'https://example.com/public-speaking',
                description: 'Additional resources for improving presentation skills'
              }
            ]
          }
        ]
      },
      {
        title: 'Negotiation Techniques',
        description: 'Master the art of negotiation for business deals, salary discussions, and conflict resolution.',
        moduleType: 'negotiation',
        ageRange: '16+',
        difficulty: 'advanced',
        estimatedDuration: 90,
        topics: [
          {
            title: 'Win-Win Negotiation',
            description: 'Creating mutually beneficial agreements',
            content: 'Learn to negotiate deals that benefit all parties involved.',
            videos: [
              {
                title: 'Negotiation Strategies',
                description: 'Proven techniques for successful negotiations',
                url: '/uploads/videos/negotiation-strategies.mp4',
                duration: 480
              }
            ],
            questions: [
              {
                question: 'What is the key to successful negotiation?',
                options: ['Being aggressive', 'Understanding needs', 'Avoiding compromise', 'Winning at all costs'],
                correctAnswer: 1,
                explanation: 'Understanding both parties\' needs leads to better outcomes.'
              }
            ],
            notes: [
              {
                title: 'Negotiation Principles',
                content: 'Prepare thoroughly, listen actively, and focus on interests rather than positions.'
              }
            ],
            links: [
              {
                title: 'Negotiation Case Studies',
                url: 'https://example.com/negotiation-cases',
                description: 'Real-world examples of successful negotiations'
              }
            ]
          }
        ]
      },
      {
        title: 'Interview Preparation',
        description: 'Ace job interviews with confidence through proper preparation and practice.',
        moduleType: 'interview',
        ageRange: '16+',
        difficulty: 'intermediate',
        estimatedDuration: 75,
        topics: [
          {
            title: 'Common Interview Questions',
            description: 'Preparing for typical interview scenarios',
            content: 'Learn to answer common interview questions effectively.',
            videos: [
              {
                title: 'STAR Method for Behavioral Questions',
                description: 'Structured approach to answering behavioral questions',
                url: '/uploads/videos/star-method.mp4',
                duration: 300
              }
            ],
            questions: [
              {
                question: 'What does STAR stand for in interview preparation?',
                options: ['Situation, Task, Action, Result', 'Start, Think, Act, Review', 'Study, Train, Apply, Repeat', 'Speak, Tell, Answer, Respond'],
                correctAnswer: 0,
                explanation: 'STAR method helps structure behavioral interview responses effectively.'
              }
            ],
            notes: [
              {
                title: 'Interview Success Tips',
                content: 'Research the company, practice your answers, and prepare thoughtful questions to ask.'
              }
            ],
            links: [
              {
                title: 'Interview Question Bank',
                url: 'https://example.com/interview-questions',
                description: 'Comprehensive list of interview questions by industry'
              }
            ]
          }
        ]
      },
      {
        title: 'Professional Communication',
        description: 'Enhance your professional communication skills for workplace success.',
        moduleType: 'communication',
        ageRange: '16+',
        difficulty: 'intermediate',
        estimatedDuration: 50,
        topics: [
          {
            title: 'Active Listening',
            description: 'Improving listening skills for better communication',
            content: 'Learn to listen effectively and respond appropriately in professional settings.',
            videos: [
              {
                title: 'Active Listening Techniques',
                description: 'How to listen and respond effectively',
                url: '/uploads/videos/active-listening.mp4',
                duration: 240
              }
            ],
            questions: [
              {
                question: 'What is the most important aspect of active listening?',
                options: ['Taking notes', 'Giving advice', 'Understanding the speaker', 'Interrupting to clarify'],
                correctAnswer: 2,
                explanation: 'Understanding the speaker\'s perspective is key to effective communication.'
              }
            ],
            notes: [
              {
                title: 'Communication Best Practices',
                content: 'Listen without judgment, ask clarifying questions, and provide constructive feedback.'
              }
            ],
            links: [
              {
                title: 'Communication Skills Guide',
                url: 'https://example.com/communication-skills',
                description: 'Comprehensive guide to professional communication'
              }
            ]
          }
        ]
      }
    ];

    // Create modules
    for (const moduleData of adultModules) {
      const existingModule = await Module.findOne({ 
        title: moduleData.title,
        ageRange: '16+'
      });

      if (existingModule) {
        console.log(`⚠️  Module "${moduleData.title}" already exists`);
        continue;
      }

      const module = new Module({
        ...moduleData,
        createdBy: adultAdmin._id,
        status: 'published',
        featured: true
      });

      await module.save();
      console.log(`✅ Created module: "${moduleData.title}"`);
    }

    console.log('🎉 Adult modules created successfully!');

  } catch (error) {
    console.error('❌ Error creating adult modules:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
createAdultModules();
