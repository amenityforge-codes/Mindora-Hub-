const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
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
  duration: {
    type: Number,
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required']
  },
  url: {
    type: String,
    required: [true, 'Video URL is required']
  },
  topic: {
    type: String,
    trim: true,
    default: ''
  },
  topicDescription: {
    type: String,
    trim: true,
    default: ''
  },
  sequenceOrder: {
    type: Number,
    default: 1,
    min: [1, 'Sequence order must be at least 1']
  },
  thumbnail: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader ID is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
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
  metadata: {
    resolution: String,
    aspectRatio: String,
    codec: String,
    bitrate: Number
  }
}, {
  timestamps: true
});

// Indexes for better query performance
videoSchema.index({ moduleId: 1, level: 1 });
videoSchema.index({ level: 1, uploadedAt: -1 });
videoSchema.index({ uploadedBy: 1 });
videoSchema.index({ isPublished: 1, isFeatured: 1 });
videoSchema.index({ weeklyContent: 1, publishDate: -1 });
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for formatted duration
videoSchema.virtual('formattedDuration').get(function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for formatted file size
videoSchema.virtual('formattedFileSize').get(function() {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.fileSize === 0) return '0 Bytes';
  const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
  return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Static method to get videos by module and level
videoSchema.statics.getVideosByModuleAndLevel = async function(moduleId, level) {
  return await this.find({ 
    moduleId: moduleId, 
    level: level, 
    isPublished: true 
  }).sort({ uploadedAt: -1 });
};

// Static method to get weekly content
videoSchema.statics.getWeeklyContent = async function(level) {
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

// Static method to get featured videos
videoSchema.statics.getFeaturedVideos = async function(limit = 5) {
  return await this.find({ 
    isFeatured: true, 
    isPublished: true 
  })
    .sort({ uploadedAt: -1 })
    .populate('moduleId', 'title')
    .limit(limit);
};

// Static method to get video analytics
videoSchema.statics.getVideoAnalytics = async function() {
  const pipeline = [
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' },
        averageViews: { $avg: '$views' },
        averageLikes: { $avg: '$likes' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
    averageViews: 0,
    averageLikes: 0
  };
};

// Instance method to increment views
videoSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Instance method to toggle like
videoSchema.methods.toggleLike = async function() {
  this.likes += 1;
  await this.save();
};

// Pre-save middleware to validate module exists
videoSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('moduleId')) {
    const Module = mongoose.model('Module');
    const module = await Module.findById(this.moduleId);
    if (!module) {
      return next(new Error('Module not found'));
    }
  }
  next();
});

// Pre-remove middleware to clean up files
videoSchema.pre('remove', function(next) {
  const fs = require('fs');
  const path = require('path');
  
  // Delete video file
  if (this.videoUrl) {
    const videoPath = path.join(__dirname, '..', this.videoUrl);
    if (fs.existsSync(videoPath)) {
      fs.unlink(videoPath, (err) => {
        if (err) console.error('Error deleting video file:', err);
      });
    }
  }
  
  // Delete thumbnail
  if (this.thumbnail) {
    const thumbnailPath = path.join(__dirname, '..', this.thumbnail);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlink(thumbnailPath, (err) => {
        if (err) console.error('Error deleting thumbnail:', err);
      });
    }
  }
  
  next();
});

module.exports = mongoose.model('Video', videoSchema);



