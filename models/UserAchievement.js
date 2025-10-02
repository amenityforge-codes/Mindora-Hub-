const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  achievementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: [true, 'Achievement ID is required']
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  coinsEarned: {
    type: Number,
    default: 0
  },
  isNotified: {
    type: Boolean,
    default: false
  },
  isDisplayed: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index to ensure unique user-achievement pairs
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

// Index for querying user achievements
userAchievementSchema.index({ userId: 1, earnedAt: -1 });
userAchievementSchema.index({ achievementId: 1 });

// Virtual to populate achievement details
userAchievementSchema.virtual('achievement', {
  ref: 'Achievement',
  localField: 'achievementId',
  foreignField: '_id',
  justOne: true
});

// Static method to get user achievements
userAchievementSchema.statics.getUserAchievements = function(userId, options = {}) {
  const query = { userId };
  
  return this.find(query)
    .populate({
      path: 'achievementId',
      match: {
        ...(options.category && { category: options.category }),
        ...(options.rarity && { rarity: options.rarity })
      }
    })
    .sort({ earnedAt: -1 })
    .limit(options.limit || 50);
};

// Static method to check if user has achievement
userAchievementSchema.statics.hasAchievement = function(userId, achievementId) {
  return this.findOne({ userId, achievementId });
};

// Static method to get user achievement stats
userAchievementSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'achievements',
        localField: 'achievementId',
        foreignField: '_id',
        as: 'achievement'
      }
    },
    { $unwind: '$achievement' },
    {
      $group: {
        _id: null,
        totalAchievements: { $sum: 1 },
        totalPoints: { $sum: '$pointsEarned' },
        totalXP: { $sum: '$xpEarned' },
        totalCoins: { $sum: '$coinsEarned' },
        categories: { $addToSet: '$achievement.category' },
        rarities: { $addToSet: '$achievement.rarity' }
      }
    }
  ]);
};

// Instance method to mark as notified
userAchievementSchema.methods.markAsNotified = function() {
  this.isNotified = true;
  return this.save();
};

module.exports = mongoose.model('UserAchievement', userAchievementSchema);
