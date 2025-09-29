const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'professional', 'teacher'],
    default: 'student'
  },
  ageRange: {
    type: String,
    enum: ['6-15', '16+', 'business'],
    required: function() {
      return this.role === 'student' || this.role === 'professional';
    }
  },
  profile: {
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    phone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
    },
    location: {
      city: String,
      state: String,
      country: { type: String, default: 'India' }
    },
    interests: [{
      type: String,
      enum: ['communication', 'ai', 'finance', 'soft-skills', 'brainstorming', 'math', 'grammar', 'vocabulary', 'speaking', 'writing']
    }]
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true }
    },
    language: {
      primary: { type: String, default: 'en' },
      secondary: { type: String, default: 'hi' }
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    }
  },
  progress: {
    totalModulesCompleted: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 }, // in minutes
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now },
    level: { type: String, default: 'beginner' },
    points: { type: Number, default: 0 },
    badges: [{
      name: String,
      earnedAt: { type: Date, default: Date.now },
      description: String
    }]
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium', 'business'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ ageRange: 1 });
userSchema.index({ 'progress.lastActivity': -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

// Method to add badge
userSchema.methods.addBadge = function(badgeName, description) {
  const existingBadge = this.progress.badges.find(badge => badge.name === badgeName);
  if (!existingBadge) {
    this.progress.badges.push({
      name: badgeName,
      description: description,
      earnedAt: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to update progress
userSchema.methods.updateProgress = function(moduleId, timeSpent, score) {
  this.progress.totalTimeSpent += timeSpent;
  this.progress.lastActivity = new Date();
  
  if (score >= 80) {
    this.progress.points += 10;
  }
  
  return this.save();
};

// Static method to get user stats
userSchema.statics.getUserStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        avgTimeSpent: { $avg: '$progress.totalTimeSpent' },
        avgStreak: { $avg: '$progress.currentStreak' }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);

