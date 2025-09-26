const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Import all models - EXACT same as admin_routes/api.js
const Admin = require('../models/admin');
const Course = require('../models/courses');
const MOU = require('../models/MOU');
const School = require('../models/school');
const Field = require('../models/fields');
const Student = require('../models1/student');
const POC = require('../models2/poc');
const PendingCredits = require('../model3/pendingcredits');
const BprndClaim = require('../model3/bprnd_certification_claim');
const CertificateCourseMapping = require('../model3/certificate_course_mapping');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function for input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Middleware functions - EXACT same as admin_routes/api.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'Admin API',
    message: 'Admin routes are healthy',
    timestamp: new Date().toISOString()
  });
});

// Login route - No authentication required - EXACT COPY
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  // Sanitize inputs
  const sanitizedEmail = sanitizeInput(email);

  // Find admin by email
  const admin = await Admin.findOne({ email: sanitizedEmail.toLowerCase() });
  if (!admin) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      adminId: admin._id, 
      email: admin.email,
      name: admin.name 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    message: 'Login successful',
    token: token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email
    }
  });
}));

// Test database connection
router.get('/test-db', asyncHandler(async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      adminCount: adminCount 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
    });
  }
}));

// Route to get all pending credits that need approval (for admin) - EXACT COPY
router.get('/pending-credits', authenticateToken, asyncHandler(async (req, res) => {
  try {
    console.log('🔍 Admin requesting pending credits for approval...');
    
    // Find all pending credits (no filtering - let frontend handle it)
    const pendingCredits = await PendingCredits.find({})
    .populate('studentId', 'Name email Designation State') // Populate student details
    .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log(`📊 Found ${pendingCredits.length} pending credits in database`);

    // Add approve and decline links to each pending credit document
    const pendingCreditsWithLinks = pendingCredits.map(pendingCredit => {
      const pendingCreditData = pendingCredit.toObject();
      return {
        // All document data
        _id: pendingCreditData._id,
        studentId: pendingCreditData.studentId,
        name: pendingCreditData.name,
        organization: pendingCreditData.organization,
        discipline: pendingCreditData.discipline,
        theoryHours: pendingCreditData.theoryHours,
        practicalHours: pendingCreditData.practicalHours,
        theoryCredits: pendingCreditData.theoryCredits,
        practicalCredits: pendingCreditData.practicalCredits,
        totalHours: pendingCreditData.totalHours,
        calculatedCredits: pendingCreditData.calculatedCredits,
        noOfDays: pendingCreditData.noOfDays,
        pdf: path.basename(pendingCreditData.pdf),
        admin_approved: pendingCreditData.admin_approved,
        bprnd_poc_approved: pendingCreditData.bprnd_poc_approved,
        status: pendingCreditData.status,
        createdAt: pendingCreditData.createdAt,
        updatedAt: pendingCreditData.updatedAt,
        // Action links
        approveLink: `/pending-credits/${pendingCredit._id}/approve`,
        declineLink: `/pending-credits/${pendingCredit._id}/decline`
      };
    });

    res.json({
      success: true,
      message: 'Pending credits retrieved successfully',
      count: pendingCreditsWithLinks.length,
      data: pendingCreditsWithLinks
    });
    
    console.log(`📋 Admin can see ${pendingCreditsWithLinks.length} pending credits that need approval`);
    console.log(`💡 These credits have been approved by POC and are now waiting for admin approval`);

  } catch (error) {
    console.error('Error fetching pending credits:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching pending credits: ' + error.message
    });
  }
}));

// List all BPR&D certification claims (basic listing) - EXACT COPY
router.get('/bprnd/claims', authenticateToken, asyncHandler(async (req, res) => {
  console.log('🚀 Admin route /bprnd/claims called');
  const { status } = req.query;
  console.log('📝 Query parameters:', { status });
  
  // If specific status requested, use it; otherwise show all claims (no filtering - let frontend handle it)
  const filter = status ? { status } : {};
  console.log('🔍 Filter applied:', filter);
  
  try {
    const claims = await BprndClaim.find(filter).sort({ createdAt: -1 }).lean();
    console.log(`📊 Found ${claims.length} claims in database`);
    
    // Log each claim's basic info
    claims.forEach((claim, index) => {
      console.log(`📋 Claim ${index + 1}:`, {
        id: claim._id,
        umbrella: claim.umbrellaKey,
        status: claim.status,
        hasCourses: !!claim.courses,
        coursesCount: claim.courses ? claim.courses.length : 0
      });
    });
    
    // Enhance claims with student details and course information
    const enhancedClaims = claims.map(claim => {
      console.log(`🔍 Processing claim ${claim._id}:`, {
        hasCourses: !!claim.courses,
        coursesLength: claim.courses ? claim.courses.length : 0,
        coursesData: claim.courses,
        umbrellaKey: claim.umbrellaKey,
        status: claim.status
      });
      
      return {
        ...claim,
        umbrellaLabel: claim.umbrellaKey.replace(/_/g, ' '), // Convert back to readable format
        courseCount: claim.courses ? claim.courses.length : 0,
        totalCreditsFromCourses: claim.courses ? claim.courses.reduce((sum, course) => sum + course.creditsEarned, 0) : 0,
        courses: claim.courses || [] // Include full course details
      };
    });
    
    console.log(`📋 Admin can see ${enhancedClaims.length} BPRND certification claims`);
    console.log(`💡 Each claim includes detailed course breakdown for transparency`);
    
    res.json({ 
      success: true, 
      count: enhancedClaims.length,
      data: enhancedClaims 
    });
  } catch (error) {
    console.error('❌ Error in admin route:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}));

module.exports = router;
