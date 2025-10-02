const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const mongoose = require('mongoose');

// Import models to ensure they are registered
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');

// GET /api/leaderboard - Get leaderboard with user rankings
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('🏆 Main Leaderboard API called');
    console.log('🏆 User making request:', req.user?.name, req.user?._id);
    
    // Models are already imported at the top
    
    // First get all users
    const allUsers = await User.find({}, '_id name email profilePicture').lean();
    
    // Get quiz attempt data - latest attempt for each topic per user
    const quizData = await QuizAttempt.aggregate([
      {
        // Sort by userId, quizId, and attemptNumber to get latest attempts
        $sort: { userId: 1, quizId: 1, attemptNumber: -1 }
      },
      {
        // Group by userId and quizId to get the latest attempt for each topic
        $group: {
          _id: { userId: '$userId', quizId: '$quizId' },
          latestAttempt: { $first: '$$ROOT' }
        }
      },
      {
        // Group by userId to sum points from latest attempts only
        $group: {
          _id: '$latestAttempt.userId',
          totalPoints: { $sum: '$latestAttempt.pointsEarned' },
          totalTopics: { $sum: 1 },
          lastActivity: { $max: '$latestAttempt.createdAt' }
        }
      }
    ]);
    
    // Create a map of userId to quiz data
    const quizDataMap = {};
    quizData.forEach(data => {
      quizDataMap[data._id.toString()] = data;
    });
    
    // Combine user data with quiz data
    const leaderboard = allUsers.map(user => {
      const quizInfo = quizDataMap[user._id.toString()] || {
        totalPoints: 0,
        totalTopics: 0,
        lastActivity: user.createdAt || new Date()
      };
      
      return {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || '',
        totalPoints: quizInfo.totalPoints,
        totalTopics: quizInfo.totalTopics,
        lastActivity: quizInfo.lastActivity
      };
    });
    
    // Sort by total points (descending), then by last activity (descending)
    leaderboard.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return new Date(b.lastActivity) - new Date(a.lastActivity);
    });
    
    // Limit to top 50 users
    const limitedLeaderboard = leaderboard.slice(0, 50);

    // Add rank to each user
    const rankedLeaderboard = limitedLeaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    console.log('🏆 Leaderboard data:', rankedLeaderboard.length, 'users');
    console.log('🏆 Sample leaderboard data:', rankedLeaderboard.slice(0, 3));

    res.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        totalUsers: rankedLeaderboard.length
      }
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaderboard',
      error: error.message
    });
  }
});

// GET /api/leaderboard/user/:userId - Get specific user's rank and stats
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    console.log('🏆 User rank API called for userId:', req.params.userId);
    console.log('🏆 Authenticated user:', req.user?.name, req.user?._id);
    const { userId } = req.params;
    
    // Models are already imported at the top
    const userStats = await QuizAttempt.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) }
      },
      {
        // Sort by quizId and attemptNumber to get latest attempts
        $sort: { quizId: 1, attemptNumber: -1 }
      },
      {
        // Group by quizId to get the latest attempt for each topic
        $group: {
          _id: '$quizId',
          latestAttempt: { $first: '$$ROOT' }
        }
      },
      {
        // Group by userId to sum points from latest attempts only
        $group: {
          _id: '$latestAttempt.userId',
          totalPoints: { $sum: '$latestAttempt.pointsEarned' },
          totalTopics: { $sum: 1 },
          lastActivity: { $max: '$latestAttempt.createdAt' }
        }
      }
    ]);

    if (userStats.length === 0) {
      return res.json({
        success: true,
        data: {
          userStats: null,
          rank: null
        }
      });
    }

    const userTotalPoints = userStats[0].totalPoints;

    // Get user's rank by counting users with more points - using latest attempt for each topic
    const rankResult = await QuizAttempt.aggregate([
      {
        // Sort by userId, quizId, and attemptNumber to get latest attempts
        $sort: { userId: 1, quizId: 1, attemptNumber: -1 }
      },
      {
        // Group by userId and quizId to get the latest attempt for each topic
        $group: {
          _id: { userId: '$userId', quizId: '$quizId' },
          latestAttempt: { $first: '$$ROOT' }
        }
      },
      {
        // Group by userId to sum points from latest attempts only
        $group: {
          _id: '$latestAttempt.userId',
          totalPoints: { $sum: '$latestAttempt.pointsEarned' }
        }
      },
      {
        $match: { totalPoints: { $gt: userTotalPoints } }
      },
      {
        $count: 'count'
      }
    ]);

    const rank = (rankResult[0]?.count || 0) + 1;

    res.json({
      success: true,
      data: {
        userStats: userStats[0],
        rank: rank
      }
    });

  } catch (error) {
    console.error('User leaderboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user stats',
      error: error.message
    });
  }
});

module.exports = router;
