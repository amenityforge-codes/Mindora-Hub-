const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoryModule'
  },
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }],
  quizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  dailyQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyQuestion'
  }],
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Topic', topicSchema);
