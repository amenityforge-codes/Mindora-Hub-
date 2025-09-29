const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  options: [{
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Option cannot exceed 200 characters']
  }],
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    min: [0, 'Correct answer index must be non-negative']
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: [500, 'Explanation cannot exceed 500 characters']
  }
}, { _id: true });

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  level: {
    type: Number,
    required: [true, 'Level is required'],
    min: [1, 'Level must be at least 1'],
    max: [20, 'Level cannot exceed 20']
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Module ID is required']
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number,
    default: 10,
    min: [1, 'Time limit must be at least 1 minute'],
    max: [120, 'Time limit cannot exceed 120 minutes']
  },
  passingScore: {
    type: Number,
    default: 70,
    min: [0, 'Passing score cannot be negative'],
    max: [100, 'Passing score cannot exceed 100']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required']
  },
  topic: {
    type: String,
    trim: true,
    maxlength: [100, 'Topic cannot exceed 100 characters']
  },
  topicDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Topic description cannot exceed 500 characters']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  weeklyContent: {
    type: Boolean,
    default: false
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  attempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  associatedVideo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    default: null
  },
  sequenceOrder: {
    type: Number,
    default: 0
  },
  unlockAfterVideo: {
    type: Boolean,
    default: false
  },
  completionRate: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
quizSchema.index({ moduleId: 1, level: 1 });
quizSchema.index({ level: 1, createdAt: -1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ isPublished: 1, isFeatured: 1 });
quizSchema.index({ weeklyContent: 1, publishDate: -1 });
quizSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for questions count
quizSchema.virtual('questionsCount').get(function() {
  return this.questions.length;
});

// Virtual for formatted time limit
quizSchema.virtual('formattedTimeLimit').get(function() {
  const hours = Math.floor(this.timeLimit / 60);
  const minutes = this.timeLimit % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Static method to get quizzes by module and level
quizSchema.statics.getQuizzesByModuleAndLevel = async function(moduleId, level) {
  return await this.find({ 
    moduleId: moduleId, 
    level: level, 
    isPublished: true 
  }).sort({ createdAt: -1 });
};

// Static method to get weekly content
quizSchema.statics.getWeeklyContent = async function(level) {
  const filter = { 
    weeklyContent: true, 
    isPublished: true,
    publishDate: { $lte: new Date() }
  };
  
  if (level) {
    filter.level = level;
  }
  
  return await this.find(filter)
    .sort({ publishDate: -1 })
    .populate('moduleId', 'title')
    .limit(10);
};

// Static method to get featured quizzes
quizSchema.statics.getFeaturedQuizzes = async function(limit = 5) {
  return await this.find({ 
    isFeatured: true, 
    isPublished: true 
  })
    .sort({ createdAt: -1 })
    .populate('moduleId', 'title')
    .limit(limit);
};

// Static method to get quiz analytics
quizSchema.statics.getQuizAnalytics = async function() {
  const pipeline = [
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        totalAttempts: { $sum: '$attempts' },
        averageScore: { $avg: '$averageScore' },
        averageCompletionRate: { $avg: '$completionRate' },
        publishedQuizzes: {
          $sum: { $cond: ['$isPublished', 1, 0] }
        },
        featuredQuizzes: {
          $sum: { $cond: ['$isFeatured', 1, 0] }
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
    averageCompletionRate: 0,
    publishedQuizzes: 0,
    featuredQuizzes: 0
  };
};

// Static method to get quizzes by difficulty
quizSchema.statics.getQuizzesByDifficulty = async function(difficulty, limit = 10) {
  return await this.find({ 
    difficulty: difficulty, 
    isPublished: true 
  })
    .sort({ createdAt: -1 })
    .populate('moduleId', 'title')
    .limit(limit);
};

// Instance method to calculate difficulty based on questions
quizSchema.methods.calculateDifficulty = function() {
  const questionCount = this.questions.length;
  const timeLimit = this.timeLimit;
  
  // Simple difficulty calculation based on question count and time limit
  if (questionCount <= 5 && timeLimit <= 10) {
    this.difficulty = 'Easy';
  } else if (questionCount <= 10 && timeLimit <= 20) {
    this.difficulty = 'Medium';
  } else {
    this.difficulty = 'Hard';
  }
};

// Instance method to update analytics
quizSchema.methods.updateAnalytics = async function(score, completed) {
  this.attempts += 1;
  
  // Update average score
  const totalScore = this.averageScore * (this.attempts - 1) + score;
  this.averageScore = Math.round(totalScore / this.attempts);
  
  // Update completion rate
  const totalCompleted = this.completionRate * (this.attempts - 1) + (completed ? 1 : 0);
  this.completionRate = Math.round((totalCompleted / this.attempts) * 100);
  
  await this.save();
};

// Pre-save middleware to validate questions
quizSchema.pre('save', function(next) {
  // Validate that correctAnswer indices are valid
  for (let i = 0; i < this.questions.length; i++) {
    const question = this.questions[i];
    if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
      return next(new Error(`Question ${i + 1} has invalid correct answer index`));
    }
  }
  
  // Calculate difficulty if not set
  if (!this.difficulty || this.difficulty === 'Easy') {
    this.calculateDifficulty();
  }
  
  next();
});

// Pre-save middleware to validate module exists
quizSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('moduleId')) {
    const Module = mongoose.model('Module');
    const module = await Module.findById(this.moduleId);
    if (!module) {
      return next(new Error('Module not found'));
    }
  }
  next();
});

// Pre-save middleware to validate questions array
quizSchema.pre('save', function(next) {
  if (this.questions.length === 0) {
    return next(new Error('Quiz must have at least one question'));
  }
  
  // Validate each question
  for (let i = 0; i < this.questions.length; i++) {
    const question = this.questions[i];
    
    if (!question.question || question.question.trim() === '') {
      return next(new Error(`Question ${i + 1} is empty`));
    }
    
    if (!question.options || question.options.length < 2) {
      return next(new Error(`Question ${i + 1} must have at least 2 options`));
    }
    
    // Check for empty options
    for (let j = 0; j < question.options.length; j++) {
      if (!question.options[j] || question.options[j].trim() === '') {
        return next(new Error(`Question ${i + 1}, Option ${j + 1} is empty`));
      }
    }
  }
  
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);
