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
  order: {
    type: Number,
    default: 0
  }
});

const moduleSchema = new mongoose.Schema({
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
  ageRange: {
    type: String,
    required: true,
    enum: ['6-15', '16+', 'business']
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 1
  },
  topics: [topicSchema],
  tags: [{
    type: String,
    trim: true
  }],
  thumbnail: {
    type: String,
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Module', moduleSchema);







