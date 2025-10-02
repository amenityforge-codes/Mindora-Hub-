const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contentRoutes = require('./routes/content');
const progressRoutes = require('./routes/progress');
const quizRoutes = require('./routes/quiz');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const videoRoutes = require('./routes/video');
const leaderboardRoutes = require('./routes/leaderboard');
const lessonRoutes = require('./routes/lessons');
const achievementRoutes = require('./routes/achievements');
const examRoutes = require('./routes/exams');
const questionRoutes = require('./routes/questions');
const certificateRoutes = require('./routes/certificates');
const moduleRoutes = require('./routes/modules');
const categoryModuleRoutes = require('./routes/categoryModules');
const adultModuleRoutes = require('./routes/adultModules');
const childrenModuleRoutes = require('./routes/childrenModules');
const adultAdminRoutes = require('./routes/adultAdmin');
const adultAchievementRoutes = require('./routes/adultAchievements');
const adultExamRoutes = require('./routes/adultExams');
const adultLessonRoutes = require('./routes/adultLessons');
const adultCertificateRoutes = require('./routes/adultCertificates');
const adultUserRoutes = require('./routes/adultUsers');
const adultContentRoutes = require('./routes/adultContent');
const adultVideoRoutes = require('./routes/adultVideos');
const adultAdminContentRoutes = require('./routes/adultAdminContent');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting - More permissive for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration - More permissive for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/english-learning-platform';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.log('⚠️  Server will continue without database connection');
  console.log('💡 To fix this, install MongoDB or set MONGO_URI environment variable');
  console.log('💡 Some features may not work without database connection');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/category-modules', categoryModuleRoutes);
app.use('/api/adult-modules', adultModuleRoutes);
app.use('/api/children-modules', childrenModuleRoutes);
app.use('/api/adult-admin', adultAdminRoutes);
app.use('/api/adult-achievements', adultAchievementRoutes);
app.use('/api/adult-exams', adultExamRoutes);
app.use('/api/adult-lessons', adultLessonRoutes);
app.use('/api/adult-certificates', adultCertificateRoutes);
app.use('/api/adult-users', adultUserRoutes);
app.use('/api/adult-content', adultContentRoutes);
app.use('/api/adult-videos', adultVideoRoutes);
app.use('/api/adult-admin-content', adultAdminContentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'OK',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Network access: http://172.20.10.4:${PORT}/api/health`);
});

module.exports = app;
