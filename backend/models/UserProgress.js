const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Module ID is required']
  },
  progress: {
    percentage: {
      type: Number,
      default: 0,
      min: [0, 'Progress percentage cannot be negative'],
      max: [100, 'Progress percentage cannot exceed 100']
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: [0, 'Time spent cannot be negative']
    },
    points: {
      type: Number,
      default: 0,
      min: [0, 'Points cannot be negative']
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  completedTopics: [{
    topicId: String,
    topicTitle: String,
    completedAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      default: 0
    }
  }],
  quizAttempts: [{
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    bestScore: {
      type: Number,
      default: 0
    },
    totalAttempts: {
      type: Number,
      default: 0
    },
    lastAttempt: {
      type: Date,
      default: Date.now
    }
  }],
  videoProgress: [{
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    },
    watched: {
      type: Boolean,
      default: false
    },
    watchTime: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date,
      default: null
    }
  }]
}, {
  timestamps: true
});

// Compound index to ensure unique user-module progress
userProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

// Index for analytics
userProgressSchema.index({ userId: 1, 'progress.status': 1 });
userProgressSchema.index({ 'progress.lastActivity': -1 });

// Static method to get user's module progress
userProgressSchema.statics.getUserModuleProgress = async function(userId, moduleId) {
  return await this.findOne({ userId, moduleId })
    .populate('moduleId', 'title description')
    .populate('quizAttempts.quizId', 'title passingScore');
};

// Static method to get all user progress
userProgressSchema.statics.getUserProgress = async function(userId, options = {}) {
  const { status, limit = 50, page = 1 } = options;
  
  const filter = { userId };
  if (status) {
    filter['progress.status'] = status;
  }
  
  const progress = await this.find(filter)
    .populate('moduleId', 'title description moduleType difficulty')
    .sort({ 'progress.lastActivity': -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
  const total = await this.countDocuments(filter);
  
  return {
    progress,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      count: progress.length
    }
  };
};

// Static method to get progress summary
userProgressSchema.statics.getProgressSummary = async function(userId) {
  const summary = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$progress.status',
        count: { $sum: 1 },
        totalPoints: { $sum: '$progress.points' },
        totalTimeSpent: { $sum: '$progress.timeSpent' }
      }
    }
  ]);
  
  return summary;
};

// Instance method to update progress
userProgressSchema.methods.updateProgress = function(updates) {
  if (updates.percentage !== undefined) {
    this.progress.percentage = Math.min(Math.max(updates.percentage, 0), 100);
    
    // Update status based on percentage
    if (this.progress.percentage === 100) {
      this.progress.status = 'completed';
    } else if (this.progress.percentage > 0) {
      this.progress.status = 'in-progress';
    }
  }
  
  if (updates.points !== undefined) {
    this.progress.points = Math.max(updates.points, 0);
  }
  
  if (updates.timeSpent !== undefined) {
    this.progress.timeSpent += Math.max(updates.timeSpent, 0);
  }
  
  this.progress.lastActivity = new Date();
  
  return this.save();
};

// Instance method to add completed topic
userProgressSchema.methods.addCompletedTopic = function(topicId, topicTitle, score = 0) {
  const existingTopic = this.completedTopics.find(t => t.topicId === topicId);
  
  if (existingTopic) {
    // Update existing topic
    existingTopic.score = Math.max(existingTopic.score, score);
    existingTopic.completedAt = new Date();
  } else {
    // Add new topic
    this.completedTopics.push({
      topicId,
      topicTitle,
      score,
      completedAt: new Date()
    });
  }
  
  // Update overall progress
  const totalTopics = 6; // Assuming 6 topics per module
  const completedCount = this.completedTopics.length;
  this.progress.percentage = Math.min((completedCount / totalTopics) * 100, 100);
  
  if (this.progress.percentage === 100) {
    this.progress.status = 'completed';
  } else if (this.progress.percentage > 0) {
    this.progress.status = 'in-progress';
  }
  
  this.progress.lastActivity = new Date();
  
  return this.save();
};

// Instance method to update quiz attempt
userProgressSchema.methods.updateQuizAttempt = function(quizId, score, passed) {
  const existingQuiz = this.quizAttempts.find(q => q.quizId.toString() === quizId.toString());
  
  if (existingQuiz) {
    existingQuiz.bestScore = Math.max(existingQuiz.bestScore, score);
    existingQuiz.totalAttempts += 1;
    existingQuiz.lastAttempt = new Date();
  } else {
    this.quizAttempts.push({
      quizId,
      bestScore: score,
      totalAttempts: 1,
      lastAttempt: new Date()
    });
  }
  
  // Update points based on quiz performance
  const pointsEarned = Math.floor(score / 10); // 1 point per 10% score
  this.progress.points += pointsEarned;
  
  this.progress.lastActivity = new Date();
  
  return this.save();
};

module.exports = mongoose.model('UserProgress', userProgressSchema);











