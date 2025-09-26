const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('WARNING: JWT_SECRET environment variable is not set. Please set it for security.');
}

// Import models
const MOU = require('../models/MOU');
const Course = require('../models/courses');
const School = require('../models/school');
const Field = require('../models/fields');
const Admin = require('../models/admin');
const PendingAdmin = require('../models/pendingAdmin');
const Candidate = require('../models1/student');
const Student = require('../models1/student');
const PendingCredits = require('../model3/pendingcredits');
const bprndStudents = require('../model3/bprndstudents');
const bprnd_certification_claim = require('../model3/bprnd_certification_claim');
const CertificateCourseMapping = require('../model3/certificate_course_mapping');
const CourseHistory = require('../model3/course_history');
const umbrella = require('../model3/umbrella');
const BprndCertificate = require('../model3/bprnd_certificate');

// Input sanitization helper
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token is required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = decoded;
    next();
  });
};

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Health check for admin routes
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'Admin API',
    message: 'Admin routes are healthy',
    timestamp: new Date().toISOString()
  });
});

// Admin Login Route
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



// ROUTE: Get count of declined requests for Admin - EXACT COPY
router.get('/declined-requests/count', authenticateToken, async (req, res) => {
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

// ROUTE: Get all fields as links - EXACT COPY
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

// ROUTE: Get courses by completion status - EXACT COPY
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


// ROUTE: Get all pending credits that need approval (for admin) - EXACT COPY
router.get('/pending-credits', authenticateToken, asyncHandler(async (req, res) => {
  try {
    console.log('🔍 Admin requesting pending credits for approval...');
    
    // Find only credits that are POC-approved and ready for admin approval
    const pendingCredits = await PendingCredits.find({
      bprnd_poc_approved: true,  // Must be approved by POC
      admin_approved: false,     // Not yet approved by admin
      status: { $nin: ['admin_declined', 'poc_declined'] } // Not declined by anyone
    })
    .populate('studentId', 'Name email Designation State') // Populate student details
    .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log(`📊 Found ${pendingCredits.length} pending credits ready for admin approval`);

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

// ROUTE: List all BPR&D certification claims - EXACT COPY
router.get('/bprnd/claims', authenticateToken, asyncHandler(async (req, res) => {
  console.log('🚀 Admin route /bprnd/claims called');
  const { status } = req.query;
  console.log('📝 Query parameters:', { status });
  
  // If specific status requested, use it; otherwise show all claims (no filtering - let frontend handle it)
  const filter = status ? { status } : {};
  console.log('🔍 Filter applied:', filter);
  
  try {
    const claims = await bprnd_certification_claim.find(filter).sort({ createdAt: -1 }).lean();
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


// Route to get all schools with their information and links - EXACT COPY
router.get('/schools', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const schools = await School.find();
    
    // Transform schools into format with links for frontend
    const schoolsWithLinks = schools.map(school => ({
      _id: school._id,
      id: school._id,
      name: school.name,
      count: school.count,
      link: `/api/schools/${encodeURIComponent(school.name)}`
    }));

    res.json({
      success: true,
      count: schoolsWithLinks.length,
      data: schoolsWithLinks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching schools: ' + error.message
    });
  }
}));

// Route to get MOUs by school name - EXACT COPY
router.get('/schools/:schoolName', authenticateToken, asyncHandler(async (req, res) => {
  const schoolName = decodeURIComponent(sanitizeInput(req.params.schoolName));
  
  if (!schoolName) {
    return res.status(400).json({
      success: false,
      error: 'School name is required'
    });
  }
  
  // First find the school to get its information
  const school = await School.findOne({ name: schoolName });
  if (!school) {
    return res.status(404).json({
      success: false,
      error: 'School not found'
    });
  }
  
  // Find all MOUs that belong to this school using the school's ObjectId
  const schoolMOUs = await MOU.find({ school: school._id });
  
  res.json({
    success: true,
    school: school,
    count: schoolMOUs.length,
    data: schoolMOUs
  });
}));


// Get all MOUs
router.get('/mous', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const mous = await MOU.find().populate('school', 'name count');
    res.json({ success: true, count: mous.length, data: mous });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching MOUs: ' + error.message });
  }
}));

// Get MOU organizations
router.get('/mous/organizations', authenticateToken, asyncHandler(async (req, res) => {
  const organizations = await MOU.distinct('nameOfPartnerInstitution');
  res.json({ success: true, count: organizations.length, data: organizations });
}));

// Search MOUs by organization name
router.get('/mous/search/:name', authenticateToken, asyncHandler(async (req, res) => {
  const organizationName = sanitizeInput(req.params.name);
  if (!organizationName) return res.status(400).json({ success: false, error: 'Organization name is required' });
  const mous = await MOU.find({ nameOfPartnerInstitution: { $regex: organizationName, $options: 'i' } }).populate('school', 'name');
  res.json({ success: true, count: mous.length, searchTerm: organizationName, data: mous });
}));

// Get MOUs by school ID
router.get('/mous/school/:schoolId', authenticateToken, asyncHandler(async (req, res) => {
  const schoolId = sanitizeInput(req.params.schoolId);
  if (!schoolId) return res.status(400).json({ success: false, error: 'School ID is required' });
  if (!mongoose.Types.ObjectId.isValid(schoolId)) return res.status(400).json({ success: false, error: 'Invalid school ID format' });
  const mous = await MOU.find({ school: schoolId }).populate('school', 'name');
  res.json({ success: true, count: mous.length, searchTerm: schoolId, data: mous });
}));

// Get MOU by ID
router.get('/mous/:mouId', authenticateToken, asyncHandler(async (req, res) => {
  const mouId = sanitizeInput(req.params.mouId);
  if (!mongoose.Types.ObjectId.isValid(mouId)) return res.status(400).json({ success: false, error: 'Invalid MOU ID format' });
  const mou = await MOU.findById(mouId).populate('school', 'name');
  if (!mou) return res.status(404).json({ success: false, error: 'MOU not found' });
  res.json({ success: true, data: mou });
}));

// Create MOU
router.post('/mous', authenticateToken, asyncHandler(async (req, res) => {
  const { ID, school, nameOfPartnerInstitution, strategicAreas, dateOfSigning, validity, affiliationDate } = req.body;
  if (!ID || !school || !nameOfPartnerInstitution || !strategicAreas || !dateOfSigning || !validity || !affiliationDate) {
    return res.status(400).json({ success: false, error: 'Missing required fields (ID, school, nameOfPartnerInstitution, strategicAreas, dateOfSigning, validity, affiliationDate)' });
  }
  const signingDate = new Date(dateOfSigning);
  if (isNaN(signingDate.getTime())) return res.status(400).json({ success: false, error: 'Invalid date format for dateOfSigning' });
  const affiliationDateObj = new Date(affiliationDate);
  if (isNaN(affiliationDateObj.getTime())) return res.status(400).json({ success: false, error: 'Invalid date format for affiliationDate' });

  try {
    const existingMOU = await MOU.findOne({ ID: ID.trim() });
    if (existingMOU) return res.status(409).json({ success: false, error: 'MOU with this ID already exists' });
    if (!mongoose.Types.ObjectId.isValid(school)) return res.status(400).json({ success: false, error: 'Invalid school ID format' });
    const schoolExists = await School.findById(school);
    if (!schoolExists) return res.status(404).json({ success: false, error: 'School not found' });

    const newMOU = new MOU({ ID: ID.trim(), school, nameOfPartnerInstitution: nameOfPartnerInstitution.trim(), strategicAreas: strategicAreas.trim(), dateOfSigning: signingDate, validity: validity.trim(), affiliationDate: affiliationDateObj });
    const savedMOU = await newMOU.save();

    const updatedSchool = await School.findByIdAndUpdate(school, { $inc: { count: 1 } }, { new: true });

    res.status(201).json({ success: true, message: 'MOU created successfully', data: savedMOU, schoolUpdated: { name: updatedSchool.name, newCount: updatedSchool.count } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error creating MOU: ' + error.message });
  }
}));


// Get all certificate course mappings
router.get('/certificate-course-mappings', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { studentId, umbrellaKey, qualification, certificateId, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (umbrellaKey) filter.umbrellaKey = umbrellaKey;
    if (qualification) filter.qualification = qualification;
    if (certificateId) filter.certificateId = certificateId;
    const sort = {}; sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalCount = await CertificateCourseMapping.countDocuments(filter);
    const mappings = await CertificateCourseMapping.find(filter)
      .populate('certificateId', 'certificateNo')
      .populate('studentId', 'Name email State Umbrella')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    const enhancedMappings = mappings.map(mapping => {
      const totalCreditsUsed = mapping.courses.reduce((sum, course) => sum + course.creditsUsed, 0);
      const remainingCredits = Math.max(0, mapping.totalCreditsRequired - totalCreditsUsed);
      const creditEfficiency = mapping.totalCreditsRequired > 0 ? Math.round((totalCreditsUsed / mapping.totalCreditsRequired) * 100) : 0;
      return { ...mapping, totalCreditsUsed, remainingCredits, creditEfficiency, courseCount: mapping.courses.length };
    });
    res.json({ success: true, count: enhancedMappings.length, totalCount, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(totalCount / parseInt(limit)), data: enhancedMappings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching certificate course mappings', details: error.message });
  }
}));

// Get certificate course mapping by ID
router.get('/certificate-course-mappings/:mappingId', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { mappingId } = req.params;
    const mapping = await CertificateCourseMapping.findById(mappingId)
      .populate('certificateId', 'certificateNo')
      .populate('studentId', 'name email')
      .lean();
    if (!mapping) return res.status(404).json({ success: false, error: 'Certificate course mapping not found' });
    const totalCreditsUsed = mapping.courses.reduce((sum, course) => sum + course.creditsUsed, 0);
    const remainingCredits = Math.max(0, mapping.totalCreditsRequired - totalCreditsUsed);
    const creditEfficiency = mapping.totalCreditsRequired > 0 ? Math.round((totalCreditsUsed / mapping.totalCreditsRequired) * 100) : 0;
    const enhancedMapping = { ...mapping, totalCreditsUsed, remainingCredits, creditEfficiency, courseCount: mapping.courses.length };
    res.json({ success: true, data: enhancedMapping });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching certificate course mapping', details: error.message });
  }
}));

// Get certificate course mappings for a specific student
router.get('/certificate-course-mappings/student/:studentId', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { studentId } = req.params; const { page = 1, limit = 50 } = req.query;
    if (!mongoose.Types.ObjectId.isValid(studentId)) return res.status(400).json({ success: false, error: 'Invalid student ID format' });
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalCount = await CertificateCourseMapping.countDocuments({ studentId });
    const mappings = await CertificateCourseMapping.find({ studentId })
      .populate('certificateId', 'certificateNo')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    if (mappings.length === 0) return res.status(404).json({ success: false, error: 'No certificate course mappings found for this student' });
    const enhancedMappings = mappings.map(mapping => {
      const totalCreditsUsed = mapping.courses.reduce((sum, course) => sum + course.creditsUsed, 0);
      const remainingCredits = Math.max(0, mapping.totalCreditsRequired - totalCreditsUsed);
      const creditEfficiency = mapping.totalCreditsRequired > 0 ? Math.round((totalCreditsUsed / mapping.totalCreditsRequired) * 100) : 0;
      return { ...mapping, totalCreditsUsed, remainingCredits, creditEfficiency, courseCount: mapping.courses.length };
    });
    const summary = { totalMappings: totalCount, totalCertificates: totalCount, totalCreditsEarned: enhancedMappings.reduce((s, m) => s + m.totalCreditsRequired, 0), totalCreditsUsed: enhancedMappings.reduce((s, m) => s + m.totalCreditsUsed, 0), umbrellaBreakdown: {} };
    enhancedMappings.forEach(m => { if (!summary.umbrellaBreakdown[m.umbrellaKey]) summary.umbrellaBreakdown[m.umbrellaKey] = { certificates: 0, totalCredits: 0, usedCredits: 0 }; summary.umbrellaBreakdown[m.umbrellaKey].certificates++; summary.umbrellaBreakdown[m.umbrellaKey].totalCredits += m.totalCreditsRequired; summary.umbrellaBreakdown[m.umbrellaKey].usedCredits += m.totalCreditsUsed; });
    res.json({ success: true, count: enhancedMappings.length, totalCount, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(totalCount / parseInt(limit)), summary, data: enhancedMappings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching student certificate course mappings', details: error.message });
  }
}));


// Get declined requests for Admin - EXACT COPY
router.get('/declined-requests', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const declinedRequests = await PendingCredits.find({ status: 'admin_declined' })
      .sort({ updatedAt: -1 })
      .lean();

    const transformed = declinedRequests.map(request => {
      const fileName = request?.pdf ? path.basename(request.pdf) : '';
      let pdfUrl = null;
      let pdfExists = false;
      if (fileName) {
        const filePath = path.join(__dirname, '..', 'uploads', 'pdfs', fileName);
        pdfExists = fs.existsSync(filePath);
        if (pdfExists) pdfUrl = `${req.protocol}://${req.get('host')}/files/${fileName}`;
      }
      return {
        id: request._id,
        studentId: request.studentId,
        name: request.name,
        organization: request.organization,
        discipline: request.discipline,
        theoryHours: request.theoryHours,
        practicalHours: request.practicalHours,
        totalHours: request.totalHours,
        calculatedCredits: request.calculatedCredits,
        noOfDays: request.noOfDays,
        pdf: fileName,
        pdfUrl,
        pdfExists,
        status: request.status,
        admin_approved: request.admin_approved,
        bprnd_poc_approved: request.bprnd_poc_approved,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        declinedBy: 'Admin',
        declinedAt: request.updatedAt
      };
    });

    res.json({ success: true, message: 'Admin declined requests retrieved successfully', data: transformed });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin declined requests', error: error.message });
  }
}));

// Get participants - EXACT COPY
router.get('/participants', authenticateToken, asyncHandler(async (req, res) => {
  const participants = await Student.find();
  const transformed = participants.map(p => ({
    _id: p._id,
    srNo: p.sr_no,
    batchNo: p.batch_no,
    rank: p.rank,
    serialNumberRRU: p.serial_number,
    enrollmentNumber: p.enrollment_number,
    fullName: p.full_name,
    gender: p.gender,
    dateOfBirth: p.dob,
    birthPlace: p.birth_place,
    birthState: p.birth_state,
    country: p.country,
    aadharNo: p.aadhar_no,
    mobileNumber: p.mobile_no,
    alternateNumber: p.alternate_number,
    email: p.email,
    address: p.address,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  }));
  res.json({ success: true, count: participants.length, data: transformed });
}));


// Count pending credits (POC approved, not admin approved, not declined)
router.get('/pending-credits/count', authenticateToken, asyncHandler(async (req, res) => {
  const count = await PendingCredits.countDocuments({ 
    bprnd_poc_approved: true,
    admin_approved: false,
    status: { $nin: ['declined', 'admin_declined', 'poc_declined'] }
  });
  res.json({ success: true, data: { count } });
}));

// Count BPRND claims (optionally by status)
router.get('/bprnd-claims/count', authenticateToken, asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const count = await bprnd_certification_claim.countDocuments(filter);
  res.json({ success: true, data: { count } });
}));

// Route for admin to approve pending credits by ID
router.post('/pending-credits/:id/approve', authenticateToken, asyncHandler(async (req, res) => {
  try {
    // Get the id from parameters and store in variable
    const id = req.params.id;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pending credit ID format'
      });
    }

    // Find and update the admin_approved field to true and update status
    // Keep bprnd_poc_approved as true (POC already approved)
    const pendingCredit = await PendingCredits.findByIdAndUpdate(
      id,
      { 
        admin_approved: true,
        status: 'admin_approved'
      },
      { new: true }
    );

    if (!pendingCredit) {
      return res.status(404).json({
        success: false,
        error: 'Pending credit request not found'
      });
    }

    // Check if both approvals are complete
    if (pendingCredit.admin_approved && pendingCredit.bprnd_poc_approved) {
      // Both approved - this pending credit is now fully approved
      await PendingCredits.findByIdAndUpdate(id, { status: 'approved' });
      console.log(`✅ Pending credit ${id} is now fully approved by both admin and BPRND POC`);
      
      // Now apply credits and save to course_history
      try {
        // Calculate credits using new formula: theory (15 hours = 1 credit) + practical (30 hours = 1 credit)
        const theoryHours = Number(pendingCredit.theoryHours || 0);
        const practicalHours = Number(pendingCredit.practicalHours || 0);
        const newCredits = (theoryHours / 15) + (practicalHours / 30);
        
        // Calculate individual credits for detailed logging
        const theoryCredits = theoryHours / 15;
        const practicalCredits = practicalHours / 30;
        
        console.log(`📊 Credit calculation: Theory ${theoryHours}h (${theoryCredits.toFixed(2)} credits) + Practical ${practicalHours}h (${practicalCredits.toFixed(2)} credits) = ${newCredits} total credits`);
        console.log(`📊 Detailed breakdown: Theory ${theoryCredits.toFixed(2)} credits, Practical ${practicalCredits.toFixed(2)} credits`);
        
        if (newCredits > 0) {
          // Find student in credit_calculations collection and update credits
          const db = mongoose.connection.db;
          const creditCalculationsCollection = db.collection('credit_calculations');
          
          const student = await creditCalculationsCollection.findOne({ _id: pendingCredit.studentId });
          if (student) {
            console.log(`🔍 Found student: ${student.Name} (${student.email})`);
            
            // Dynamically fetch umbrella fields from database
            const umbrellaFields = await umbrella.find({}).lean();
            if (!umbrellaFields || umbrellaFields.length === 0) {
              console.log('⚠️ No umbrella fields found in database');
              return;
            } else {
              // Convert umbrella names to field keys (e.g., "Cyber Security" -> "Cyber_Security")
              const UMBRELLA_KEYS = umbrellaFields.map(u => u.name.replace(/\s+/g, '_'));
              
              console.log(`🔍 Available umbrella fields: ${UMBRELLA_KEYS.join(', ')}`);
              
              // Normalize discipline for matching
              const normalize = (s) => String(s || '')
                .toLowerCase()
                .replace(/[_-]+/g, ' ')
                .replace(/[^a-z\s]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              
              const normDiscipline = normalize(pendingCredit.discipline);
              console.log(`🔍 Normalized discipline: "${normDiscipline}"`);
              
              // Find matching umbrella field
              let fieldKey = UMBRELLA_KEYS.find(
                (k) => normalize(k.replace(/_/g, ' ')) === normDiscipline
              );
              
              if (!fieldKey) {
                // Try partial includes match
                fieldKey = UMBRELLA_KEYS.find(
                  (k) => normalize(k.replace(/_/g, ' ')).includes(normDiscipline) ||
                         normDiscipline.includes(normalize(k.replace(/_/g, ' ')))
                );
              }
              
              if (!fieldKey && student.Umbrella) {
                // Fallback to student's umbrella selection
                const normStudentUmbrella = normalize(student.Umbrella);
                fieldKey = UMBRELLA_KEYS.find(
                  (k) => normalize(k.replace(/_/g, ' ')) === normStudentUmbrella
                ) || UMBRELLA_KEYS.find(
                  (k) => normalize(k.replace(/_/g, ' ')).includes(normStudentUmbrella)
                );
              }
              
              // Update student credits in credit_calculations collection
              if (fieldKey) {
                await creditCalculationsCollection.updateOne(
                  { _id: pendingCredit.studentId },
                  {
                    $inc: {
                      Total_Credits: newCredits,
                      [fieldKey]: newCredits,
                    },
                  }
                );
                console.log(`✅ Credits applied: ${newCredits} credits added to student ${student.Name} in field: ${fieldKey}`);
              } else {
                await creditCalculationsCollection.updateOne(
                  { _id: pendingCredit.studentId },
                  { $inc: { Total_Credits: newCredits } }
                );
                console.log(`⚠️ No matching umbrella field found for discipline "${pendingCredit.discipline}", only Total_Credits updated`);
              }
            }
          } else {
            console.log(`❌ Student not found in credit_calculations collection: ${pendingCredit.studentId}`);
            return;
          }
        }
        
        // Save course information to course_history
        try {
          // Find the last entry in course_history for this student and discipline
          const lastEntry = await CourseHistory.findOne({
            studentId: pendingCredit.studentId,
            discipline: pendingCredit.discipline
          }).sort({ createdAt: -1 });
          
          // Calculate the new count: last count + new credits earned
          const lastCount = lastEntry ? lastEntry.count : 0;
          const newCount = lastCount + newCredits;
          
          console.log(`🔍 Count calculation: Last count (${lastCount}) + New credits (${newCredits}) = New count (${newCount})`);
          
          // Use the already calculated individual credits for detailed tracking
          
          const courseHistoryEntry = new CourseHistory({
            studentId: pendingCredit.studentId,
            name: pendingCredit.courseName || pendingCredit.discipline + ' Course',
            organization: pendingCredit.organization,
            discipline: pendingCredit.discipline,
            theoryHours: pendingCredit.theoryHours,
            practicalHours: pendingCredit.practicalHours,
            theoryCredits: theoryCredits,
            practicalCredits: practicalCredits,
            totalHours: pendingCredit.totalHours,
            noOfDays: pendingCredit.noOfDays,
            creditsEarned: newCredits,
            count: newCount,
            // Add PDF information from pending credit
            pdfPath: pendingCredit.pdf || null,
            pdfFileName: pendingCredit.pdf ? pendingCredit.pdf.split('/').pop() : null
          });
          
          await courseHistoryEntry.save();
          console.log(`✅ Course history saved for student ${pendingCredit.studentId}: ${pendingCredit.courseName || pendingCredit.discipline + ' Course'}`);
          console.log(`   📊 Theory: ${theoryHours}h = ${theoryCredits.toFixed(2)} credits`);
          console.log(`   📊 Practical: ${practicalHours}h = ${practicalCredits.toFixed(2)} credits`);
          console.log(`   📊 Total: ${newCredits.toFixed(2)} credits | Cumulative count: ${newCount}`);
        } catch (historyError) {
          console.error('Error saving to course history:', historyError);
          // Don't fail the approval if course history saving fails
        }
        
        // Delete the pending credit record after successful credit application
        await PendingCredits.findByIdAndDelete(id);
        console.log(`✅ Pending credit record ${id} deleted after successful credit application`);
        
      } catch (creditError) {
        console.error('Error applying credits:', creditError);
        // Don't fail the approval if credit application fails
        // The pending credit will remain for manual review
      }
      
    } else {
      // Waiting for BPRND POC approval
      console.log(`⏳ Pending credit ${id} approved by admin, waiting for BPRND POC approval`);
      console.log(`📋 Pending credit ${id} details: admin_approved=${pendingCredit.admin_approved}, bprnd_poc_approved=${pendingCredit.bprnd_poc_approved}, status=${pendingCredit.status}`);
      console.log(`🔍 This pending credit should now be visible to BPRND POC for review`);
    }

    res.json({
      success: true,
      message: 'Pending credit approved successfully by admin',
      data: pendingCredit
    });

  } catch (error) {
    console.error('Error approving pending credit:', error);
    res.status(500).json({
      success: false,
      error: 'Error approving pending credit: ' + error.message
    });
  }
}));

// Route for admin to decline pending credits by ID
router.post('/pending-credits/:id/decline', authenticateToken, asyncHandler(async (req, res) => {
  try {
    // Get the id from parameters
    const id = req.params.id;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pending credit ID format'
      });
    }

    // Find and update the admin_approved field to false and set status to admin_declined
    const pendingCredit = await PendingCredits.findByIdAndUpdate(
      id,
      { 
        admin_approved: false,
        status: 'admin_declined'
      },
      { new: true }
    );

    if (!pendingCredit) {
      return res.status(404).json({
        success: false,
        error: 'Pending credit request not found'
      });
    }

    res.json({
      success: true,
      message: 'Pending credit declined successfully',
      data: pendingCredit
    });

  } catch (error) {
    console.error('Error declining pending credit:', error);
    res.status(500).json({
      success: false,
      error: 'Error declining pending credit: ' + error.message
    });
  }
}));

// Route for admin to approve BPR&D claims
router.post('/bprnd/claims/:claimId/approve', authenticateToken, asyncHandler(async (req, res) => {
  const { claimId } = req.params;
  const claim = await bprnd_certification_claim.findById(claimId);
  if (!claim) return res.status(404).json({ success: false, error: 'Claim not found' });

  if (claim.status === 'declined' || claim.status === 'approved') {
    return res.json({ success: true, message: `Claim already ${claim.status}` });
  }

  // Check if POC has already approved
  if (!claim.poc_approved) {
    return res.status(400).json({ success: false, error: 'POC must approve first before admin can approve' });
  }

  // Don't set status to admin_approved yet - wait until entire process is successful
  console.log(`🔄 Admin processing claim ${claimId} for ${claim.umbrellaKey} - ${claim.qualification}`);

  // Now both POC and Admin have approved - process the claim
  try {
    // Deduct credits from student's credit bank
    const student = await bprndStudents.findById(claim.studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const umbrellaField = claim.umbrellaKey;
    const requiredCredits = claim.requiredCredits || 0;
    const currentCredits = Number(student[umbrellaField] || 0);
    const currentTotalCredits = Number(student.Total_Credits || 0);

    if (currentCredits < requiredCredits) {
      // Don't change the claim status - just return error
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient credits. Required: ${requiredCredits}, Available: ${currentCredits}` 
      });
    }

    // Deduct credits
    const newUmbrellaCredits = Math.max(0, currentCredits - requiredCredits);
    const newTotalCredits = Math.max(0, currentTotalCredits - requiredCredits);
    
    student[umbrellaField] = newUmbrellaCredits;
    student.Total_Credits = newTotalCredits;
    await student.save();
    
    console.log(`💰 Credit deduction completed:`);
    console.log(`  Umbrella field: ${umbrellaField}`);
    console.log(`  Previous credits: ${currentCredits}`);
    console.log(`  Required credits: ${requiredCredits}`);
    console.log(`  New credits: ${newUmbrellaCredits}`);
    console.log(`  Total credits: ${currentTotalCredits} → ${newTotalCredits}`);

    // Find the last certificate for this umbrella to get the next sequence number
    const lastCertificate = await BprndCertificate.findOne(
      { umbrellaKey: claim.umbrellaKey }, 
      {}, 
      { sort: { 'certificateNo': -1 } }
    );
    
    let nextSequenceNumber = 1;
    if (lastCertificate && lastCertificate.certificateNo) {
      const idParts = lastCertificate.certificateNo.split('_');
      if (idParts.length >= 3) {
        const lastNumber = parseInt(idParts[2]);
        if (!isNaN(lastNumber)) {
          nextSequenceNumber = lastNumber + 1;
        }
      }
    }

    // Create certificate
    const certificate = new BprndCertificate({
      studentId: claim.studentId,
      umbrellaKey: claim.umbrellaKey,
      qualification: claim.qualification,
      claimId: claim._id,
      certificateNo: `rru_${claim.umbrellaKey}_${nextSequenceNumber}`,
      issuedAt: new Date()
    });
    await certificate.save();

    // Get courses that will contribute to this certificate (FIFO method)
    // Convert umbrellaKey back to proper format for course history query
    // e.g., "Military_Law" -> "Military Law"
    const disciplineForQuery = claim.umbrellaKey.replace(/_/g, ' ');
    
    console.log(`🔍 Admin approval: Querying course history for discipline: "${disciplineForQuery}" (converted from umbrellaKey: "${claim.umbrellaKey}")`);
    
    const coursesToMark = await CourseHistory.find({
      studentId: claim.studentId,
      discipline: disciplineForQuery,
      certificateContributed: { $ne: true } // Only consider courses not already contributed
    }).sort({ createdAt: 1 }); // Oldest first
    
    console.log(`📊 Admin approval: Found ${coursesToMark.length} course history records for discipline: "${disciplineForQuery}"`);

    let remainingCredits = requiredCredits;
    const markedCourses = [];
    let totalCreditsContributed = 0;
    const coursesToMarkIds = []; // Track courses that will be marked as contributed

    for (const course of coursesToMark) {
      if (remainingCredits <= 0) break;
      
      const creditsToContribute = Math.min(course.creditsEarned, remainingCredits);
      
      // Track course info before marking
      markedCourses.push({
        courseId: course._id,
        courseName: course.name,
        creditsContributed: creditsToContribute
      });
      
      // Add to marking list
      coursesToMarkIds.push(course._id);
      
      remainingCredits -= creditsToContribute;
      totalCreditsContributed += creditsToContribute;
    }

    // Mark the contributing courses as certificateContributed: true in coursehistories collection
    if (coursesToMarkIds.length > 0) {
      // Update each course individually to set the contributedToCertificate details
      for (const courseId of coursesToMarkIds) {
        const courseContribution = markedCourses.find(mc => mc.courseId.toString() === courseId.toString());
        if (courseContribution) {
          // Get the original course details before updating
          const originalCourse = await CourseHistory.findById(courseId);
          if (!originalCourse) continue;

          // Update the original course as contributed
          await CourseHistory.findByIdAndUpdate(
            courseId,
            {
              certificateContributed: true,
              contributedToCertificate: {
                certificateId: certificate._id,
                certificateNo: certificate.certificateNo,
                qualification: claim.qualification,
                contributedAt: new Date(),
                creditsContributed: courseContribution.creditsContributed
              }
            }
          );

          // Check if this course contributed partially and create remaining credits entry
          if (courseContribution.creditsContributed < originalCourse.creditsEarned) {
            const remainingCredits = originalCourse.creditsEarned - courseContribution.creditsContributed;
            
            // Calculate proportional remaining hours and credits
            const theoryRatio = originalCourse.creditsEarned > 0 ? (originalCourse.theoryCredits || 0) / originalCourse.creditsEarned : 0;
            const practicalRatio = originalCourse.creditsEarned > 0 ? (originalCourse.practicalCredits || 0) / originalCourse.creditsEarned : 0;
            
            const remainingTheoryCredits = (originalCourse.theoryCredits || 0) - (courseContribution.creditsContributed * theoryRatio);
            const remainingPracticalCredits = (originalCourse.practicalCredits || 0) - (courseContribution.creditsContributed * practicalRatio);
            
            const remainingTheoryHours = Math.round((originalCourse.theoryHours || 0) * (remainingCredits / originalCourse.creditsEarned));
            const remainingPracticalHours = Math.round((originalCourse.practicalHours || 0) * (remainingCredits / originalCourse.creditsEarned));
            const remainingTotalHours = remainingTheoryHours + remainingPracticalHours;

            // Create the remaining credits entry with copied contributedToCertificate field
            const remainingCreditsEntry = new CourseHistory({
              studentId: originalCourse.studentId,
              name: `${originalCourse.name} (Remaining Credits)`,
              organization: originalCourse.organization,
              discipline: originalCourse.discipline,
              theoryHours: remainingTheoryHours,
              practicalHours: remainingPracticalHours,
              totalHours: remainingTotalHours,
              noOfDays: originalCourse.noOfDays,
              theoryCredits: remainingTheoryCredits,
              practicalCredits: remainingPracticalCredits,
              creditsEarned: remainingCredits,
              count: remainingCredits,
              certificateContributed: false, // Available for future certificates
              // Copy the contributedToCertificate field to show this is from the same certificate process
              contributedToCertificate: {
                certificateId: certificate._id,
                certificateNo: certificate.certificateNo,
                qualification: claim.qualification,
                contributedAt: new Date(),
                creditsContributed: 0, // 0 because this entry represents remaining credits
                isRemainingCredits: true, // Flag to identify this as a remaining credits entry
                originalCourseId: originalCourse._id // Link to the original course
              },
              // Copy PDF information from original course
              pdfPath: originalCourse.pdfPath,
              pdfFileName: originalCourse.pdfFileName
            });

            await remainingCreditsEntry.save();
            console.log(`✅ Created remaining credits entry: "${remainingCreditsEntry.name}" with ${remainingCredits} credits`);
            console.log(`   📊 Theory: ${remainingTheoryHours}h = ${remainingTheoryCredits.toFixed(2)} credits`);
            console.log(`   📊 Practical: ${remainingPracticalHours}h = ${remainingPracticalCredits.toFixed(2)} credits`);
          }
        }
      }
      
      console.log(`✅ Marked ${coursesToMarkIds.length} contributing courses as certificateContributed: true with detailed contribution info`);
      console.log(`📋 Marked course IDs:`, coursesToMarkIds);
    }

    // Mark claim as finalized and set admin approval fields using findByIdAndUpdate
    const finalizedClaim = await bprnd_certification_claim.findByIdAndUpdate(
      claimId,
      {
        admin_approved: true,
        admin_approved_at: new Date(),
        admin_approved_by: req.user?.email || 'admin',
        status: 'approved',
        finalized_at: new Date()
      },
      { new: true, runValidators: false }
    );

    if (!finalizedClaim) {
      return res.status(500).json({ success: false, error: 'Failed to finalize claim' });
    }

    // Create certificate course mapping before deleting the claim
    try {
      // Get detailed course information for the mapping
      const courseDetails = await CourseHistory.find({
        _id: { $in: coursesToMarkIds }
      }).lean();

      // Create the mapping document
      const certificateMapping = new CertificateCourseMapping({
        certificateId: certificate._id,
        studentId: claim.studentId,
        umbrellaKey: claim.umbrellaKey,
        qualification: claim.qualification,
        totalCreditsRequired: requiredCredits,
        courses: courseDetails.map(course => {
          // Calculate how many credits this course contributes
          const courseContribution = markedCourses.find(mc => mc.courseId.toString() === course._id.toString());
          const creditsUsed = courseContribution ? courseContribution.creditsContributed : 0;
          
          return {
            courseId: course._id,
            courseName: course.name,
            organization: course.organization,
            theoryHours: course.theoryHours,
            practicalHours: course.practicalHours,
            totalCredits: course.creditsEarned,
            creditsUsed: creditsUsed,
            completionDate: course.createdAt,
            pdfPath: course.pdfPath,
            pdfFileName: course.pdfFileName
          };
        })
      });

      await certificateMapping.save();
      console.log(`📋 Certificate course mapping created successfully for certificate ${certificate._id}`);
      console.log(`   Mapped ${courseDetails.length} courses with total credits used: ${totalCreditsContributed}`);
    } catch (mappingError) {
      console.error('⚠️ Warning: Failed to create certificate course mapping:', mappingError);
      // Continue with claim deletion even if mapping fails
    }

    // ✅ DELETE the claim after successful approval and certificate issuance
    await bprnd_certification_claim.findByIdAndDelete(claimId);

    console.log(`🎉 Claim finalized: ${requiredCredits} credits deducted, certificate issued, ${markedCourses.length} courses marked as contributed`);
    console.log(`🗑️ Claim ${claimId} deleted from database after successful approval`);

    return res.json({ 
      success: true, 
      message: 'Claim approved and finalized. Credits deducted, certificate issued, courses marked as contributed, and claim deleted.',
      data: {
        claimId: claimId, // Return the ID since claim is now deleted
        certificate,
        creditsDeducted: requiredCredits,
        remainingCredits: {
          umbrella: student[umbrellaField],
          total: student.Total_Credits
        },
        markedCourses: markedCourses,
        coursesContributed: markedCourses.length,
        coursesMarked: coursesToMarkIds.length
      }
    });

  } catch (error) {
    console.error('Error finalizing claim:', error);
    return res.status(500).json({ success: false, error: 'Error finalizing claim' });
  }
}));

// Route for admin to decline BPR&D claims
router.post('/bprnd/claims/:claimId/decline', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { claimId } = req.params;
    const { reason } = req.body;
    
    const claim = await bprnd_certification_claim.findById(claimId);
    if (!claim) return res.status(404).json({ success: false, error: 'Claim not found' });

    // Update using the new field structure
    claim.admin_approved = false;
    claim.admin_approved_at = new Date();
    claim.admin_approved_by = req.user?.email || 'admin';
    claim.status = 'declined';
    claim.declined_reason = reason || 'Declined by admin';
    claim.declined_at = new Date();
    
    await claim.save();

    console.log(`✅ Admin declined claim ${claimId} for ${claim.umbrellaKey} - ${claim.qualification}`);

    // Note: No certificate course mapping created for declined claims
    // ✅ DELETE the declined claim from database
    await bprnd_certification_claim.findByIdAndDelete(claimId);
    
    console.log(`🗑️ Declined claim ${claimId} deleted from database`);

    res.json({ 
      success: true, 
      message: 'Claim declined by admin and deleted from database',
      data: {
        claimId: claimId,
        status: 'declined',
        declined_reason: claim.declined_reason,
        declined_at: claim.declined_at
      }
    });
  } catch (error) {
    console.error('Error declining claim:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error declining claim',
      details: error.message
    });
  }
}));

// Get discipline course counts for analytics
router.get('/disciplines/count', async (req, res) => {
  try {
    console.log('📊 Admin fetching discipline course counts from coursehistories collection...');
    
    // Directly query the coursehistories collection
    const db = mongoose.connection.db;
    const coursehistoriesCollection = db.collection('coursehistories');
    
    // Aggregate to count courses by discipline
    const disciplineCounts = await coursehistoriesCollection.aggregate([
      {
        $group: {
          _id: '$discipline',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 } // Sort by count descending
      }
    ]).toArray();
    
    // Convert to the format needed for frontend
    const disciplineData = {};
    let totalCourses = 0;
    
    disciplineCounts.forEach(item => {
      if (item._id) { // Only include disciplines with valid names
        disciplineData[item._id] = item.count;
        totalCourses += item.count;
      }
    });
    
    console.log(`✅ Admin found ${disciplineCounts.length} disciplines with ${totalCourses} total courses`);
    console.log('📈 Discipline breakdown:', disciplineData);
    
    res.json({
      success: true,
      message: 'Discipline course counts retrieved successfully',
      data: disciplineData,
      totalCourses: totalCourses,
      disciplineCount: disciplineCounts.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching discipline course counts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discipline course counts',
      error: error.message
    });
  }
});

module.exports = router;
