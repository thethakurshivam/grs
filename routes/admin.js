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

// COPYING ALL ADMIN ROUTES WITH EXACT LOGIC FROM admin_routes/api.js

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
        umbrellaLabel: claim.umbrellaKey ? claim.umbrellaKey.replace(/_/g, ' ') : 'Unknown', // Guard when missing
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

// Get count of declined requests for Admin - EXACT COPY
router.get('/admin/declined-requests/count', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Admin requesting declined requests count...');
    
    // Count admin declined requests
    const declinedCount = await PendingCredits.countDocuments({ 
      status: 'admin_declined'
    });
    
    console.log(`📊 Found ${declinedCount} admin declined requests`);
    
    res.json({
      success: true,
      message: 'Admin declined requests count retrieved successfully',
      data: {
        count: declinedCount
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching admin declined requests count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin declined requests count',
      error: error.message
    });
  }
});

// Route to get all fields as links - EXACT COPY
router.get('/fields', authenticateToken, asyncHandler(async (req, res) => {
  const allFields = await Field.find();
  
  // Transform fields into link format for frontend with actual course counts
  const fieldLinks = await Promise.all(allFields.map(async (field) => {
    // Count actual courses for this field
    const courseCount = await Course.countDocuments({ field: field._id });
    
    return {
      id: field._id,
      _id: field._id, // Include both for compatibility
      name: field.name,
      count: courseCount, // Use actual course count instead of field.count
      link: `/api/fields/${field._id}` // Link that will hit another route when clicked
    };
  }));

  res.json({
    success: true,
    count: fieldLinks.length,
    data: fieldLinks
  });
}));

// Route to get courses by completion status - EXACT COPY
router.get('/courses/:status', authenticateToken, asyncHandler(async (req, res) => {
  const { status } = req.params;

  try {
    console.log('Fetching courses with status:', status);
    
    const courses = await Course.find({ completionStatus: status }).populate('field', 'name description');
    
    console.log('Found courses:', courses.length);
    console.log('Sample course:', courses[0]);
    
    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses by status:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching courses: ' + error.message
    });
  }
}));

// Get all certificate course mappings - EXACT COPY
router.get('/certificate-course-mappings', authenticateToken, asyncHandler(async (req, res) => {
  try {
    console.log('🚀 Admin route /certificate-course-mappings called');
    
    // Get query parameters for filtering
    const { 
      studentId, 
      umbrellaKey, 
      qualification, 
      certificateId,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (umbrellaKey) filter.umbrellaKey = umbrellaKey;
    if (qualification) filter.qualification = qualification;
    if (certificateId) filter.certificateId = certificateId;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const totalCount = await CertificateCourseMapping.countDocuments(filter);
    
    // Fetch mappings with pagination and sorting
    const mappings = await CertificateCourseMapping.find(filter)
      .populate('certificateId', 'certificateNo')
      .populate('studentId', 'Name email State Umbrella') // Populate actual student fields
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Enhance the response with calculated fields
    const enhancedMappings = mappings.map(mapping => {
      const totalCreditsUsed = mapping.courses.reduce((sum, course) => sum + course.creditsUsed, 0);
      const remainingCredits = Math.max(0, mapping.totalCreditsRequired - totalCreditsUsed);
      const creditEfficiency = mapping.totalCreditsRequired > 0 
        ? Math.round((totalCreditsUsed / mapping.totalCreditsRequired) * 100) 
        : 0;

      return {
        ...mapping,
        totalCreditsUsed,
        remainingCredits,
        creditEfficiency,
        courseCount: mapping.courses.length
      };
    });

    console.log(`📋 Admin retrieved ${enhancedMappings.length} certificate course mappings`);
    console.log(`💡 Total mappings in database: ${totalCount}`);
    
    res.json({ 
      success: true, 
      count: enhancedMappings.length,
      totalCount,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      data: enhancedMappings 
    });

  } catch (error) {
    console.error('❌ Error fetching certificate course mappings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching certificate course mappings',
      details: error.message 
    });
  }
}));

module.exports = router;
