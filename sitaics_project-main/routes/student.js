const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Import models
const Student = require('../models1/student');
const Course = require('../models/courses');
const MOU = require('../models/MOU');
const School = require('../models/school');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
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

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Health check route to verify database connection
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: true,
    message: 'API is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Student registration route - No authentication required
router.post('/', async (req, res) => {
  try {
    const {
      sr_no,
      batch_no,
      rank,
      serial_number,
      enrollment_number,
      full_name,
      gender,
      dob,
      birth_place,
      birth_state,
      country,
      aadhar_no,
      mobile_no,
      alternate_number,
      email,
      password,
      address,
      mou_id
    } = req.body;

    // Check if student already exists by name
    const existingStudent = await Student.findOne({ full_name: full_name });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        error: 'Student with this name already exists'
      });
    }

    // Hash the password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new student
    const newStudent = new Student({
      sr_no: sr_no || null,
      batch_no: batch_no || '',
      rank: rank || '',
      serial_number: serial_number || '',
      enrollment_number: enrollment_number || '',
      full_name,
      gender: gender || '',
      dob: dob || null,
      birth_place: birth_place || '',
      birth_state: birth_state || '',
      country: country || '',
      aadhar_no: aadhar_no || '',
      mobile_no: mobile_no || '',
      alternate_number: alternate_number || '',
      email: email ? email.toLowerCase() : '',
      password: hashedPassword,
      address: address || '',
      mou_id: mou_id || '',
      credits: 0,
      available_credit: 0,
      used_credit: 0
    });

    const savedStudent = await newStudent.save();

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: {
        id: savedStudent._id,
        full_name: savedStudent.full_name
      }
    });

  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Student login route - No authentication required
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find student by email
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Compare password
    const isPasswordValid = await student.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: student._id, 
        email: student.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      student: {
        id: student._id,
        full_name: student.full_name,
        email: student.email
      }
    });

  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add previous certifications route
router.post('/:id/previous-certifications', authenticateToken, upload.single('certificate_pdf'), async (req, res) => {
  try {
    const studentId = req.params.id;
    const { organization_name, course_name } = req.body;
    
    const previousCourse = {
      organization_name,
      course_name,
      certificate_pdf: req.file ? req.file.filename : null
    };

    const student = await Student.findByIdAndUpdate(
      studentId,
      { $push: { previous_certifications: previousCourse } },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Previous certification added successfully',
      data: student.previous_certifications
    });

  } catch (error) {
    console.error('Add previous certification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get student courses route
router.get('/:studentId/courses', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Get all courses
    const courses = await Course.find({});

    res.json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error('Get student courses error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get student profile route
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find the student by ID
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Remove password from response
    const studentData = student.toObject();
    delete studentData.password;

    res.json({
      success: true,
      data: studentData
    });

  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available credits route
router.get('/:id/available-credits', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find the student by ID
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Calculate available credits from course history
    const CourseHistory = require('../model3/course_history');
    const courseHistories = await CourseHistory.find({ studentId: studentId });
    
    const totalCredits = courseHistories.reduce((total, course) => {
      return total + (course.creditsEarned || 0);
    }, 0);

    res.json({
      success: true,
      data: {
        available_credit: totalCredits
      }
    });

  } catch (error) {
    console.error('Get available credits error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get used credits route
router.get('/:id/used-credits', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find the student by ID and select only the used_credit field
    const student = await Student.findById(studentId).select('used_credit');
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: {
        used_credit: student.used_credit
      }
    });

  } catch (error) {
    console.error('Get used credits error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get completed courses route
router.get('/:id/completed-courses', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find the student by ID
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Get completed courses from course history
    const CourseHistory = require('../model3/course_history');
    const courseHistories = await CourseHistory.find({ studentId: studentId });

    res.json({
      success: true,
      data: courseHistories
    });

  } catch (error) {
    console.error('Get completed courses error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get student profile route (duplicate - this is exactly as in api1.js)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find the student by ID
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Remove password from response
    const studentData = student.toObject();
    delete studentData.password;

    res.json({
      success: true,
      data: studentData
    });

  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get upcoming courses route
router.get('/courses/upcoming', async (req, res) => {
  try {
    // Find courses that are scheduled to start in the future
    const currentDate = new Date();
    const upcomingCourses = await Course.find({
      startDate: { $gt: currentDate },
    }).sort({ startDate: 1 });

    res.json({
      success: true,
      data: upcomingCourses
    });

  } catch (error) {
    console.error('Get upcoming courses error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Enroll in course route
router.put('/:studentId/courses/:courseId', authenticateToken, async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Retrieve student from student ID
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Retrieve course from course ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if student is already enrolled in this course
    if (student.course_id && student.course_id.includes(courseId)) {
      return res.status(400).json({
        success: false,
        error: 'Student is already enrolled in this course'
      });
    }

    // Add course to student's enrolled courses
    await Student.findByIdAndUpdate(
      studentId,
      { $push: { course_id: courseId } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        course_id: courseId,
        course_name: course.course_name
      }
    });

  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get enrolled courses route
router.get('/:studentId/enrolled-courses', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Get course details for enrolled courses
    const enrolledCourses = await Course.find({
      _id: { $in: student.course_id || [] }
    });

    res.json({
      success: true,
      data: enrolledCourses
    });

  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;