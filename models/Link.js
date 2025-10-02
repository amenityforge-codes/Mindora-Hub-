const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Link title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['resource', 'reference', 'external', 'video', 'document'],
    default: 'resource'
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Topic ID is required']
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoryModule',
    required: [true, 'Module ID is required']
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  clickCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
linkSchema.index({ topicId: 1 });
linkSchema.index({ moduleId: 1 });
linkSchema.index({ isActive: 1 });
linkSchema.index({ type: 1 });

// Instance method to increment click count
linkSchema.methods.incrementClick = async function() {
  this.clickCount += 1;
  await this.save();
};

module.exports = mongoose.model('Link', linkSchema);


