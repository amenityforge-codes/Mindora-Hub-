const express = require('express');
const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const { authenticate: auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/certificates
// @desc    Get all certificates with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      studentId,
      examId,
      status,
      isActive = true,
      limit = 50,
      page = 1
    } = req.query;

    const filter = { isActive: isActive === 'true' || isActive === true };
    
    if (studentId) filter.student = studentId;
    if (examId) filter.exam = examId;
    if (status) filter.status = status;

    const certificates = await Certificate.find(filter)
      .populate('student', 'name email')
      .populate('exam', 'title category')
      .populate('examAttempt', 'score percentage')
      .sort({ issueDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Certificate.countDocuments(filter);

    res.json({
      success: true,
      data: {
        certificates,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching certificates',
      error: error.message
    });
  }
});

// @route   GET /api/certificates/:id
// @desc    Get a specific certificate
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'name email')
      .populate('exam', 'title category')
      .populate('examAttempt', 'score percentage');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      data: { certificate }
    });

  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching certificate',
      error: error.message
    });
  }
});

// @route   GET /api/certificates/verify/:certificateNumber
// @desc    Verify a certificate by certificate number
// @access  Public
router.get('/verify/:certificateNumber', async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.verifyCertificate(certificateNumber);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid'
      });
    }

    res.json({
      success: true,
      message: 'Certificate verified successfully',
      data: { certificate }
    });

  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying certificate',
      error: error.message
    });
  }
});

// @route   POST /api/certificates
// @desc    Create a new certificate (usually auto-generated)
// @access  Admin only
router.post('/', async (req, res) => {
  try {
    console.log('Certificate creation request body:', JSON.stringify(req.body, null, 2));
    
    const {
      studentId,
      examId,
      examAttemptId,
      studentName,
      examTitle,
      score,
      percentage,
      grade,
      template,
      backgroundColor,
      textColor,
      borderColor,
      logoUrl,
      signatureUrl,
      customFields,
      expiryDate
    } = req.body;

    // Validate required fields
    if (!studentId || !examId || !examAttemptId || !studentName || !examTitle || !score || !percentage) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, exam ID, attempt ID, student name, exam title, score, and percentage are required'
      });
    }

    // Check if certificate already exists for this attempt
    const existingCertificate = await Certificate.findOne({
      examAttempt: examAttemptId
    });

    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already exists for this exam attempt'
      });
    }

    const certificate = new Certificate({
      student: studentId,
      exam: examId,
      examAttempt: examAttemptId,
      studentName,
      examTitle,
      score: parseInt(score),
      percentage: parseInt(percentage),
      grade: grade || 'C',
      template: template || 'classic',
      backgroundColor: backgroundColor || '#ffffff',
      textColor: textColor || '#000000',
      borderColor: borderColor || '#000000',
      logoUrl: logoUrl || '',
      signatureUrl: signatureUrl || '',
      customFields: customFields || [],
      expiryDate: expiryDate ? new Date(expiryDate) : null
    });

    await certificate.save();

    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data: { certificate }
    });

  } catch (error) {
    console.error('Create certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating certificate',
      error: error.message
    });
  }
});

// @route   PUT /api/certificates/:id
// @desc    Update a certificate
// @access  Admin only
router.put('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      certificate[key] = updates[key];
    });

    await certificate.save();

    res.json({
      success: true,
      message: 'Certificate updated successfully',
      data: { certificate }
    });

  } catch (error) {
    console.error('Update certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating certificate',
      error: error.message
    });
  }
});

// @route   DELETE /api/certificates/:id
// @desc    Revoke a certificate
// @access  Admin only
router.delete('/:id', async (req, res) => {
  try {
    const { reason } = req.body;
    
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    await certificate.revoke(new mongoose.Types.ObjectId(), reason);

    res.json({
      success: true,
      message: 'Certificate revoked successfully'
    });

  } catch (error) {
    console.error('Revoke certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while revoking certificate',
      error: error.message
    });
  }
});

// @route   GET /api/certificates/student/:studentId
// @desc    Get certificates for a specific student
// @access  Public
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const certificates = await Certificate.getStudentCertificates(studentId);

    res.json({
      success: true,
      data: { certificates }
    });

  } catch (error) {
    console.error('Get student certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student certificates',
      error: error.message
    });
  }
});

// @route   GET /api/certificates/exam/:examId
// @desc    Get certificates for a specific exam
// @access  Public
router.get('/exam/:examId', async (req, res) => {
  try {
    const { examId } = req.params;

    const certificates = await Certificate.getExamCertificates(examId);

    res.json({
      success: true,
      data: { certificates }
    });

  } catch (error) {
    console.error('Get exam certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching exam certificates',
      error: error.message
    });
  }
});

// @route   POST /api/certificates/:id/download
// @desc    Track certificate download
// @access  Public
router.post('/:id/download', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    certificate.downloadCount += 1;
    certificate.lastDownloadedAt = new Date();
    await certificate.save();

    res.json({
      success: true,
      message: 'Download tracked successfully'
    });

  } catch (error) {
    console.error('Track download error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while tracking download',
      error: error.message
    });
  }
});

// @route   POST /api/certificates/:id/verify
// @desc    Verify a certificate
// @access  Admin only
router.post('/:id/verify', async (req, res) => {
  try {
    const { verifiedBy } = req.body;
    
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    await certificate.verify(verifiedBy || new mongoose.Types.ObjectId());

    res.json({
      success: true,
      message: 'Certificate verified successfully'
    });

  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying certificate',
      error: error.message
    });
  }
});

module.exports = router;

