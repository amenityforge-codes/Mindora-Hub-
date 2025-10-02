const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Exam description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Exam duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  passingMarks: {
    type: Number,
    required: [true, 'Passing marks are required'],
    min: [0, 'Passing marks cannot be negative'],
    max: [100, 'Passing marks cannot exceed 100']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks are required'],
    min: [1, 'Total marks must be at least 1']
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [2000, 'Instructions cannot exceed 2000 characters']
  },
  allowMultipleAttempts: {
    type: Boolean,
    default: false
  },
  maxAttempts: {
    type: Number,
    default: 1,
    min: [1, 'Max attempts must be at least 1']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['certification', 'assessment', 'quiz', 'final'],
    default: 'certification'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
examSchema.index({ isActive: 1, isPublished: 1 });
examSchema.index({ startDate: 1, endDate: 1 });
examSchema.index({ createdBy: 1 });
examSchema.index({ category: 1 });

// Virtual for exam status
examSchema.virtual('status').get(function() {
  const now = new Date();
  if (now < this.startDate) return 'upcoming';
  if (now > this.endDate) return 'ended';
  return 'active';
});

// Virtual for time remaining
examSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  if (now > this.endDate) return 0;
  return Math.max(0, this.endDate - now);
});

// Static method to get active exams
examSchema.statics.getActiveExams = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    isPublished: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).populate('questions');
};

// Static method to get exam statistics
examSchema.statics.getStatistics = function(examId) {
  return this.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(examId) } },
    {
      $lookup: {
        from: 'examattempts',
        localField: '_id',
        foreignField: 'exam',
        as: 'attempts'
      }
    },
    {
      $project: {
        totalAttempts: { $size: '$attempts' },
        passedAttempts: {
          $size: {
            $filter: {
              input: '$attempts',
              cond: { $gte: ['$$this.score', '$passingMarks'] }
            }
          }
        },
        failedAttempts: {
          $size: {
            $filter: {
              input: '$attempts',
              cond: { $lt: ['$$this.score', '$passingMarks'] }
            }
          }
        },
        averageScore: { $avg: '$attempts.score' }
      }
    }
  ]);
};

module.exports = mongoose.model('Exam', examSchema);

