const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config();

// Polyfill fetch in Node if not available
const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: f }) => f(...args)));

// Debug: Check if environment variables are loaded
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'LOADED' : 'NOT LOADED');
console.log('Current working directory:', process.cwd());

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the uploads directory
app.use('/files', express.static(path.join(__dirname, '..', 'uploads', 'pdfs')));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('WARNING: JWT_SECRET environment variable is not set. Please set it for security.');
  process.exit(1);
}

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});



// Middleware
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));
app.use(express.json({ limit: '10mb' })); // Added size limit for security

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB at mongodb://localhost:27017/sitaics'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import MOU schema
const MOU = require('../models/MOU');
const Course = require('../models/courses');
const School = require('../models/school');
const Field = require('../models/fields');
const Admin = require('../models/admin');
const PendingAdmin = require('../models/pendingAdmin');
// Use the existing Student model for candidates/participants
const Candidate = require('../models1/student');
const Student = require('../models1/student'); // Import the correct Student model
const PendingCredits = require('../model3/pendingcredits');
const bprndStudents = require('../model3/bprndstudents');
const bprnd_certification_claim = require('../model3/bprnd_certification_claim');
// Note: BPRND students are stored in credit_calculations collection, using bprndstudents model
const CourseHistory = require('../model3/course_history');
const umbrella = require('../model3/umbrella');
const BprndCertificate = require('../model3/bprnd_certificate');

// Input sanitization helper
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, ''); // Remove basic HTML tags
  }
  return input;
};

// Utility function to recalculate cumulative counts for a student's discipline
const recalculateCumulativeCounts = async (studentId, discipline) => {
  try {
    const allCoursesInDiscipline = await CourseHistory.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      discipline: discipline,
      certificateContributed: { $ne: true } // Only count courses not contributed to certificates
    }).sort({ createdAt: 1 }); // Oldest first

    let cumulativeCount = 0;
    for (const course of allCoursesInDiscipline) {
      // Only count courses that haven't contributed to certificates
      cumulativeCount += course.creditsEarned;
      course.count = cumulativeCount;
      await course.save();
    }

    console.log(`✅ Recalculated cumulative counts for student ${studentId} in discipline ${discipline}`);
    return true;
  } catch (error) {
    console.error(`❌ Error recalculating counts for student ${studentId} in discipline ${discipline}:`, error);
    return false;
  }
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Login route - No authentication required
app.post('/api/login', asyncHandler(async (req, res) => {
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

// Route to get all MOUs information
app.get('/api/mous', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const mous = await MOU.find().populate('school', 'name count');
    
    // Log for debugging
    console.log('MOUs found:', mous.length);
    mous.forEach((mou, index) => {
      console.log(`MOU ${index + 1}:`, {
        id: mou._id,
        school: mou.school,
        schoolName: mou.school?.name,
        schoolCount: mou.school?.count
      });
    });
    
    res.json({
      success: true,
      count: mous.length,
      data: mous
    });
  } catch (error) {
    console.error('Error fetching MOUs:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching MOUs: ' + error.message
    });
  }
}));

// Route to get all unique organization names from MOUs
app.get('/api/mous/organizations', authenticateToken, asyncHandler(async (req, res) => {
  const organizations = await MOU.distinct('nameOfPartnerInstitution');
  
  res.json({
    success: true,
    count: organizations.length,
    data: organizations
  });
}));

// Route to get all schools (moved from api1.js)
app.get('/api/schools-all', authenticateToken, asyncHandler(async (req, res) => {
  try {
    // Find all schools from the school collection
    const schools = await School.find({}, 'name count'); // Only return name and count fields
    
    // Log for debugging
    console.log('Schools found:', schools.length);
    schools.forEach((school, index) => {
      console.log(`School ${index + 1}:`, {
        id: school._id,
        name: school.name,
        count: school.count
      });
    });
    
    res.json({
      success: true,
      count: schools.length,
      data: schools
    });

  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}));

// Route to search MOUs by organization name
app.get('/api/mous/search/:name', authenticateToken, asyncHandler(async (req, res) => {
  const organizationName = sanitizeInput(req.params.name);
  
  if (!organizationName) {
    return res.status(400).json({
      success: false,
      error: 'Organization name is required'
    });
  }
  
  const mous = await MOU.find({ 
    nameOfPartnerInstitution: { $regex: organizationName, $options: 'i' } 
  }).populate('school', 'name');
  
  res.json({
    success: true,
    count: mous.length,
    searchTerm: organizationName,
    data: mous
  });
}));

// Route to search MOUs by school ID
app.get('/api/mous/school/:schoolId', authenticateToken, asyncHandler(async (req, res) => {
  const schoolId = sanitizeInput(req.params.schoolId);
  
  if (!schoolId) {
    return res.status(400).json({
      success: false,
      error: 'School ID is required'
    });
  }

  // Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(schoolId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid school ID format'
    });
  }
  
  const mous = await MOU.find({ school: schoolId }).populate('school', 'name');
  
  res.json({
    success: true,
    count: mous.length,
    searchTerm: schoolId,
    data: mous
  });
}));

// Route to get a single MOU by ID
app.get('/api/mous/:mouId', authenticateToken, asyncHandler(async (req, res) => {
  const mouId = sanitizeInput(req.params.mouId);
  
  // Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(mouId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid MOU ID format'
    });
  }
  
  const mou = await MOU.findById(mouId).populate('school', 'name');
  if (!mou) {
    return res.status(404).json({
      success: false,
      error: 'MOU not found'
    });
  }
  
  res.json({
    success: true,
    data: mou
  });
}));

// Route to add a single MOU
app.post('/api/mous', authenticateToken, asyncHandler(async (req, res) => {
  const { ID, school, nameOfPartnerInstitution, strategicAreas, dateOfSigning, validity, affiliationDate } = req.body;

  // Validate required fields
  if (!ID || !school || !nameOfPartnerInstitution || !strategicAreas || !dateOfSigning || !validity || !affiliationDate) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields (ID, school, nameOfPartnerInstitution, strategicAreas, dateOfSigning, validity, affiliationDate)'
    });
  }

  // Validate date format
  const signingDate = new Date(dateOfSigning);
  if (isNaN(signingDate.getTime())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid date format for dateOfSigning'
    });
  }

  // Validate affiliation date format
  const affiliationDateObj = new Date(affiliationDate);
  if (isNaN(affiliationDateObj.getTime())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid date format for affiliationDate'
    });
  }

  try {
    // Check for duplicate ID
    const existingMOU = await MOU.findOne({ ID: ID.trim() });
    if (existingMOU) {
      return res.status(409).json({
        success: false,
        error: 'MOU with this ID already exists'
      });
    }

    // Validate school ObjectId
    if (!mongoose.Types.ObjectId.isValid(school)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid school ID format'
      });
    }

    // Check if school exists
    const schoolExists = await School.findById(school);
    if (!schoolExists) {
      return res.status(404).json({
        success: false,
        error: 'School not found'
      });
    }

    // Create new MOU
    const newMOU = new MOU({
      ID: ID.trim(),
      school: school,
      nameOfPartnerInstitution: nameOfPartnerInstitution.trim(),
      strategicAreas: strategicAreas.trim(),
      dateOfSigning: signingDate,
      validity: validity.trim(),
      affiliationDate: affiliationDateObj
    });

    const savedMOU = await newMOU.save();

    // Increment the school's count by 1
    const updatedSchool = await School.findByIdAndUpdate(
      school,
      { $inc: { count: 1 } },
      { new: true }
    );

    console.log(`✅ MOU created and school count updated: ${updatedSchool.name} (${updatedSchool.count} MOUs)`);

    res.status(201).json({
      success: true,
      message: 'MOU created successfully',
      data: savedMOU,
      schoolUpdated: {
        name: updatedSchool.name,
        newCount: updatedSchool.count
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error creating MOU: ' + error.message
    });
  }
}));

// Route to get unique organizations from courses
app.get('/api/courses/organizations', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const organizations = await Course.distinct('organization');
    res.json(organizations);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching organizations: ' + error.message
    });
  }
}));

// Route to search courses by organization
app.get('/api/courses/organization/:organization', authenticateToken, asyncHandler(async (req, res) => {
  const { organization } = req.params;
  const { status } = req.query; // Optional status filter

  try {
    let query = { organization: organization };
    
    // Add status filter if provided
    if (status && ['ongoing', 'completed', 'upcoming'].includes(status)) {
      query.completionStatus = status;
    }

    const courses = await Course.find(query).populate('field');
    
    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error searching courses by organization: ' + error.message
    });
  }
}));

// Route to search courses by MOU ID
app.get('/api/courses/mou/:mouId', authenticateToken, asyncHandler(async (req, res) => {
  const { mouId } = req.params;
  const { status } = req.query; // Optional status filter

  try {
    // Validate MOU ID format
    if (!mongoose.Types.ObjectId.isValid(mouId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid MOU ID format'
      });
    }

    let query = { mou_id: mouId };
    
    // Add status filter if provided
    if (status && ['ongoing', 'completed', 'upcoming'].includes(status)) {
      query.completionStatus = status;
    }

    const courses = await Course.find(query).populate('field');
    
    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error searching courses by MOU: ' + error.message
    });
  }
}));

// Route to get courses by completion status
app.get('/api/courses/:status', authenticateToken, asyncHandler(async (req, res) => {
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

// Route to add a single course
app.post('/api/courses', authenticateToken, asyncHandler(async (req, res) => {
  const { ID, mou_id, courseName, organization, duration, indoorCredits, outdoorCredits, field, startDate, completionStatus, subjects } = req.body;

  // Validate required fields
  if (!ID || !mou_id || !courseName || !organization || !duration || !field || !startDate) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields (ID, mou_id, courseName, organization, duration, field, startDate)'
    });
  }

  // Validate MOU ID format
  if (!mongoose.Types.ObjectId.isValid(mou_id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid MOU ID format'
    });
  }

  // Check if MOU exists
  const existingMOU = await MOU.findById(mou_id);
  if (!existingMOU) {
    return res.status(404).json({
      success: false,
      error: 'MOU not found with the provided ID'
    });
  }

  // Validate numeric fields
  if (isNaN(indoorCredits) || isNaN(outdoorCredits) || indoorCredits < 0 || outdoorCredits < 0) {
    return res.status(400).json({
      success: false,
      error: 'indoorCredits and outdoorCredits must be valid non-negative numbers'
    });
  }

  // Validate start date
  const startDateObj = new Date(startDate);
  if (isNaN(startDateObj.getTime())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid date format for startDate'
    });
  }

  // Validate completion status
  const validStatuses = ['ongoing', 'completed', 'upcoming'];
  if (completionStatus && !validStatuses.includes(completionStatus)) {
    return res.status(400).json({
      success: false,
      error: 'completionStatus must be one of: ongoing, completed, upcoming'
    });
  }

  // Validate subjects array
  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'At least one subject is required'
    });
  }

  // Validate and sanitize each subject
  const validatedSubjects = [];
  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    if (!subject.noOfPeriods || !subject.periodsMin || !subject.totalMins || !subject.totalHrs || subject.credits === undefined) {
      return res.status(400).json({
        success: false,
        error: `Subject ${i + 1}: Missing required fields (noOfPeriods, periodsMin, totalMins, totalHrs, credits)`
      });
    }

    // Convert to numbers and validate
    const noOfPeriods = parseInt(subject.noOfPeriods);
    const periodsMin = parseInt(subject.periodsMin);
    const totalMins = parseInt(subject.totalMins);
    const totalHrs = parseInt(subject.totalHrs);
    const credits = parseInt(subject.credits);

    if (isNaN(noOfPeriods) || noOfPeriods < 1 || 
        isNaN(periodsMin) || periodsMin < 1 || 
        isNaN(totalMins) || totalMins < 1 || 
        isNaN(totalHrs) || totalHrs < 1 || 
        isNaN(credits) || credits < 0) {
      return res.status(400).json({
        success: false,
        error: `Subject ${i + 1}: Invalid numeric values`
      });
    }

    // Add validated subject
    validatedSubjects.push({
      noOfPeriods,
      periodsMin,
      totalMins,
      totalHrs,
      credits
    });
  }

  try {
    // Check for duplicate course name (case-insensitive)
    const trimmedCourseName = courseName.trim();
    
    // Debug: Log what we're searching for
    console.log('Searching for course name:', trimmedCourseName);
    
    const existingCourse = await Course.findOne({ 
      courseName: { $regex: new RegExp(`^${trimmedCourseName}$`, 'i') }
    });
    
    // Debug: Log what we found
    if (existingCourse) {
      console.log('Found existing course:', existingCourse.courseName);
    } else {
      console.log('No existing course found');
    }
    
    if (existingCourse) {
      return res.status(409).json({
        success: false,
        error: `A course with the name "${existingCourse.courseName}" already exists`
      });
    }
    
    // Additional check: also check for exact match (case-sensitive)
    const exactMatch = await Course.findOne({ courseName: trimmedCourseName });
    if (exactMatch) {
      console.log('Found exact match:', exactMatch.courseName);
      return res.status(409).json({
        success: false,
        error: `A course with the exact name "${exactMatch.courseName}" already exists`
      });
    }

    // Check if field exists in field schema
    const trimmedFieldName = field.trim();
    const existingField = await Field.findOne({ name: trimmedFieldName });
    
    if (!existingField) {
      return res.status(400).json({
        success: false,
        error: `Field "${trimmedFieldName}" does not exist. Please use one of the available fields.`
      });
    }
    
    // Increment field count
    existingField.count += 1;
    await existingField.save();

    // Create new course with validated subjects
    console.log('Creating new course with name:', courseName.trim());
    
    const newCourse = new Course({
      ID: ID.trim(),
      mou_id: mou_id,
      courseName: courseName.trim(),
      organization: organization.trim(),
      duration: duration.trim(),
      indoorCredits: parseInt(indoorCredits),
      outdoorCredits: parseInt(outdoorCredits),
      field: existingField._id, // Use ObjectId reference instead of string
      startDate: startDateObj,
      completionStatus: completionStatus || 'upcoming',
      subjects: validatedSubjects // Use validated subjects instead of raw input
    });

    console.log('Attempting to save course...');
    const savedCourse = await newCourse.save();
    console.log('Course saved successfully:', savedCourse.courseName);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: savedCourse
    });

  } catch (error) {
    console.log('Error occurred during course creation:', error);
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      console.log('Duplicate key error detected');
      return res.status(409).json({
        success: false,
        error: 'A course with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error creating course: ' + error.message
    });
  }
}));

// Debug route to check existing course names
app.get('/api/courses/debug', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const courses = await Course.find({}, 'courseName');
    res.json({
      success: true,
      count: courses.length,
      courseNames: courses.map(c => c.courseName)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching course names: ' + error.message
    });
  }
}));

// Route to update completion status for all courses
app.post('/api/courses/update-completion-status', authenticateToken, asyncHandler(async (req, res) => {
  try {
    await Course.updateAllCompletionStatuses();
    res.json({
      success: true,
      message: 'Completion status updated for all courses'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error updating completion status: ' + error.message
    });
  }
}));

// Route to get all pending credits that need approval (for admin)
// Route to get all pending credits that need approval (for admin)
app.get('/api/pending-credits', authenticateToken, asyncHandler(async (req, res) => {
  try {
    console.log('🔍 Admin requesting pending credits for approval...');
    
    // Find all pending credits that need admin approval (POC approved first, then admin)
    // This will show only credits that have been approved by POC but not by admin yet
    const pendingCredits = await PendingCredits.find({
      bprnd_poc_approved: true,
      admin_approved: false
    })
    .populate('studentId', 'Name email Designation State') // Populate student details
    .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log(`📊 Found ${pendingCredits.length} pending credits that need admin approval`);
    console.log('🔍 Query criteria: admin_approved: false');

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
        pdf: pendingCreditData.pdf,
        admin_approved: pendingCreditData.admin_approved,
        bprnd_poc_approved: pendingCreditData.bprnd_poc_approved,
        createdAt: pendingCreditData.createdAt,
        updatedAt: pendingCreditData.updatedAt,
        // Action links
        approveLink: `/api/pending-credits/${pendingCredit._id}/approve`,
        declineLink: `/api/pending-credits/${pendingCredit._id}/decline`
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

// Route for admin to approve pending credits
app.post('/api/pending-credits/:id/approve', authenticateToken, asyncHandler(async (req, res) => {
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
        // Calculate credits using new formula: theory (30 hours = 1 credit) + practical (15 hours = 1 credit)
        const theoryHours = Number(pendingCredit.theoryHours || 0);
        const practicalHours = Number(pendingCredit.practicalHours || 0);
        const newCredits = (theoryHours / 30) + (practicalHours / 15);
        
        // Calculate individual credits for detailed logging
        const theoryCredits = theoryHours / 30;
        const practicalCredits = practicalHours / 15;
        
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
app.post('/api/pending-credits/:id/decline', authenticateToken, asyncHandler(async (req, res) => {
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

    // Find and update the admin_approved field to false and set status to declined
    const pendingCredit = await PendingCredits.findByIdAndUpdate(
      id,
      { 
        admin_approved: false,
        status: 'declined'
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

// Route to get all schools with their information and links
app.get('/api/schools', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const schools = await School.find();
    
    // Transform schools into format with links for frontend
    const schoolsWithLinks = schools.map(school => ({
      _id: school._id,
      id: school._id,
      name: school.name,
      count: school.count,
      link: `/api/schools/${encodeURIComponent(school.name)}` // Link that will hit another route when clicked
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

// Route that will be hit when admin clicks on school link
app.get('/api/schools/:schoolName', authenticateToken, asyncHandler(async (req, res) => {
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

// Route to get courses by MOU ID
app.get('/api/mous/:mouId/courses', authenticateToken, asyncHandler(async (req, res) => {
  const mouId = sanitizeInput(req.params.mouId);
  
  // Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(mouId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid MOU ID format'
    });
  }
  
  // First check if MOU exists
  const mou = await MOU.findById(mouId).populate('school', 'name');
  if (!mou) {
    return res.status(404).json({
      success: false,
      error: 'MOU not found'
    });
  }
  
  // Find all courses for this MOU
  const courses = await Course.find({ mou_id: mouId }).populate('field');
  
  res.json({
    success: true,
    mou: mou,
    count: courses.length,
    data: courses
  });
}));

// Route to get total number of participants trained
app.get('/api/participants', authenticateToken, asyncHandler(async (req, res) => {
  const participants = await Student.find();
  
  // Transform the data to match frontend expectations
  const transformedParticipants = participants.map(participant => ({
    _id: participant._id,
    srNo: participant.sr_no,
    batchNo: participant.batch_no,
    rank: participant.rank,
    serialNumberRRU: participant.serial_number,
    enrollmentNumber: participant.enrollment_number,
    fullName: participant.full_name,
    gender: participant.gender,
    dateOfBirth: participant.dob,
    birthPlace: participant.birth_place,
    birthState: participant.birth_state,
    country: participant.country,
    aadharNo: participant.aadhar_no,
    mobileNumber: participant.mobile_no,
    alternateNumber: participant.alternate_number,
    email: participant.email,
    address: participant.address,
    createdAt: participant.createdAt,
    updatedAt: participant.updatedAt
  }));

  res.json({
    success: true,
    count: participants.length,
    data: transformedParticipants
  });
}));

// Route to get all fields as links
app.get('/api/fields', authenticateToken, asyncHandler(async (req, res) => {
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

// Route that will be hit when admin clicks on field link
app.get('/api/fields/:fieldId', authenticateToken, asyncHandler(async (req, res) => {
  const fieldId = sanitizeInput(req.params.fieldId);
  
  // Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(fieldId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid field ID format'
    });
  }
  
  // First retrieve the field
  const field = await Field.findById(fieldId);
  
  if (!field) {
    return res.status(404).json({
      success: false,
      error: 'Field not found'
    });
  }
  
  // Then retrieve all courses of this field
  const fieldCourses = await Course.find({ field: field._id }).populate('field');
  
  res.json({
    success: true,
    field: field,
    coursesCount: fieldCourses.length,
    courses: fieldCourses
  });
}));

// Route for bulk importing MOUs from Excel
app.post('/api/mous/import', authenticateToken, upload.single('excelFile'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Excel file is required'
    });
  }

  try {
    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Excel file is empty or invalid'
      });
    }

    const results = {
      success: [],
      errors: [],
      duplicates: []
    };

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2;

      try {
        // Sanitize inputs
        const ID = sanitizeInput(row.ID || row.id || '');
        const school = sanitizeInput(row.school || row.School || '');
        const nameOfPartnerInstitution = sanitizeInput(row.nameOfPartnerInstitution || row.NameOfPartnerInstitution || '');
        const strategicAreas = sanitizeInput(row.strategicAreas || row.StrategicAreas || '');
        const dateOfSigning = row.dateOfSigning || row.DateOfSigning || '';
        const validity = sanitizeInput(row.validity || row.Validity || '');
        const affiliationDate = row.affiliationDate || row.AffiliationDate || '';

        // Validate required fields
        if (!ID || !school || !nameOfPartnerInstitution || !strategicAreas || !dateOfSigning || !validity || !affiliationDate) {
          results.errors.push({
            row: rowNumber,
            data: row,
            error: 'Missing required fields (ID, school, nameOfPartnerInstitution, strategicAreas, dateOfSigning, validity, affiliationDate)'
          });
          continue;
        }

        // Validate date format
        const signingDate = new Date(dateOfSigning);
        if (isNaN(signingDate.getTime())) {
          results.errors.push({
            row: rowNumber,
            data: row,
            error: 'Invalid date format for dateOfSigning'
          });
          continue;
        }

        // Validate affiliation date format
        const affiliationDateObj = new Date(affiliationDate);
        if (isNaN(affiliationDateObj.getTime())) {
          results.errors.push({
            row: rowNumber,
            data: row,
            error: 'Invalid date format for affiliationDate'
          });
          continue;
        }

        // Check for duplicate ID
        const existingMOU = await MOU.findOne({ ID: ID });
        if (existingMOU) {
          results.duplicates.push({
            row: rowNumber,
            data: row,
            error: 'MOU with this ID already exists'
          });
          continue;
        }

        // Validate school ObjectId
        if (!mongoose.Types.ObjectId.isValid(school)) {
          results.errors.push({
            row: rowNumber,
            data: row,
            error: 'Invalid school ID format'
          });
          continue;
        }

        // Check if school exists
        const existingSchool = await School.findById(school);
        if (!existingSchool) {
          results.errors.push({
            row: rowNumber,
            data: row,
            error: 'School not found'
          });
          continue;
        }

        // Create new MOU
        const newMOU = new MOU({
          ID: ID.trim(),
          school: school,
          nameOfPartnerInstitution: nameOfPartnerInstitution.trim(),
          strategicAreas: strategicAreas.trim(),
          dateOfSigning: signingDate,
          validity: validity.trim(),
          affiliationDate: affiliationDateObj
        });

        const savedMOU = await newMOU.save();

        // Increment the school's count by 1
        await School.findByIdAndUpdate(
          school,
          { $inc: { count: 1 } }
        );

        results.success.push({
          row: rowNumber,
          data: savedMOU
        });

      } catch (error) {
        results.errors.push({
          row: rowNumber,
          data: row,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Bulk import completed',
      results: {
        totalRows: jsonData.length,
        successCount: results.success.length,
        errorCount: results.errors.length,
        duplicateCount: results.duplicates.length,
        details: results
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error processing Excel file: ' + error.message
    });
  }
}));

// Route for bulk importing students from Excel
app.post('/api/participants/import', authenticateToken, upload.single('excelFile'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Excel file is required'
    });
  }

  try {
    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Excel file is empty or invalid'
      });
    }

    const results = {
      success: [],
      errors: [],
      duplicates: []
    };

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2;

      try {
        // Sanitize string fields
        const participantData = {};
        const stringFields = [
          'batchNo', 'rank', 'serialNumberRRU', 'enrollmentNumber', 'fullName',
          'birthPlace', 'birthState', 'country', 'aadharNo', 'mobileNumber',
          'alternateNumber', 'email', 'address'
        ];

        // Map and sanitize data from Excel row
        participantData.srNo = parseInt(row.srNo || row.SrNo || row.serialNumber || '0');
        participantData.batchNo = sanitizeInput(row.batchNo || row.BatchNo || '');
        participantData.rank = sanitizeInput(row.rank || row.Rank || '');
        participantData.serialNumberRRU = sanitizeInput(row.serialNumberRRU || row.SerialNumberRRU || '');
        participantData.enrollmentNumber = sanitizeInput(row.enrollmentNumber || row.EnrollmentNumber || '');
        participantData.fullName = sanitizeInput(row.fullName || row.FullName || '');
        participantData.gender = row.gender || row.Gender || '';
        participantData.dateOfBirth = row.dateOfBirth || row.DateOfBirth || '';
        participantData.birthPlace = sanitizeInput(row.birthPlace || row.BirthPlace || '');
        participantData.birthState = sanitizeInput(row.birthState || row.BirthState || '');
        participantData.country = sanitizeInput(row.country || row.Country || '');
        participantData.aadharNo = sanitizeInput(row.aadharNo || row.AadharNo || '');
        participantData.mobileNumber = sanitizeInput(row.mobileNumber || row.MobileNumber || '');
        participantData.alternateNumber = sanitizeInput(row.alternateNumber || row.AlternateNumber || '');
        participantData.email = sanitizeInput(row.email || row.Email || '');
        participantData.address = sanitizeInput(row.address || row.Address || '');

        // Validate required fields
        const requiredFields = [
          'srNo', 'batchNo', 'rank', 'serialNumberRRU', 'enrollmentNumber',
          'fullName', 'gender', 'dateOfBirth', 'birthPlace', 'birthState',
          'country', 'aadharNo', 'mobileNumber', 'email', 'address'
        ];

        let missingFields = [];
        for (const field of requiredFields) {
          if (!participantData[field] || (field === 'srNo' && participantData[field] === 0)) {
            missingFields.push(field);
          }
        }

        if (missingFields.length > 0) {
          results.errors.push({
            row: rowNumber,
            data: row,
            error: `Missing required fields: ${missingFields.join(', ')}`
          });
          continue;
        }

        // Validate date format
        const dateOfBirth = new Date(participantData.dateOfBirth);
        if (isNaN(dateOfBirth.getTime())) {
          results.errors.push({
            row: rowNumber,
            data: row,
            error: 'Invalid date format for dateOfBirth'
          });
          continue;
        }
        participantData.dateOfBirth = dateOfBirth;

        // Check for duplicates
        const existingParticipant = await Candidate.findOne({
          $or: [
            { enrollmentNumber: participantData.enrollmentNumber },
            { aadharNo: participantData.aadharNo },
            { email: participantData.email.toLowerCase() }
          ]
        });

        if (existingParticipant) {
          results.duplicates.push({
            row: rowNumber,
            data: row,
            error: 'Participant with this enrollment number, Aadhar number, or email already exists'
          });
          continue;
        }

        // Create new participant
        const newParticipant = new Candidate(participantData);
        const savedParticipant = await newParticipant.save();
        
        results.success.push({
          row: rowNumber,
          data: savedParticipant
        });

      } catch (error) {
        results.errors.push({
          row: rowNumber,
          data: row,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Bulk import completed',
      results: {
        totalRows: jsonData.length,
        successCount: results.success.length,
        errorCount: results.errors.length,
        duplicateCount: results.duplicates.length,
        details: results
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error processing Excel file: ' + error.message
    });
  }
}));

// Route for bulk importing courses from Excel
app.post('/api/courses/import', authenticateToken, upload.single('excelFile'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Excel file is required'
    });
  }

  try {
    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Excel file is empty or invalid'
      });
    }

    const results = {
      success: [],
      errors: [],
      duplicates: []
    };

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2;

      try {
        // Sanitize inputs
        const mou_id = row.mou_id || row.mouId || row.MOU_ID || row.MOUId || '';
        const courseName = sanitizeInput(row.courseName || row.CourseName || '');
        const organization = sanitizeInput(row.organization || row.Organization || '');
        const duration = sanitizeInput(row.duration || row.Duration || '');
        const indoorCredits = parseInt(row.indoorCredits || row.IndoorCredits || '0');
        const outdoorCredits = parseInt(row.outdoorCredits || row.OutdoorCredits || '0');
        const field = sanitizeInput(row.field || row.Field || '');
        const startDate = row.startDate || row.StartDate || '';
        const completionStatus = row.completionStatus || row.CompletionStatus || 'upcoming';
        
        // Parse subjects array
        let subjects = [];
        try {
          if (row.subjects) {
            if (typeof row.subjects === 'string') {
              subjects = JSON.parse(row.subjects);
            } else {
              subjects = row.subjects;
            }
          }
        } catch (parseError) {
          results.errors.push({
            row: rowNumber,
            data: row,
            error: 'Invalid subjects format. Must be valid JSON array'
          });
          continue;
        }

        // Validate required fields
        if (!mou_id || !courseName || !organization || !duration || isNaN(indoorCredits) || isNaN(outdoorCredits) || !field || !startDate || !subjects || subjects.length === 0) {
          results.errors.push({
            row: rowNumber,
            data: row,
            error: 'Missing required fields (mou_id, courseName, organization, duration, indoorCredits, outdoorCredits, field, startDate, subjects)'
          });
          continue;
        }

        // Validate MOU ID format
        if (!mongoose.Types.ObjectId.isValid(mou_id)) {
          results.errors.push({
            row: rowNumber,
            data: row,
            error: 'Invalid MOU ID format'
          });
          continue;
        }

        // Check if MOU exists
        const existingMOU = await MOU.findById(mou_id);
        if (!existingMOU) {
          results.errors.push({
            row: rowNumber,
            data: row,
            error: 'MOU not found with the provided ID'
          });
          continue;
        }

        // Validate start date format
        const startDateObj = new Date(startDate);
        if (isNaN(startDateObj.getTime())) {
          results.errors.push({
            row: rowNumber,
            data: row,
            error: 'Invalid date format for startDate'
          });
          continue;
        }

        // Validate completion status
        const validStatuses = ['ongoing', 'completed', 'upcoming'];
        if (completionStatus && !validStatuses.includes(completionStatus)) {
          results.errors.push({
            row: rowNumber,
            data: row,
            error: 'completionStatus must be one of: ongoing, completed, upcoming'
          });
          continue;
        }

        // Validate subjects array
        let validSubjects = [];
        for (let j = 0; j < subjects.length; j++) {
          const subject = subjects[j];
          
          // Validate subject fields
          if (!subject.noOfPeriods || !subject.periodsMin || !subject.totalMins || !subject.totalHrs || subject.credits === undefined) {
            results.errors.push({
              row: rowNumber,
              data: row,
              error: `Subject ${j + 1}: Missing required fields (noOfPeriods, periodsMin, totalMins, totalHrs, credits)`
            });
            continue;
          }

          // Convert to numbers and validate
          const noOfPeriods = parseInt(subject.noOfPeriods);
          const periodsMin = parseInt(subject.periodsMin);
          const totalMins = parseInt(subject.totalMins);
          const totalHrs = parseInt(subject.totalHrs);
          const credits = parseInt(subject.credits);

          if (isNaN(noOfPeriods) || noOfPeriods < 1 || 
              isNaN(periodsMin) || periodsMin < 1 || 
              isNaN(totalMins) || totalMins < 1 || 
              isNaN(totalHrs) || totalHrs < 1 || 
              isNaN(credits) || credits < 0) {
            results.errors.push({
              row: rowNumber,
              data: row,
              error: `Subject ${j + 1}: Invalid numeric values`
            });
            continue;
          }

          validSubjects.push({
            noOfPeriods,
            periodsMin,
            totalMins,
            totalHrs,
            credits
          });
        }

        if (validSubjects.length === 0) {
          results.errors.push({
            row: rowNumber,
            data: row,
            error: 'At least one valid subject is required'
          });
          continue;
        }

        // Check for duplicate course name
        const existingCourse = await Course.findOne({ courseName: courseName.trim() });
        if (existingCourse) {
          results.duplicates.push({
            row: rowNumber,
            data: row,
            error: 'A course with this name already exists'
          });
          continue;
        }

        // Check if field exists, create if it doesn't
        const trimmedFieldName = field.trim();
        let existingField = await Field.findOne({ name: trimmedFieldName });
        if (!existingField) {
          const newField = new Field({
            name: trimmedFieldName,
            count: 1
          });
          await newField.save();
          existingField = newField;
        } else {
          existingField.count += 1;
          await existingField.save();
        }

        // Create new course
        const newCourse = new Course({
          mou_id: mou_id,
          courseName: courseName.trim(),
          organization: organization.trim(),
          duration: duration.trim(),
          indoorCredits: indoorCredits,
          outdoorCredits: outdoorCredits,
          field: existingField._id, // Use ObjectId reference instead of string
          startDate: startDateObj,
          completionStatus: completionStatus,
          subjects: validSubjects
        });

        try {
          const savedCourse = await newCourse.save();
          results.success.push({
            row: rowNumber,
            data: savedCourse
          });
        } catch (error) {
          if (error.code === 11000) {
            results.duplicates.push({
              row: rowNumber,
              data: row,
              error: 'A course with this name already exists'
            });
          } else {
            results.errors.push({
              row: rowNumber,
              data: row,
              error: error.message
            });
          }
        }

      } catch (error) {
        results.errors.push({
          row: rowNumber,
          data: row,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Bulk import completed',
      results: {
        totalRows: jsonData.length,
        successCount: results.success.length,
        errorCount: results.errors.length,
        duplicateCount: results.duplicates.length,
        details: results
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error processing Excel file: ' + error.message
    });
  }
}));

// Route for admin registration
app.post('/api/admin/register', asyncHandler(async (req, res) => {
  // Retrieve all the information about the new admin
  let { name, email, phoneNumber, password } = req.body;

  // Sanitize inputs
  name = sanitizeInput(name);
  email = sanitizeInput(email);
  phoneNumber = sanitizeInput(phoneNumber);

  // Validate required fields
  if (!name || !email || !phoneNumber || !password) {
    return res.status(400).json({
      success: false,
      error: 'All fields (name, email, phoneNumber, password) are required'
    });
  }

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
  if (existingAdmin) {
    return res.status(409).json({
      success: false,
      error: 'Admin with this email already exists'
    });
  }

  // Check if pending admin already exists
  const existingPendingAdmin = await PendingAdmin.findOne({ email: email.toLowerCase() });
  if (existingPendingAdmin) {
    return res.status(409).json({
      success: false,
      error: 'Registration request already pending for this email'
    });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create pending admin
  const pendingAdmin = new PendingAdmin({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phoneNumber: phoneNumber.trim(),
    password: hashedPassword
  });

  await pendingAdmin.save();

  // Send verification email using nodemailer with error handling
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured. Skipping email verification.');
      // Still create the admin but skip email
      const newAdmin = new Admin({
        name: pendingAdmin.name,
        email: pendingAdmin.email,
        phoneNumber: pendingAdmin.phoneNumber,
        password: pendingAdmin.password
      });
      await newAdmin.save();
      
      // Update pending admin status
      pendingAdmin.status = 'approved';
      pendingAdmin.processedDate = new Date();
      await pendingAdmin.save();

      return res.status(201).json({
        success: true,
        message: 'Admin registration completed successfully! You can now login.',
        admin: {
          id: newAdmin._id,
          name: newAdmin.name,
          email: newAdmin.email
        }
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Admin Registration Verification - Rashtriya Raksha University',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Admin Registration Verification</h2>
          <p>Dear ${name},</p>
          <p>You have registered in our website <strong>Rashtriya Raksha University</strong> as an admin. Is it you?</p>
          <p>Please confirm your registration by clicking one of the options below:</p>
          <div style="margin: 20px 0;">
            <a href="${process.env.BASE_URL || 'http://localhost:3000'}/api/admin/verify/yes/${pendingAdmin._id}" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; margin-right: 10px; border-radius: 5px;">
               YES
            </a>
            <a href="${process.env.BASE_URL || 'http://localhost:3000'}/api/admin/verify/no/${pendingAdmin._id}" 
               style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
               NO
            </a>
          </div>
          <p>If you did not register for this account, please click NO.</p>
          <p>Thank you,<br>Rashtriya Raksha University Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    // Continue with registration even if email fails
    console.log('Registration will continue without email verification');
  }

  res.status(201).json({
    success: true,
    message: 'Registration request submitted successfully. Please check your email for verification.',
    pendingAdminId: pendingAdmin._id
  });
}));

// Route for email verification - YES option (kept as GET for email links)
app.get('/api/admin/verify/yes/:pendingAdminId', asyncHandler(async (req, res) => {
  const pendingAdminId = sanitizeInput(req.params.pendingAdminId);

  // Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(pendingAdminId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid pending admin ID format'
    });
  }

  // Find the pending admin
  const pendingAdmin = await PendingAdmin.findById(pendingAdminId);
  if (!pendingAdmin) {
    return res.status(404).json({
      success: false,
      error: 'Pending admin not found'
    });
  }

  // Check if already processed
  if (pendingAdmin.status !== 'pending') {
    return res.status(400).json({
      success: false,
      error: 'Registration request already processed'
    });
  }

  // Create the admin
  const newAdmin = new Admin({
    name: pendingAdmin.name,
    email: pendingAdmin.email,
    phoneNumber: pendingAdmin.phoneNumber,
    password: pendingAdmin.password
  });

  await newAdmin.save();

  // Update pending admin status
  pendingAdmin.status = 'approved';
  pendingAdmin.processedDate = new Date();
  await pendingAdmin.save();

  res.json({
    success: true,
    message: 'Admin registration confirmed successfully! You can now login.',
    admin: {
      id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email
    }
  });
}));

// Route to save student previous courses
app.post('/api/students/previous-courses', authenticateToken, asyncHandler(async (req, res) => {
  const { previous_courses_certification } = req.body;
  const studentId = req.user.studentId; // Assuming the token contains studentId

  if (!studentId) {
    return res.status(400).json({
      success: false,
      error: 'Student ID not found in token'
    });
  }

  try {
    // Validate the data
    if (!Array.isArray(previous_courses_certification)) {
      return res.status(400).json({
        success: false,
        error: 'Previous courses data must be an array'
      });
    }

    // Validate each course entry
    for (const course of previous_courses_certification) {
      if (!course.organization_name || !course.course_name) {
        return res.status(400).json({
          success: false,
          error: 'Organization name and course name are required for each course'
        });
      }
    }

    // Find and update the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Update the previous courses
    student.previous_courses_certification = previous_courses_certification;
    await student.save();

    res.json({
      success: true,
      message: 'Previous courses saved successfully',
      data: {
        studentId: student._id,
        previousCoursesCount: previous_courses_certification.length
      }
    });

  } catch (error) {
    console.error('Error saving previous courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save previous courses'
    });
  }
}));

// List all BPR&D certification claims (basic listing; add auth as needed)
app.get('/api/bprnd/claims', authenticateToken, asyncHandler(async (req, res) => {
  console.log('🚀 Admin route /api/bprnd/claims called');
  const { status } = req.query;
  console.log('📝 Query parameters:', { status });
  
  // If specific status requested, use it; otherwise show all claims that need admin attention
  const filter = status ? { status } : { 
    $or: [
      { poc_approved: true, admin_approved: { $ne: true } },  // POC approved, admin pending
      { poc_approved: false, admin_approved: false }          // Neither POC nor admin approved
    ]
  };
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
    
    res.json({ success: true, count: enhancedClaims.length, data: enhancedClaims });
  } catch (error) {
    console.error('❌ Error in admin route:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}));

// Approve a claim as Admin
app.post('/api/bprnd/claims/:claimId/approve', authenticateToken, asyncHandler(async (req, res) => {
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
        }
      }
      
      console.log(`✅ Marked ${coursesToMarkIds.length} contributing courses as certificateContributed: true with detailed contribution info`);
      console.log(`📋 Marked course IDs:`, coursesToMarkIds);
    }

    // Recalculate cumulative counts for all courses in this discipline
    // Use the converted discipline name for the recalculation
    await recalculateCumulativeCounts(claim.studentId, disciplineForQuery);

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
      const CertificateCourseMapping = require('../model3/certificate_course_mapping');
      
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

// Decline a claim as Admin
app.post('/api/bprnd/claims/:claimId/decline', authenticateToken, asyncHandler(async (req, res) => {
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

// Get all certificate course mappings
app.get('/api/certificate-course-mappings', authenticateToken, asyncHandler(async (req, res) => {
  try {
    console.log('🚀 Admin route /api/certificate-course-mappings called');
    
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

    // Import the CertificateCourseMapping model
    const CertificateCourseMapping = require('../model3/certificate_course_mapping');

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
        courseCount: mapping.courses.length,
        // Format dates for better readability
        createdAt: mapping.createdAt ? new Date(mapping.createdAt).toLocaleDateString() : null,
        updatedAt: mapping.updatedAt ? new Date(mapping.updatedAt).toLocaleDateString() : null
      };
    });

    console.log(`📊 Admin can see ${enhancedMappings.length} certificate course mappings`);
    console.log(`💡 Total mappings in database: ${totalCount}`);

    res.json({ 
      success: true, 
      count: enhancedMappings.length,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
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

// Get certificate course mapping by ID
app.get('/api/certificate-course-mappings/:mappingId', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { mappingId } = req.params;
    console.log(`🚀 Admin route /api/certificate-course-mappings/${mappingId} called`);

    // Import the CertificateCourseMapping model
    const CertificateCourseMapping = require('../model3/certificate_course_mapping');

    const mapping = await CertificateCourseMapping.findById(mappingId)
      .populate('certificateId', 'certificateNo')
      .populate('studentId', 'name email')
      .lean();

    if (!mapping) {
      return res.status(404).json({ 
        success: false, 
        error: 'Certificate course mapping not found' 
      });
    }

    // Calculate additional fields
    const totalCreditsUsed = mapping.courses.reduce((sum, course) => sum + course.creditsUsed, 0);
    const remainingCredits = Math.max(0, mapping.totalCreditsRequired - totalCreditsUsed);
    const creditEfficiency = mapping.totalCreditsRequired > 0 
      ? Math.round((totalCreditsUsed / mapping.totalCreditsRequired) * 100) 
      : 0;

    const enhancedMapping = {
      ...mapping,
      totalCreditsUsed,
      remainingCredits,
      creditEfficiency,
      courseCount: mapping.courses.length
    };

    console.log(`📋 Admin retrieved mapping: ${mappingId}`);
    console.log(`   Certificate: ${mapping.certificateId?.certificateNo || 'N/A'}`);
    console.log(`   Student: ${mapping.studentId?.name || 'N/A'}`);
    console.log(`   Courses: ${mapping.courses.length}`);

    res.json({ 
      success: true, 
      data: enhancedMapping 
    });

  } catch (error) {
    console.error('❌ Error fetching certificate course mapping:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching certificate course mapping',
      details: error.message 
    });
  }
}));

// Get certificate course mappings for a specific student
app.get('/api/certificate-course-mappings/student/:studentId', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    console.log(`🚀 Admin route /api/certificate-course-mappings/student/${studentId} called`);

    // Import the CertificateCourseMapping model
    const CertificateCourseMapping = require('../model3/certificate_course_mapping');

    // Validate student ID format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID format'
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const totalCount = await CertificateCourseMapping.countDocuments({ studentId });
    
    // Fetch mappings for the specific student
    const mappings = await CertificateCourseMapping.find({ studentId })
      .populate('certificateId', 'certificateNo')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    if (mappings.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No certificate course mappings found for this student'
      });
    }

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

    // Calculate summary statistics for the student
    const summary = {
      totalMappings: totalCount,
      totalCertificates: totalCount,
      totalCreditsEarned: enhancedMappings.reduce((sum, m) => sum + m.totalCreditsRequired, 0),
      totalCreditsUsed: enhancedMappings.reduce((sum, m) => sum + m.totalCreditsUsed, 0),
      umbrellaBreakdown: {}
    };

    enhancedMappings.forEach(mapping => {
      if (!summary.umbrellaBreakdown[mapping.umbrellaKey]) {
        summary.umbrellaBreakdown[mapping.umbrellaKey] = {
          certificates: 0,
          totalCredits: 0,
          usedCredits: 0
        };
      }
      
      summary.umbrellaBreakdown[mapping.umbrellaKey].certificates++;
      summary.umbrellaBreakdown[mapping.umbrellaKey].totalCredits += mapping.totalCreditsRequired;
      summary.umbrellaBreakdown[mapping.umbrellaKey].usedCredits += mapping.totalCreditsUsed;
    });

    console.log(`📊 Admin retrieved ${enhancedMappings.length} mappings for student ${studentId}`);
    console.log(`   Total mappings for student: ${totalCount}`);

    res.json({
      success: true,
      count: enhancedMappings.length,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      summary,
      data: enhancedMappings
    });

  } catch (error) {
    console.error('❌ Error fetching student certificate course mappings:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching student certificate course mappings',
      details: error.message
    });
  }
}));

// Get pending credits for a specific student
app.get('/api/pending-credits/:studentId', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Validate student ID format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID format'
      });
    }

    // Find pending credits for the given student ID (POC approved first, then admin)
    const pendingCredits = await PendingCredits.find({ 
      studentId: studentId,
      bprnd_poc_approved: true,
      admin_approved: false
    }).sort({ createdAt: -1 });
    
    if (!pendingCredits || pendingCredits.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No pending credits found for this student'
      });
    }

    res.json({
      success: true,
      message: `Found ${pendingCredits.length} pending credits for student`,
      data: {
        studentId: studentId,
        count: pendingCredits.length,
        pendingCredits: pendingCredits
      }
    });

  } catch (error) {
    console.error('Error fetching pending credits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending credits',
      details: error.message
    });
  }
}));

// Decline pending credits by student ID
app.post('/api/pending-credits/:studentId/decline', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Validate student ID format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID format'
      });
    }

    // Find all pending credits documents for the given student ID
    const pendingCredits = await PendingCredits.find({ studentId: studentId });
    
    if (!pendingCredits || pendingCredits.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No pending credits found for this student'
      });
    }

    // Update all found documents: set admin_approved to false and status to declined
    const updatePromises = pendingCredits.map(async (pendingCredit) => {
      pendingCredit.admin_approved = false;
      pendingCredit.status = 'declined';
      return pendingCredit.save();
    });

    await Promise.all(updatePromises);

    console.log(`✅ Declined ${pendingCredits.length} pending credits for student ${studentId}`);

    res.json({
      success: true,
      message: `Successfully declined ${pendingCredits.length} pending credits`,
      data: {
        studentId: studentId,
        declinedCount: pendingCredits.length,
        declinedAt: new Date(),
        declinedBy: req.user?.email || 'admin'
      }
    });

  } catch (error) {
    console.error('Error declining pending credits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to decline pending credits',
      details: error.message
    });
  }
}));

// Note: Count-only routes removed - counts are now calculated in frontend from full data

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
