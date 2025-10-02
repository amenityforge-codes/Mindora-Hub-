const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ei-english', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const defaultAchievements = [
  // Learning Achievements
  {
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'school',
    symbol: '🎓',
    color: '#4CAF50',
    pointsRequired: 10,
    category: 'learning',
    rarity: 'common',
    rewards: { points: 10, xp: 50, coins: 5 },
    tags: ['beginner', 'first', 'learning']
  },
  {
    name: 'Knowledge Seeker',
    description: 'Complete 5 lessons',
    icon: 'book',
    symbol: '📚',
    color: '#2196F3',
    pointsRequired: 50,
    category: 'learning',
    rarity: 'uncommon',
    rewards: { points: 25, xp: 100, coins: 15 },
    tags: ['learning', 'milestone', 'books']
  },
  {
    name: 'Scholar',
    description: 'Complete 25 lessons',
    icon: 'school',
    symbol: '🎓',
    color: '#9C27B0',
    pointsRequired: 250,
    category: 'learning',
    rarity: 'rare',
    rewards: { points: 50, xp: 200, coins: 30 },
    tags: ['learning', 'advanced', 'scholar']
  },
  {
    name: 'Master Learner',
    description: 'Complete 100 lessons',
    icon: 'star',
    symbol: '⭐',
    color: '#FF9800',
    pointsRequired: 1000,
    category: 'learning',
    rarity: 'epic',
    rewards: { points: 100, xp: 500, coins: 75 },
    tags: ['learning', 'master', 'expert']
  },

  // Streak Achievements
  {
    name: 'Getting Started',
    description: 'Maintain a 3-day learning streak',
    icon: 'local-fire-department',
    symbol: '🔥',
    color: '#FF5722',
    pointsRequired: 30,
    category: 'streak',
    rarity: 'common',
    rewards: { points: 15, xp: 75, coins: 10 },
    tags: ['streak', 'consistency', 'fire']
  },
  {
    name: 'Dedicated',
    description: 'Maintain a 7-day learning streak',
    icon: 'local-fire-department',
    symbol: '🔥',
    color: '#E91E63',
    pointsRequired: 70,
    category: 'streak',
    rarity: 'uncommon',
    rewards: { points: 35, xp: 150, coins: 25 },
    tags: ['streak', 'dedication', 'week']
  },
  {
    name: 'Unstoppable',
    description: 'Maintain a 30-day learning streak',
    icon: 'local-fire-department',
    symbol: '🔥',
    color: '#F44336',
    pointsRequired: 300,
    category: 'streak',
    rarity: 'rare',
    rewards: { points: 75, xp: 300, coins: 50 },
    tags: ['streak', 'unstoppable', 'month']
  },

  // Quiz Achievements
  {
    name: 'Quiz Master',
    description: 'Score 100% on 5 quizzes',
    icon: 'quiz',
    symbol: '🧠',
    color: '#3F51B5',
    pointsRequired: 100,
    category: 'quiz',
    rarity: 'uncommon',
    rewards: { points: 40, xp: 150, coins: 20 },
    tags: ['quiz', 'perfect', 'brain']
  },
  {
    name: 'Perfect Score',
    description: 'Score 100% on 25 quizzes',
    icon: 'quiz',
    symbol: '💯',
    color: '#4CAF50',
    pointsRequired: 500,
    category: 'quiz',
    rarity: 'rare',
    rewards: { points: 80, xp: 300, coins: 40 },
    tags: ['quiz', 'perfect', 'excellent']
  },

  // Video Achievements
  {
    name: 'Video Watcher',
    description: 'Watch 10 educational videos',
    icon: 'play-circle',
    symbol: '📺',
    color: '#607D8B',
    pointsRequired: 50,
    category: 'video',
    rarity: 'common',
    rewards: { points: 20, xp: 100, coins: 15 },
    tags: ['video', 'watching', 'entertainment']
  },
  {
    name: 'Binge Learner',
    description: 'Watch 50 educational videos',
    icon: 'play-circle',
    symbol: '📺',
    color: '#795548',
    pointsRequired: 250,
    category: 'video',
    rarity: 'uncommon',
    rewards: { points: 50, xp: 200, coins: 30 },
    tags: ['video', 'binge', 'dedication']
  },

  // Speaking Achievements
  {
    name: 'Voice of Confidence',
    description: 'Complete 10 speaking exercises',
    icon: 'mic',
    symbol: '🎤',
    color: '#E91E63',
    pointsRequired: 100,
    category: 'speaking',
    rarity: 'uncommon',
    rewards: { points: 30, xp: 120, coins: 20 },
    tags: ['speaking', 'confidence', 'voice']
  },
  {
    name: 'Orator',
    description: 'Complete 50 speaking exercises',
    icon: 'mic',
    symbol: '🎤',
    color: '#9C27B0',
    pointsRequired: 500,
    category: 'speaking',
    rarity: 'rare',
    rewards: { points: 60, xp: 250, coins: 40 },
    tags: ['speaking', 'orator', 'advanced']
  },

  // Writing Achievements
  {
    name: 'Wordsmith',
    description: 'Complete 20 writing exercises',
    icon: 'edit',
    symbol: '✍️',
    color: '#FF9800',
    pointsRequired: 200,
    category: 'writing',
    rarity: 'uncommon',
    rewards: { points: 35, xp: 140, coins: 25 },
    tags: ['writing', 'wordsmith', 'creative']
  },

  // Milestone Achievements
  {
    name: 'Century Club',
    description: 'Earn 100 total points',
    icon: 'flag',
    symbol: '🏆',
    color: '#FFD700',
    pointsRequired: 100,
    category: 'milestone',
    rarity: 'uncommon',
    rewards: { points: 25, xp: 100, coins: 20 },
    tags: ['milestone', 'points', 'century']
  },
  {
    name: 'Thousand Points',
    description: 'Earn 1,000 total points',
    icon: 'flag',
    symbol: '🏆',
    color: '#FF6B35',
    pointsRequired: 1000,
    category: 'milestone',
    rarity: 'rare',
    rewards: { points: 100, xp: 400, coins: 75 },
    tags: ['milestone', 'points', 'thousand']
  },
  {
    name: 'Legend',
    description: 'Earn 10,000 total points',
    icon: 'flag',
    symbol: '👑',
    color: '#8B5CF6',
    pointsRequired: 10000,
    category: 'milestone',
    rarity: 'legendary',
    rewards: { points: 500, xp: 2000, coins: 300 },
    tags: ['milestone', 'legend', 'ultimate']
  },

  // Special Achievements
  {
    name: 'Early Bird',
    description: 'Complete a lesson before 8 AM',
    icon: 'wb-sunny',
    symbol: '🌅',
    color: '#FFC107',
    pointsRequired: 25,
    category: 'special',
    rarity: 'uncommon',
    rewards: { points: 20, xp: 80, coins: 15 },
    tags: ['special', 'morning', 'early']
  },
  {
    name: 'Night Owl',
    description: 'Complete a lesson after 10 PM',
    icon: 'nightlight-round',
    symbol: '🦉',
    color: '#673AB7',
    pointsRequired: 25,
    category: 'special',
    rarity: 'uncommon',
    rewards: { points: 20, xp: 80, coins: 15 },
    tags: ['special', 'night', 'owl']
  },
  {
    name: 'Weekend Warrior',
    description: 'Complete lessons on both Saturday and Sunday',
    icon: 'weekend',
    symbol: '⚔️',
    color: '#E91E63',
    pointsRequired: 50,
    category: 'special',
    rarity: 'rare',
    rewards: { points: 40, xp: 150, coins: 30 },
    tags: ['special', 'weekend', 'warrior']
  }
];

async function seedAchievements() {
  try {
    console.log('Starting achievement seeding...');
    
    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log('Cleared existing achievements');
    
    // Get admin user for createdBy field
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Creating default admin...');
      const defaultAdmin = new User({
        name: 'System Admin',
        email: 'admin@system.com',
        password: 'admin123',
        role: 'admin',
        ageRange: '16+'
      });
      await defaultAdmin.save();
      console.log('Created default admin user');
    }
    
    const adminUserId = adminUser ? adminUser._id : (await User.findOne({ role: 'admin' }))._id;
    
    // Create achievements
    for (const achievementData of defaultAchievements) {
      const achievement = new Achievement({
        ...achievementData,
        createdBy: adminUserId,
        isActive: true,
        isSecret: false,
        displayOrder: defaultAchievements.indexOf(achievementData)
      });
      
      await achievement.save();
      console.log(`Created achievement: ${achievement.name}`);
    }
    
    console.log(`✅ Successfully seeded ${defaultAchievements.length} achievements!`);
    
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedAchievements();

