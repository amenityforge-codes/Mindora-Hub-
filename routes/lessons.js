const mongoose = require('mongoose');

// Check if model already exists to prevent OverwriteModelError
const lessonSchema = new mongoose.Schema({
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
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 1
  },
  ageRange: {
    type: String,
    required: true,
    enum: ['6-15', '16+']
  },
  topics: [{
    id: { type: Number },
    title: { type: String },
    description: { type: String },
    order: { type: Number },
    createdAt: { type: Date, default: Date.now }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Export model, but check if it already exists to prevent OverwriteModelError
module.exports = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
