const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'abandoned'],
    default: 'not-started'
  },
  progress: {
    percentage: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot exceed 100%']
    },
    currentStep: {
      type: Number,
      default: 0
    },
    totalSteps: {
      type: Number,
      default: 1
    },
    lastAccessedStep: {
      type: Number,
      default: 0
    }
  },
  timeSpent: {
    total: { type: Number, default: 0 }, // in minutes
    session: { type: Number, default: 0 }, // current session
    lastSession: { type: Number, default: 0 }, // previous session
    averagePerSession: { type: Number, default: 0 }
  },
  scores: {
    quiz: {
      attempts: [{
        attemptNumber: Number,
        score: Number,
        totalMarks: Number,
        percentage: Number,
        timeSpent: Number,
        completedAt: Date,
        answers: [{
          questionId: mongoose.Schema.Types.ObjectId,
          userAnswer: mongoose.Schema.Types.Mixed,
          isCorrect: Boolean,
          timeSpent: Number
        }]
      }],
      bestScore: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      totalAttempts: { type: Number, default: 0 }
    },
    assignment: {
      attempts: [{
        attemptNumber: Number,
        score: Number,
        feedback: String,
        submittedAt: Date,
        gradedAt: Date,
        gradedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }],
      bestScore: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 }
    }
  },
  milestones: [{
    name: String,
    description: String,
    achievedAt: Date,
    type: {
      type: String,
      enum: ['completion', 'score', 'time', 'streak', 'custom']
    },
    value: mongoose.Schema.Types.Mixed
  }],
  streaks: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivity: Date
  },
  bookmarks: [{
    step: Number,
    timestamp: Number, // for video/audio
    note: String,
    createdAt: { type: Date, default: Date.now }
  }],
  notes: [{
    step: Number,
    content: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
  }],
  feedback: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: String,
    submittedAt: Date,
    helpful: Boolean,
    difficulty: {
      type: String,
      enum: ['too-easy', 'just-right', 'too-hard']
    }
  },
  completion: {
    startedAt: Date,
    completedAt: Date,
    lastActivity: {
      type: Date,
      default: Date.now
    },
    totalSessions: { type: Number, default: 0 }
  },
  analytics: {
    dropOffPoints: [{
      step: Number,
      timestamp: Number,
      reason: String
    }],
    revisitCount: { type: Number, default: 0 },
    averageSessionLength: { type: Number, default: 0 },
    preferredTimeOfDay: String,
    preferredDayOfWeek: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for efficient queries
progressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });
progressSchema.index({ userId: 1, status: 1 });
progressSchema.index({ userId: 1, 'completion.lastActivity': -1 });
progressSchema.index({ moduleId: 1, status: 1 });

// Virtual for completion rate
progressSchema.virtual('completionRate').get(function() {
  return this.progress.percentage;
});

// Virtual for time efficiency
progressSchema.virtual('timeEfficiency').get(function() {
  if (this.timeSpent.total === 0) return 0;
  return this.progress.percentage / this.timeSpent.total;
});

// Pre-save middleware to update streaks
progressSchema.pre('save', function(next) {
  if (this.isModified('completion.lastActivity')) {
    const now = new Date();
    const lastActivity = this.completion.lastActivity;
    
    if (lastActivity) {
      const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        this.streaks.current += 1;
      } else if (daysDiff > 1) {
        // Streak broken
        this.streaks.longest = Math.max(this.streaks.longest, this.streaks.current);
        this.streaks.current = 1;
      }
      // If daysDiff === 0, it's the same day, don't change streak
    } else {
      this.streaks.current = 1;
    }
    
    this.streaks.lastActivity = now;
  }
  next();
});

// Method to update progress
progressSchema.methods.updateProgress = function(step, percentage, timeSpent = 0) {
  this.progress.currentStep = step;
  this.progress.percentage = Math.min(percentage, 100);
  this.progress.lastAccessedStep = step;
  
  if (timeSpent > 0) {
    this.timeSpent.session += timeSpent;
    this.timeSpent.total += timeSpent;
  }
  
  this.completion.lastActivity = new Date();
  
  // Check if completed
  if (percentage >= 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completion.completedAt = new Date();
  } else if (this.status === 'not-started') {
    this.status = 'in-progress';
    this.completion.startedAt = new Date();
  }
  
  return this.save();
};

// Method to add quiz attempt
progressSchema.methods.addQuizAttempt = function(attemptData) {
  const attempt = {
    attemptNumber: this.scores.quiz.attempts.length + 1,
    score: attemptData.score,
    totalMarks: attemptData.totalMarks,
    percentage: (attemptData.score / attemptData.totalMarks) * 100,
    timeSpent: attemptData.timeSpent,
    completedAt: new Date(),
    answers: attemptData.answers || []
  };
  
  this.scores.quiz.attempts.push(attempt);
  this.scores.quiz.totalAttempts += 1;
  
  // Update best and average scores
  this.scores.quiz.bestScore = Math.max(this.scores.quiz.bestScore, attempt.percentage);
  
  const totalScore = this.scores.quiz.averageScore * (this.scores.quiz.totalAttempts - 1) + attempt.percentage;
  this.scores.quiz.averageScore = totalScore / this.scores.quiz.totalAttempts;
  
  return this.save();
};

// Method to add milestone
progressSchema.methods.addMilestone = function(name, description, type, value) {
  const milestone = {
    name,
    description,
    achievedAt: new Date(),
    type,
    value
  };
  
  this.milestones.push(milestone);
  return this.save();
};

// Method to add bookmark
progressSchema.methods.addBookmark = function(step, timestamp, note) {
  const bookmark = {
    step,
    timestamp,
    note,
    createdAt: new Date()
  };
  
  this.bookmarks.push(bookmark);
  return this.save();
};

// Method to add note
progressSchema.methods.addNote = function(step, content) {
  const note = {
    step,
    content,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  this.notes.push(note);
  return this.save();
};

// Method to end session
progressSchema.methods.endSession = function() {
  if (this.timeSpent.session > 0) {
    this.timeSpent.lastSession = this.timeSpent.session;
    this.timeSpent.total += this.timeSpent.session;
    
    // Update average session length
    this.completion.totalSessions += 1;
    const totalSessions = this.completion.totalSessions;
    const currentAverage = this.timeSpent.averagePerSession;
    this.timeSpent.averagePerSession = ((currentAverage * (totalSessions - 1)) + this.timeSpent.session) / totalSessions;
    
    this.timeSpent.session = 0;
  }
  
  return this.save();
};

// Static method to get user progress summary
progressSchema.statics.getUserProgressSummary = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProgress: { $avg: '$progress.percentage' },
        totalTimeSpent: { $sum: '$timeSpent.total' },
        avgScore: { $avg: '$scores.quiz.averageScore' }
      }
    }
  ]);
};

// Static method to get module analytics
progressSchema.statics.getModuleAnalytics = function(moduleId) {
  return this.aggregate([
    { $match: { moduleId: new mongoose.Types.ObjectId(moduleId) } },
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        completions: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        avgProgress: { $avg: '$progress.percentage' },
        avgTimeSpent: { $avg: '$timeSpent.total' },
        avgScore: { $avg: '$scores.quiz.averageScore' },
        avgRating: { $avg: '$feedback.rating' }
      }
    }
  ]);
};

module.exports = mongoose.model('Progress', progressSchema);

