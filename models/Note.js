const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required']
  },
  fileSize: {
    type: Number,
    default: 0
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
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
noteSchema.index({ topicId: 1 });
noteSchema.index({ moduleId: 1 });
noteSchema.index({ isActive: 1 });

// Virtual for formatted file size
noteSchema.virtual('formattedFileSize').get(function() {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.fileSize === 0) return '0 Bytes';
  const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
  return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Instance method to increment download count
noteSchema.methods.incrementDownload = async function() {
  this.downloadCount += 1;
  await this.save();
};

module.exports = mongoose.model('Note', noteSchema);


