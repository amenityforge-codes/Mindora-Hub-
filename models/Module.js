const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Module description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  moduleType: {
    type: String,
    required: [true, 'Module type is required'],
    enum: [
      'phonics', 'grammar', 'vocabulary', 'reading', 'writing', 'listening', 'speaking',
      'communication', 'ai', 'finance', 'soft-skills', 'brainstorming', 'math',
      'business-writing', 'presentation', 'negotiation', 'interview'
    ]
  },
  ageRange: {
    type: String,
    required: [true, 'Age range is required'],
    enum: ['6-15', '16+', 'business', 'all']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  tags: [{
    type: String,
    enum: [
      'phonics', 'reading', 'foundations', 'grammar', 'vocabulary', 'writing',
      'communication', 'ai', 'finance', 'soft-skills', 'brainstorming', 'math',
      'business', 'professional', 'academic', 'exam-prep', 'interview', 'presentation'
    ]
  }],
  media: {
    video: {
      url: String,
      duration: Number, // in seconds
      thumbnail: String,
      transcript: String,
      subtitles: String
    },
    audio: {
      url: String,
      duration: Number,
      transcript: String
    },
    pdf: {
      url: String,
      pages: Number,
      title: String
    },
    images: [{
      url: String,
      caption: String,
      alt: String
    }]
  },
  content: {
    text: String,
    instructions: String,
    objectives: [String],
    prerequisites: [String]
  },
  topics: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      default: 1
    },
    videos: [{
      title: String,
      url: String,
      duration: Number,
      thumbnail: String,
      description: String,
      videoUrl: String,
      isLocalFile: Boolean,
      uploadedAt: Date
    }],
    questions: [{
      question: { type: String },
      options: [{ type: String }],
      correctAnswer: { type: Number },
      explanation: { type: String },
      type: { type: String },
      scenario: { type: String },
      maxAttempts: { type: Number },
      createdAt: { type: Date, default: Date.now }
    }],
    notes: [{
      title: { type: String },
      fileUrl: { type: String },
      fileType: { type: String },
      uploadedAt: { type: Date, default: Date.now }
    }],
    links: [{
      title: { type: String },
      url: { type: String },
      description: { type: String },
      type: { type: String },
      createdAt: { type: Date, default: Date.now }
    }],
    quizzes: [{
      title: String,
      description: String,
      questionCount: Number,
      duration: Number
    }]
  }],
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  srsBatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SRSBatch'
  },
  assignments: [{
    title: String,
    description: String,
    type: {
      type: String,
      enum: ['writing', 'speaking', 'reading', 'listening', 'project']
    },
    instructions: String,
    rubric: String,
    dueDate: Date,
    maxScore: { type: Number, default: 100 }
  }],
  resources: [{
    title: String,
    type: {
      type: String,
      enum: ['link', 'document', 'video', 'audio', 'worksheet']
    },
    url: String,
    description: String
  }],
  estimatedDuration: {
    type: Number,
    required: [true, 'Estimated duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  publishAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    content: mongoose.Schema.Types.Mixed,
    updatedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  analytics: {
    views: { type: Number, default: 0 },
    completions: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageTimeSpent: { type: Number, default: 0 },
    dropOffPoints: [{
      timestamp: Number,
      percentage: Number
    }]
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  weeklyPackage: {
    weekNumber: Number,
    year: Number,
    packageId: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
moduleSchema.index({ moduleType: 1, ageRange: 1 });
moduleSchema.index({ status: 1, publishAt: 1 });
moduleSchema.index({ tags: 1 });
moduleSchema.index({ createdBy: 1 });
moduleSchema.index({ 'weeklyPackage.weekNumber': 1, 'weeklyPackage.year': 1 });

// Virtual for completion rate
moduleSchema.virtual('completionRate').get(function() {
  if (this.analytics.views === 0) return 0;
  return (this.analytics.completions / this.analytics.views) * 100;
});

// Virtual for engagement score
moduleSchema.virtual('engagementScore').get(function() {
  const completionWeight = 0.4;
  const scoreWeight = 0.3;
  const timeWeight = 0.3;
  
  const completionScore = this.completionRate;
  const scoreComponent = this.analytics.averageScore;
  const timeComponent = Math.min(this.analytics.averageTimeSpent / this.estimatedDuration, 1) * 100;
  
  return (completionScore * completionWeight) + 
         (scoreComponent * scoreWeight) + 
         (timeComponent * timeWeight);
});

// Pre-save middleware to update version history
moduleSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    // Store previous version
    const previousVersion = {
      version: this.version,
      content: this.toObject(),
      updatedAt: new Date(),
      updatedBy: this.createdBy
    };
    
    this.previousVersions.push(previousVersion);
    this.version += 1;
  }
  next();
});

// Method to update analytics
moduleSchema.methods.updateAnalytics = function(viewData) {
  this.analytics.views += 1;
  
  if (viewData.completed) {
    this.analytics.completions += 1;
  }
  
  if (viewData.score !== undefined) {
    const totalScore = this.analytics.averageScore * (this.analytics.completions - 1) + viewData.score;
    this.analytics.averageScore = totalScore / this.analytics.completions;
  }
  
  if (viewData.timeSpent !== undefined) {
    const totalTime = this.analytics.averageTimeSpent * (this.analytics.views - 1) + viewData.timeSpent;
    this.analytics.averageTimeSpent = totalTime / this.analytics.views;
  }
  
  return this.save();
};

// Static method to get modules by age range and type
moduleSchema.statics.getModulesByAgeAndType = function(ageRange, moduleType, limit = 10) {
  const query = { 
    status: 'published',
    publishAt: { $lte: new Date() }
  };
  
  if (ageRange && ageRange !== 'all') {
    query.$or = [
      { ageRange: ageRange },
      { ageRange: 'all' }
    ];
  }
  
  if (moduleType) {
    query.moduleType = moduleType;
  }
  
  return this.find(query)
    .populate('quiz')
    .populate('createdBy', 'name')
    .sort({ publishAt: -1 })
    .limit(limit);
};

// Static method to get weekly content
moduleSchema.statics.getWeeklyContent = function(weekNumber, year, ageRange) {
  const query = {
    status: 'published',
    'weeklyPackage.weekNumber': weekNumber,
    'weeklyPackage.year': year
  };
  
  if (ageRange && ageRange !== 'all') {
    query.$or = [
      { ageRange: ageRange },
      { ageRange: 'all' }
    ];
  }
  
  return this.find(query)
    .populate('quiz')
    .populate('createdBy', 'name')
    .sort({ moduleType: 1 });
};

module.exports = mongoose.model('Module', moduleSchema);

