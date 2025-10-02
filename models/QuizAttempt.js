const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz ID is required']
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Module ID is required']
  },
  attemptNumber: {
    type: Number,
    required: [true, 'Attempt number is required'],
    min: [1, 'Attempt number must be at least 1']
  },
  answers: [{
    questionIndex: Number,
    userAnswer: Number,
    isCorrect: Boolean,
    timeSpent: Number // Time spent on this question in seconds
  }],
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  adjustedScore: {
    type: Number,
    required: [true, 'Adjusted score is required'],
    min: [0, 'Adjusted score cannot be negative'],
    max: [100, 'Adjusted score cannot exceed 100']
  },
  pointsEarned: {
    type: Number,
    required: [true, 'Points earned is required'],
    min: [0, 'Points earned cannot be negative'],
    max: [100, 'Points earned cannot exceed 100']
  },
  passed: {
    type: Boolean,
    required: [true, 'Passed status is required']
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: [0, 'Time spent cannot be negative']
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'abandoned'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Compound index to ensure unique attempt tracking
quizAttemptSchema.index({ userId: 1, quizId: 1, attemptNumber: 1 }, { unique: true });

// Index for analytics
quizAttemptSchema.index({ userId: 1, moduleId: 1 });
quizAttemptSchema.index({ quizId: 1, completedAt: -1 });

// Static method to get user's quiz attempts
quizAttemptSchema.statics.getUserQuizAttempts = async function(userId, quizId) {
  return await this.find({ userId, quizId })
    .sort({ attemptNumber: 1 })
    .populate('quizId', 'title passingScore');
};

// Static method to get latest attempt for a quiz
quizAttemptSchema.statics.getLatestAttempt = async function(userId, quizId) {
  return await this.findOne({ userId, quizId })
    .sort({ attemptNumber: -1 });
};

// Static method to calculate next attempt number
quizAttemptSchema.statics.getNextAttemptNumber = async function(userId, quizId) {
  const latestAttempt = await this.findOne({ userId, quizId })
    .sort({ attemptNumber: -1 });
  
  return latestAttempt ? latestAttempt.attemptNumber + 1 : 1;
};

// Static method to get user's best score for a quiz
quizAttemptSchema.statics.getBestScore = async function(userId, quizId) {
  const bestAttempt = await this.findOne({ userId, quizId })
    .sort({ adjustedScore: -1 });
  
  return bestAttempt ? bestAttempt.adjustedScore : 0;
};

// Instance method to calculate adjusted score based on attempt rules
quizAttemptSchema.methods.calculateAdjustedScore = function() {
  const rawScore = this.score;
  const attemptNumber = this.attemptNumber;
  
  if (attemptNumber === 1) {
    // First attempt: use raw score
    return rawScore;
  } else {
    // Re-attempts: max 85%
    return Math.min(rawScore, 85);
  }
};

// Instance method to determine if user can re-attempt
quizAttemptSchema.methods.canReAttempt = function() {
  const latestAttempt = this;
  
  // If first attempt was 100%, no re-attempt needed
  if (latestAttempt.attemptNumber === 1 && latestAttempt.score === 100) {
    return false;
  }
  
  // Allow re-attempts for other cases
  return true;
};

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
