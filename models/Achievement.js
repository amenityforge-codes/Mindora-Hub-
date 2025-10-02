const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Achievement name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Achievement description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    required: [true, 'Achievement icon is required'],
    trim: true
  },
  symbol: {
    type: String,
    required: [true, 'Achievement symbol is required'],
    trim: true
  },
  color: {
    type: String,
    required: [true, 'Achievement color is required'],
    default: '#FFD700'
  },
  pointsRequired: {
    type: Number,
    required: [true, 'Points required is required'],
    min: [0, 'Points required cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Achievement category is required'],
    enum: [
      'learning', 'streak', 'quiz', 'video', 'speaking', 'writing', 
      'listening', 'reading', 'grammar', 'vocabulary', 'social', 
      'milestone', 'special', 'seasonal', 'challenge'
    ]
  },
  rarity: {
    type: String,
    required: [true, 'Achievement rarity is required'],
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSecret: {
    type: Boolean,
    default: false
  },
  unlockConditions: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  rewards: {
    points: {
      type: Number,
      default: 0
    },
    xp: {
      type: Number,
      default: 0
    },
    coins: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
achievementSchema.index({ category: 1, pointsRequired: 1 });
achievementSchema.index({ rarity: 1, pointsRequired: -1 });
achievementSchema.index({ isActive: 1, isSecret: 1 });
achievementSchema.index({ createdBy: 1 });

// Virtual for formatted points
achievementSchema.virtual('formattedPoints').get(function() {
  return this.pointsRequired.toLocaleString();
});

// Static method to get achievements by category
achievementSchema.statics.getByCategory = function(category, limit = 50) {
  return this.find({ 
    category: category, 
    isActive: true 
  })
  .sort({ pointsRequired: 1, displayOrder: 1 })
  .limit(limit);
};

// Static method to get achievements by rarity
achievementSchema.statics.getByRarity = function(rarity, limit = 50) {
  return this.find({ 
    rarity: rarity, 
    isActive: true 
  })
  .sort({ pointsRequired: 1 })
  .limit(limit);
};

// Static method to get secret achievements
achievementSchema.statics.getSecretAchievements = function() {
  return this.find({ 
    isSecret: true, 
    isActive: true 
  })
  .sort({ pointsRequired: 1 });
};

// Static method to get achievements for user level
achievementSchema.statics.getForUserLevel = function(userPoints, limit = 20) {
  return this.find({ 
    pointsRequired: { $lte: userPoints + 100 }, // Show achievements within reach
    isActive: true,
    isSecret: false
  })
  .sort({ pointsRequired: 1 })
  .limit(limit);
};

module.exports = mongoose.model('Achievement', achievementSchema);

