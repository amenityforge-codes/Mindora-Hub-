const mongoose = require('mongoose');

const categoryModuleSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
    enum: ['ai-finance', 'soft-skills', 'brainstorming', 'math', 'login'],
    index: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  estimatedDuration: {
    type: Number,
    default: 30,
    min: 1
  },
  topics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
categoryModuleSchema.index({ category: 1, difficulty: 1 });
categoryModuleSchema.index({ isActive: 1, category: 1 });

module.exports = mongoose.model('CategoryModule', categoryModuleSchema);
