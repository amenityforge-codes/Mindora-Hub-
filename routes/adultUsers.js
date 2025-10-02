const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/adult-users
// @desc    Get all adult users
// @access  Private (Admin only)
router.get('/', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT USERS API CALLED ===');
    
    const { role, isActive, limit, page } = req.query;
    const filter = {
      ageRange: '16+', // Force adult age range
      role: { $ne: 'admin' } // Exclude admin users
    };
    
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    
    console.log('Adult Users filter:', filter);
    console.log('Pagination:', { page: pageNum, limit: limitNum, skip });
    
    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password') // Exclude password field
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter)
    ]);
    
    console.log(`Found ${users.length} adult users out of ${totalCount} total`);
    
    res.json({
      success: true,
      message: 'Adult users retrieved successfully',
      data: {
        users,
        totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
    
  } catch (error) {
    console.error('Error fetching adult users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult users',
      error: error.message
    });
  }
});

// @route   POST /api/adult-users
// @desc    Create a new adult user
// @access  Private (Admin only)
router.post('/', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT USER CREATION ===');
    console.log('Request body:', req.body);
    
    const {
      name,
      email,
      password,
      role,
      isActive,
      preferences,
      profile
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new adult user
    const newUser = new User({
      name,
      email,
      password,
      role: role || 'student',
      ageRange: '16+', // Force adult age range
      isActive: isActive !== false,
      preferences: preferences || {},
      profile: profile || {},
      createdBy: req.userId // From auth middleware
    });

    await newUser.save();
    
    // Remove password from response
    const userResponse = { ...newUser.toObject() };
    delete userResponse.password;
    
    console.log('✅ Adult user created:', newUser.name);
    
    res.status(201).json({
      success: true,
      message: 'Adult user created successfully',
      data: userResponse
    });
    
  } catch (error) {
    console.error('❌ Error creating adult user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating adult user',
      error: error.message
    });
  }
});

// @route   PUT /api/adult-users/:id
// @desc    Update an adult user
// @access  Private (Admin only)
router.put('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT USER UPDATE ===');
    console.log('User ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const user = await User.findOne({
      _id: req.params.id,
      ageRange: '16+', // Ensure it's an adult user
      role: { $ne: 'admin' } // Don't allow updating admin users
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Adult user not found'
      });
    }

    // Update fields (exclude password and sensitive fields)
    const allowedFields = ['name', 'email', 'role', 'isActive', 'preferences', 'profile'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();
    
    // Remove password from response
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    console.log('✅ Adult user updated:', user.name);
    
    res.json({
      success: true,
      message: 'Adult user updated successfully',
      data: userResponse
    });
    
  } catch (error) {
    console.error('❌ Error updating adult user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating adult user',
      error: error.message
    });
  }
});

// @route   DELETE /api/adult-users/:id
// @desc    Delete an adult user
// @access  Private (Admin only)
router.delete('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT USER DELETION ===');
    console.log('User ID:', req.params.id);
    
    const user = await User.findOne({
      _id: req.params.id,
      ageRange: '16+', // Ensure it's an adult user
      role: { $ne: 'admin' } // Don't allow deleting admin users
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Adult user not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);
    
    console.log('✅ Adult user deleted:', user.name);
    
    res.json({
      success: true,
      message: 'Adult user deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting adult user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting adult user',
      error: error.message
    });
  }
});

module.exports = router;
