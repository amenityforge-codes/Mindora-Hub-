const express = require('express');
const Certificate = require('../models/Certificate');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/adult-certificates
// @desc    Get all adult certificates
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('=== ADULT CERTIFICATES API CALLED ===');
    
    const { category, type, isActive } = req.query;
    const filter = {
      ageRange: '16+', // Force adult age range
      isActive: isActive !== 'false' // Default to active certificates
    };
    
    if (category) filter.category = category;
    if (type) filter.type = type;
    
    console.log('Adult Certificates filter:', filter);
    
    const certificates = await Certificate.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${certificates.length} adult certificates`);
    
    res.json({
      success: true,
      message: 'Adult certificates retrieved successfully',
      data: { certificates }
    });
    
  } catch (error) {
    console.error('Error fetching adult certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adult certificates',
      error: error.message
    });
  }
});

// @route   POST /api/adult-certificates
// @desc    Create a new adult certificate
// @access  Private (Admin only)
router.post('/', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT CERTIFICATE CREATION ===');
    console.log('Request body:', req.body);
    
    const {
      name,
      description,
      category,
      type,
      requirements,
      validityPeriod,
      isActive,
      tags
    } = req.body;

    // Validate required fields
    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and category are required'
      });
    }

    // Create new adult certificate
    const newCertificate = new Certificate({
      name,
      description,
      category,
      type: type || 'completion',
      requirements: requirements || [],
      validityPeriod: validityPeriod || 365, // days
      ageRange: '16+', // Force adult age range
      isActive: isActive !== false,
      tags: tags || [],
      createdBy: req.userId // From auth middleware
    });

    await newCertificate.save();
    
    console.log('✅ Adult certificate created:', newCertificate.name);
    
    res.status(201).json({
      success: true,
      message: 'Adult certificate created successfully',
      data: newCertificate
    });
    
  } catch (error) {
    console.error('❌ Error creating adult certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating adult certificate',
      error: error.message
    });
  }
});

// @route   PUT /api/adult-certificates/:id
// @desc    Update an adult certificate
// @access  Private (Admin only)
router.put('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT CERTIFICATE UPDATE ===');
    console.log('Certificate ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      ageRange: '16+', // Ensure it's an adult certificate
      createdBy: req.userId // Ensure user owns the certificate
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Adult certificate not found or you do not have permission to modify it'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        certificate[key] = req.body[key];
      }
    });

    await certificate.save();
    
    console.log('✅ Adult certificate updated:', certificate.name);
    
    res.json({
      success: true,
      message: 'Adult certificate updated successfully',
      data: certificate
    });
    
  } catch (error) {
    console.error('❌ Error updating adult certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating adult certificate',
      error: error.message
    });
  }
});

// @route   DELETE /api/adult-certificates/:id
// @desc    Delete an adult certificate
// @access  Private (Admin only)
router.delete('/:id', auth.authenticate, async (req, res) => {
  try {
    console.log('=== ADULT CERTIFICATE DELETION ===');
    console.log('Certificate ID:', req.params.id);
    
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      ageRange: '16+', // Ensure it's an adult certificate
      createdBy: req.userId // Ensure user owns the certificate
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Adult certificate not found or you do not have permission to delete it'
      });
    }

    await Certificate.findByIdAndDelete(req.params.id);
    
    console.log('✅ Adult certificate deleted:', certificate.name);
    
    res.json({
      success: true,
      message: 'Adult certificate deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting adult certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting adult certificate',
      error: error.message
    });
  }
});

module.exports = router;
