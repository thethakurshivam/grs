const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
require('dotenv').config();

// Debug: Check if environment variables are loaded
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'LOADED' : 'NOT LOADED');
console.log('Current working directory:', process.cwd());

const app = express();
const PORT = process.env.PORT || 3000;

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
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'], // Allow multiple frontend ports
  credentials: true
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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sispa')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import MOU schema
const MOU = require('../models/MOU');
const Course = require('../models/courses');
const School = require('../models/school');
const Field = require('../models/fields');
const Admin = require('../models/admin');
const PendingAdmin = require('../models/pendingAdmin');
const Candidate = require('../models/students');

// Input sanitization helper
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, ''); // Remove basic HTML tags
  }
  return input;
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
  const mous = await MOU.find();
  res.json({
    success: true,
    count: mous.length,
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
  
  const mou = await MOU.findById(mouId);
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

    // Create new MOU
    const newMOU = new MOU({
      ID: ID.trim(),
      school: school.trim(),
      nameOfPartnerInstitution: nameOfPartnerInstitution.trim(),
      strategicAreas: strategicAreas.trim(),
      dateOfSigning: signingDate,
      validity: validity.trim(),
      affiliationDate: affiliationDateObj
    });

    const savedMOU = await newMOU.save();

    res.status(201).json({
      success: true,
      message: 'MOU created successfully',
      data: savedMOU
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error creating MOU: ' + error.message
    });
  }
}));

// Route to get all courses with filtering
app.get('/api/courses', authenticateToken, asyncHandler(async (req, res) => {
  const { 
    completionStatus, 
    field, 
    organization, 
    startDateFrom, 
    startDateTo,
    mou_id,
    sortBy = 'startDate',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (completionStatus) {
    filter.completionStatus = completionStatus;
  }
  
  if (field) {
    filter.field = { $regex: field, $options: 'i' }; // Case-insensitive search
  }
  
  if (organization) {
    filter.organization = { $regex: organization, $options: 'i' }; // Case-insensitive search
  }
  
  if (mou_id) {
    // Validate MOU ID format
    if (!mongoose.Types.ObjectId.isValid(mou_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid MOU ID format'
      });
    }
    filter.mou_id = mou_id;
  }
  
  // Date range filtering
  if (startDateFrom || startDateTo) {
    filter.startDate = {};
    if (startDateFrom) {
      filter.startDate.$gte = new Date(startDateFrom);
    }
    if (startDateTo) {
      filter.startDate.$lte = new Date(startDateTo);
    }
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  try {
    const courses = await Course.find(filter).sort(sort);
    
    // Calculate completion status based on start date and duration if needed
    const coursesWithCalculatedStatus = courses.map(course => {
      const courseObj = course.toObject();
      
      // If completion status is not set, calculate it based on start date
      if (!courseObj.completionStatus || courseObj.completionStatus === 'upcoming') {
        const now = new Date();
        const startDate = new Date(courseObj.startDate);
        
        if (startDate > now) {
          courseObj.completionStatus = 'upcoming';
        } else {
          // For simplicity, assume ongoing if started but not explicitly completed
          courseObj.completionStatus = 'ongoing';
        }
      }
      
      return courseObj;
    });

    res.json({
      success: true,
      count: coursesWithCalculatedStatus.length,
      data: coursesWithCalculatedStatus,
      filters: {
        completionStatus,
        field,
        organization,
        startDateFrom,
        startDateTo,
        mou_id
      }
    });
  } catch (error) {
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

    // Check if field exists, create or update (similar to MOU->School relationship)
    const trimmedFieldName = field.trim();
    let existingField = await Field.findOne({ nameOfTheField: trimmedFieldName });

    if (!existingField) {
      const newField = new Field({
        nameOfTheField: trimmedFieldName,
        count: 1
      });
      await newField.save();
    } else {
      existingField.count += 1;
      await existingField.save();
    }

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
      field: trimmedFieldName,
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



  
 

// Route to get all schools with their information and links
app.get('/api/schools', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const schools = await School.find();
    
    // Transform schools into format with links for frontend
    const schoolsWithLinks = schools.map(school => ({
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
  
  // Find all MOUs that belong to this school
  const schoolMOUs = await MOU.find({ school: schoolName });
  
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
  const mou = await MOU.findById(mouId);
  if (!mou) {
    return res.status(404).json({
      success: false,
      error: 'MOU not found'
    });
  }
  
  // Find all courses for this MOU
  const courses = await Course.find({ mou_id: mouId });
  
  res.json({
    success: true,
    mou: mou,
    count: courses.length,
    data: courses
  });
}));

// Route to get total number of participants trained
app.get('/api/participants', authenticateToken, asyncHandler(async (req, res) => {
  const participants = await Candidate.find();
  res.json({
    success: true,
    count: participants.length,
    data: participants
  });
}));

// Route to get all fields as links
app.get('/api/fields', authenticateToken, asyncHandler(async (req, res) => {
  const allFields = await Field.find();
  
  // Transform fields into link format for frontend
  const fieldLinks = allFields.map(field => ({
    id: field._id,
    nameOfTheField: field.nameOfTheField,
    count: field.count,
    link: `/api/fields/${field._id}` // Link that will hit another route when clicked
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
  const fieldCourses = await Course.find({ field: field.nameOfTheField });
  
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

        // Check if school exists, create or update
        const trimmedSchoolName = nameOfPartnerInstitution.trim();
        let existingSchool = await School.findOne({ name: trimmedSchoolName });

        if (!existingSchool) {
          const newSchool = new School({
            name: trimmedSchoolName,
            count: 1
          });
          await newSchool.save();
        } else {
          existingSchool.count += 1;
          await existingSchool.save();
        }

        // Create new MOU
        const newMOU = new MOU({
          ID: ID.trim(),
          school: school.trim(),
          nameOfPartnerInstitution: trimmedSchoolName,
          strategicAreas: strategicAreas.trim(),
          dateOfSigning: signingDate,
          validity: validity.trim(),
          affiliationDate: affiliationDateObj
        });

        const savedMOU = await newMOU.save();
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

        // Create new course
        const newCourse = new Course({
          mou_id: mou_id,
          courseName: courseName.trim(),
          organization: organization.trim(),
          duration: duration.trim(),
          indoorCredits: indoorCredits,
          outdoorCredits: outdoorCredits,
          field: field.trim(),
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
