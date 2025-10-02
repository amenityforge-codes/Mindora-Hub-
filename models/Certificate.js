const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  examAttempt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamAttempt',
    required: true
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Student name cannot exceed 200 characters']
  },
  examTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: [300, 'Exam title cannot exceed 300 characters']
  },
  score: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    required: true
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  // Certificate template and design
  template: {
    type: String,
    enum: ['classic', 'modern', 'professional', 'creative'],
    default: 'classic'
  },
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  textColor: {
    type: String,
    default: '#000000'
  },
  borderColor: {
    type: String,
    default: '#000000'
  },
  logoUrl: {
    type: String,
    trim: true
  },
  signatureUrl: {
    type: String,
    trim: true
  },
  // Generated certificate file
  certificateFile: {
    url: {
      type: String,
      trim: true
    },
    filename: {
      type: String,
      trim: true
    },
    fileSize: {
      type: Number
    },
    mimeType: {
      type: String,
      default: 'application/pdf'
    }
  },
  // QR code for verification
  qrCode: {
    url: {
      type: String,
      trim: true
    },
    data: {
      type: String,
      trim: true
    }
  },
  // Custom fields for certificate
  customFields: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  }],
  // Certificate status
  status: {
    type: String,
    enum: ['generated', 'sent', 'downloaded', 'expired', 'revoked'],
    default: 'generated'
  },
  // Email notifications
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloadedAt: {
    type: Date
  },
  // Revocation details
  revokedAt: {
    type: Date
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  revocationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Revocation reason cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
certificateSchema.index({ student: 1 });
certificateSchema.index({ exam: 1 });
certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ issueDate: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ isActive: 1 });

// Virtual for certificate validity
certificateSchema.virtual('isValid').get(function() {
  if (!this.isActive) return false;
  if (this.status === 'revoked') return false;
  if (this.expiryDate && new Date() > this.expiryDate) return false;
  return true;
});

// Virtual for days until expiry
certificateSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  const now = new Date();
  const diffTime = this.expiryDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to generate certificate number
certificateSchema.statics.generateCertificateNumber = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `CERT-${timestamp}-${random}`.toUpperCase();
};

// Method to calculate grade based on percentage
certificateSchema.methods.calculateGrade = function() {
  if (this.percentage >= 95) return 'A+';
  if (this.percentage >= 90) return 'A';
  if (this.percentage >= 85) return 'B+';
  if (this.percentage >= 80) return 'B';
  if (this.percentage >= 75) return 'C+';
  if (this.percentage >= 70) return 'C';
  if (this.percentage >= 60) return 'D';
  return 'F';
};

// Method to revoke certificate
certificateSchema.methods.revoke = function(revokedBy, reason) {
  this.isActive = false;
  this.status = 'revoked';
  this.revokedAt = new Date();
  this.revokedBy = revokedBy;
  this.revocationReason = reason;
  return this.save();
};

// Method to verify certificate
certificateSchema.methods.verify = function(verifiedBy) {
  this.isVerified = true;
  this.verifiedBy = verifiedBy;
  this.verifiedAt = new Date();
  return this.save();
};

// Static method to get student certificates
certificateSchema.statics.getStudentCertificates = function(studentId) {
  return this.find({ 
    student: studentId, 
    isActive: true,
    status: { $ne: 'revoked' }
  })
  .populate('exam', 'title category')
  .sort({ issueDate: -1 });
};

// Static method to get exam certificates
certificateSchema.statics.getExamCertificates = function(examId) {
  return this.find({ 
    exam: examId, 
    isActive: true,
    status: { $ne: 'revoked' }
  })
  .populate('student', 'name email')
  .sort({ issueDate: -1 });
};

// Static method to verify certificate by number
certificateSchema.statics.verifyCertificate = function(certificateNumber) {
  return this.findOne({ 
    certificateNumber: certificateNumber,
    isActive: true,
    status: { $ne: 'revoked' }
  })
  .populate('student', 'name email')
  .populate('exam', 'title category')
  .populate('examAttempt', 'score percentage');
};

// Pre-save middleware to generate certificate number
certificateSchema.pre('save', function(next) {
  if (this.isNew && !this.certificateNumber) {
    this.certificateNumber = this.constructor.generateCertificateNumber();
  }
  
  // Calculate grade if not set
  if (!this.grade && this.percentage !== undefined) {
    this.grade = this.calculateGrade();
  }
  
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);

