const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [2000, 'Question text cannot exceed 2000 characters']
  },
  questionType: {
    type: String,
    enum: ['multiple_choice', 'multiple_select', 'integer', 'text'],
    required: [true, 'Question type is required']
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Option text cannot exceed 500 characters']
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  correctAnswer: {
    // For integer and text questions
    type: mongoose.Schema.Types.Mixed,
    required: function() {
      return ['integer', 'text'].includes(this.questionType);
    }
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: [1, 'Marks must be at least 1'],
    default: 1
  },
  negativeMarks: {
    type: Number,
    default: 0,
    min: [0, 'Negative marks cannot be negative']
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: [2000, 'Explanation cannot exceed 2000 characters']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // For image attachments
  imageUrl: {
    type: String,
    trim: true
  },
  // For code snippets or special formatting
  codeSnippet: {
    type: String,
    trim: true,
    maxlength: [2000, 'Code snippet cannot exceed 2000 characters']
  },
  language: {
    type: String,
    trim: true,
    maxlength: [50, 'Language cannot exceed 50 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
questionSchema.index({ questionType: 1, difficulty: 1 });
questionSchema.index({ category: 1 });
questionSchema.index({ isActive: 1 });
questionSchema.index({ createdBy: 1 });
questionSchema.index({ tags: 1 });

// Virtual for correct options (for multiple choice/select)
questionSchema.virtual('correctOptions').get(function() {
  if (['multiple_choice', 'multiple_select'].includes(this.questionType)) {
    return this.options.filter(option => option.isCorrect);
  }
  return [];
});

// Method to check if answer is correct
questionSchema.methods.checkAnswer = function(userAnswer) {
  switch (this.questionType) {
    case 'multiple_choice':
      // For single choice, userAnswer should be the index of selected option
      if (typeof userAnswer === 'number' && userAnswer >= 0 && userAnswer < this.options.length) {
        return this.options[userAnswer].isCorrect;
      }
      return false;
      
    case 'multiple_select':
      // For multiple select, userAnswer should be array of selected indices
      if (Array.isArray(userAnswer)) {
        const correctIndices = this.options
          .map((option, index) => option.isCorrect ? index : null)
          .filter(index => index !== null);
        return JSON.stringify(userAnswer.sort()) === JSON.stringify(correctIndices.sort());
      }
      return false;
      
    case 'integer':
      return parseInt(userAnswer) === parseInt(this.correctAnswer);
      
    case 'text':
      // For text answers, do case-insensitive comparison
      return userAnswer.toString().toLowerCase().trim() === this.correctAnswer.toString().toLowerCase().trim();
      
    default:
      return false;
  }
};

// Method to calculate score for an answer
questionSchema.methods.calculateScore = function(userAnswer) {
  const isCorrect = this.checkAnswer(userAnswer);
  if (isCorrect) {
    return this.marks;
  } else if (this.negativeMarks > 0) {
    return -this.negativeMarks;
  }
  return 0;
};

// Static method to get questions by difficulty
questionSchema.statics.getByDifficulty = function(difficulty, limit = 50) {
  return this.find({ 
    difficulty: difficulty, 
    isActive: true 
  }).limit(limit);
};

// Static method to get questions by category
questionSchema.statics.getByCategory = function(category, limit = 50) {
  return this.find({ 
    category: category, 
    isActive: true 
  }).limit(limit);
};

// Static method to get random questions
questionSchema.statics.getRandomQuestions = function(count, filters = {}) {
  const query = { isActive: true, ...filters };
  return this.aggregate([
    { $match: query },
    { $sample: { size: count } }
  ]);
};

module.exports = mongoose.model('Question', questionSchema);

