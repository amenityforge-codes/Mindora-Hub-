const mongoose = require('mongoose');

const dailyQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  scenario: {
    type: String,
    required: true,
    trim: true
  },
  correctAnswer: {
    type: String,
    required: true,
    trim: true
  },
  explanation: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoryModule',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
dailyQuestionSchema.index({ category: 1, difficulty: 1 });
dailyQuestionSchema.index({ date: -1 });
dailyQuestionSchema.index({ topicId: 1, moduleId: 1 });

module.exports = mongoose.model('DailyQuestion', dailyQuestionSchema);

