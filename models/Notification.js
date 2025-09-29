const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.cohortId;
    }
  },
  cohortId: {
    type: String,
    required: function() {
      return !this.userId;
    }
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: [
      'new-content', 'reminder', 'achievement', 'quiz-due', 'assignment-due',
      'streak-reminder', 'weekly-digest', 'system', 'promotional', 'community'
    ]
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  payload: {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module'
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    url: String,
    action: String,
    data: mongoose.Schema.Types.Mixed
  },
  channels: {
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      fcmToken: String,
      error: String
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      email: String,
      error: String
    },
    inApp: {
      sent: { type: Boolean, default: true },
      sentAt: { type: Date, default: Date.now }
    }
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  sentAt: Date,
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  clicked: {
    type: Boolean,
    default: false
  },
  clickedAt: Date,
  dismissed: {
    type: Boolean,
    default: false
  },
  dismissedAt: Date,
  expiresAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  template: {
    id: String,
    variables: mongoose.Schema.Types.Mixed
  },
  analytics: {
    deliveryAttempts: { type: Number, default: 0 },
    deliverySuccess: { type: Number, default: 0 },
    openRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ cohortId: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ scheduledAt: 1 });
notificationSchema.index({ read: 1, userId: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for delivery status
notificationSchema.virtual('deliveryStatus').get(function() {
  const channels = this.channels;
  const sentChannels = [];
  
  if (channels.push.sent) sentChannels.push('push');
  if (channels.email.sent) sentChannels.push('email');
  if (channels.inApp.sent) sentChannels.push('inApp');
  
  return {
    sent: sentChannels,
    total: Object.keys(channels).length,
    success: sentChannels.length > 0
  };
});

// Virtual for engagement
notificationSchema.virtual('engagement').get(function() {
  return {
    read: this.read,
    clicked: this.clicked,
    dismissed: this.dismissed,
    engagementRate: this.clicked ? 1 : (this.read ? 0.5 : 0)
  };
});

// Pre-save middleware to set expiration
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Set default expiration based on type
    const expirationDays = {
      'new-content': 7,
      'reminder': 1,
      'achievement': 30,
      'quiz-due': 1,
      'assignment-due': 1,
      'streak-reminder': 1,
      'weekly-digest': 7,
      'system': 30,
      'promotional': 3,
      'community': 7
    };
    
    const days = expirationDays[this.type] || 7;
    this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as clicked
notificationSchema.methods.markAsClicked = function() {
  this.clicked = true;
  this.clickedAt = new Date();
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
  }
  return this.save();
};

// Method to dismiss
notificationSchema.methods.dismiss = function() {
  this.dismissed = true;
  this.dismissedAt = new Date();
  return this.save();
};

// Method to update delivery status
notificationSchema.methods.updateDeliveryStatus = function(channel, success, error = null) {
  this.analytics.deliveryAttempts += 1;
  
  if (success) {
    this.analytics.deliverySuccess += 1;
    this.channels[channel].sent = true;
    this.channels[channel].sentAt = new Date();
    this.channels[channel].error = null;
  } else {
    this.channels[channel].error = error;
  }
  
  if (!this.sentAt && (this.channels.push.sent || this.channels.email.sent || this.channels.inApp.sent)) {
    this.sentAt = new Date();
  }
  
  return this.save();
};

// Static method to create notification for user
notificationSchema.statics.createForUser = function(userId, notificationData) {
  return this.create({
    userId,
    ...notificationData
  });
};

// Static method to create notification for cohort
notificationSchema.statics.createForCohort = function(cohortId, notificationData) {
  return this.create({
    cohortId,
    ...notificationData
  });
};

// Static method to get unread notifications
notificationSchema.statics.getUnreadNotifications = function(userId, limit = 20) {
  return this.find({
    userId,
    read: false,
    dismissed: false,
    expiresAt: { $gt: new Date() }
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('payload.moduleId', 'title moduleType')
  .populate('payload.quizId', 'title');
};

// Static method to get notification analytics
notificationSchema.statics.getAnalytics = function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        total: { $sum: 1 },
        sent: { $sum: { $cond: [{ $ne: ['$sentAt', null] }, 1, 0] } },
        read: { $sum: { $cond: ['$read', 1, 0] } },
        clicked: { $sum: { $cond: ['$clicked', 1, 0] } },
        dismissed: { $sum: { $cond: ['$dismissed', 1, 0] } }
      }
    },
    {
      $addFields: {
        deliveryRate: { $divide: ['$sent', '$total'] },
        openRate: { $divide: ['$read', '$sent'] },
        clickRate: { $divide: ['$clicked', '$read'] },
        dismissalRate: { $divide: ['$dismissed', '$read'] }
      }
    }
  ]);
};

// Static method to send scheduled notifications
notificationSchema.statics.sendScheduledNotifications = function() {
  return this.find({
    scheduledAt: { $lte: new Date() },
    sentAt: null,
    expiresAt: { $gt: new Date() }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);

