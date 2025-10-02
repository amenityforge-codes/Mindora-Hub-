const mongoose = require('mongoose');

const examAttemptSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    marksObtained: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number, // Time spent on this question in seconds
      default: 0
    }
  }],
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  submittedAt: {
    type: Date
  },
  score: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  isPassed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'timeout', 'abandoned'],
    default: 'in_progress'
  },
  timeSpent: {
    type: Number, // Total time spent in seconds
    default: 0
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  // For tracking if student switched tabs or lost focus
  focusEvents: [{
    timestamp: Date,
    event: {
      type: String,
      enum: ['focus', 'blur', 'visibility_change']
    }
  }],
  // For detecting suspicious activity
  suspiciousActivity: {
    type: Boolean,
    default: false
  },
  suspiciousActivityReasons: [{
    type: String,
    enum: ['tab_switch', 'copy_paste', 'right_click', 'keyboard_shortcuts', 'multiple_windows']
  }],
  // For review and feedback
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review notes cannot exceed 1000 characters']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
examAttemptSchema.index({ exam: 1, student: 1 });
examAttemptSchema.index({ student: 1, status: 1 });
examAttemptSchema.index({ exam: 1, status: 1 });
examAttemptSchema.index({ submittedAt: 1 });
examAttemptSchema.index({ score: 1 });

// Virtual for duration
examAttemptSchema.virtual('duration').get(function() {
  if (this.endTime && this.startTime) {
    return Math.floor((this.endTime - this.startTime) / 1000); // Duration in seconds
  }
  return 0;
});

// Virtual for time remaining
examAttemptSchema.virtual('timeRemaining').get(function() {
  if (this.status !== 'in_progress') return 0;
  
  const examDuration = this.exam?.duration * 60; // Convert minutes to seconds
  const elapsed = Math.floor((new Date() - this.startTime) / 1000);
  return Math.max(0, examDuration - elapsed);
});

// Method to calculate score
examAttemptSchema.methods.calculateScore = function() {
  let totalScore = 0;
  let totalMarks = 0;
  
  this.answers.forEach(answer => {
    totalScore += answer.marksObtained;
    // Get question marks from populated question or default to 1
    const questionMarks = answer.question?.marks || 1;
    totalMarks += questionMarks;
  });
  
  this.score = totalScore;
  this.percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
  
  return {
    score: this.score,
    percentage: this.percentage,
    totalMarks: totalMarks
  };
};

// Method to check if passed
examAttemptSchema.methods.checkPassStatus = function(exam) {
  this.isPassed = this.percentage >= exam.passingMarks;
  return this.isPassed;
};

// Method to submit exam
examAttemptSchema.methods.submitExam = function() {
  this.endTime = new Date();
  this.submittedAt = new Date();
  this.status = 'submitted';
  this.timeSpent = Math.floor((this.endTime - this.startTime) / 1000);
  
  // Calculate final score
  this.calculateScore();
  
  return this.save();
};

// Static method to get student's attempts for an exam
examAttemptSchema.statics.getStudentAttempts = function(examId, studentId) {
  return this.find({ exam: examId, student: studentId })
    .populate('exam', 'title duration passingMarks totalMarks')
    .sort({ createdAt: -1 });
};

// Static method to get exam statistics
examAttemptSchema.statics.getExamStatistics = function(examId) {
  return this.aggregate([
    { $match: { exam: mongoose.Types.ObjectId(examId), status: 'submitted' } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score' },
        averagePercentage: { $avg: '$percentage' },
        passedAttempts: {
          $sum: { $cond: ['$isPassed', 1, 0] }
        },
        failedAttempts: {
          $sum: { $cond: ['$isPassed', 0, 1] }
        },
        highestScore: { $max: '$score' },
        lowestScore: { $min: '$score' }
      }
    }
  ]);
};

// Static method to get top performers
examAttemptSchema.statics.getTopPerformers = function(examId, limit = 10) {
  return this.find({ 
    exam: examId, 
    status: 'submitted' 
  })
  .populate('student', 'name email')
  .sort({ score: -1, submittedAt: 1 })
  .limit(limit);
};

// Pre-save middleware to calculate score and pass status
examAttemptSchema.pre('save', async function(next) {
  if (this.isModified('answers') || this.isModified('score')) {
    // Populate exam if not already populated
    if (!this.populated('exam')) {
      await this.populate('exam');
    }
    
    if (this.exam) {
      this.checkPassStatus(this.exam);
    }
  }
  next();
});

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);

