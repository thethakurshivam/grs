const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const Student = require('./models1/student'); // Updated path to match project structure
const Course = require('./models/courses');
const MOU = require('./models/MOU');
require('dotenv').config({ path: '.env.student' });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// JWT Secret - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// MongoDB connection error handling
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Add preflight handling
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: err.message 
  });
});

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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
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
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: true,
    message: 'API is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Student registration route - No authentication required
app.post('/students', async (req, res) => {
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
app.post('/students/login', async (req, res) => {
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
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        studentId: student._id, 
        full_name: student.full_name 
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
        full_name: student.full_name
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

// Route to add previous course certification with PDF
app.post('/students/:id/previous-certifications', authenticateToken, upload.single('certificate_pdf'), async (req, res) => {
  try {
    const studentId = req.params.id;
    const { organization_name, course_name } = req.body;
    
    const previousCourse = {
      organization_name,
      course_name,
      certificate_pdf: req.file.id
    };

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $push: { previous_courses_certification: previousCourse } },
      { new: true }
    );

    res.status(200).json(updatedStudent);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Route to get all courses by Student ID
app.get('/student/:studentId/courses', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find the student first to get their MOU ID
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Find all courses that match the student's MOU ID
    const courses = await Course.find({ mou_id: student.mou_id });

    // Send the courses to the frontend
    res.status(200).json(courses);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to add course ID to student's course_id array
app.put('/students/:studentId/courses/:courseId', authenticateToken, async (req, res) => {
    try {
      const { studentId, courseId } = req.params;
  
      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        { $push: { course_id: courseId } },
        { new: true }
      );
  
      if (!updatedStudent) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      res.status(200).json(updatedStudent);
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Route to get student profile by student ID
app.get('/students/:id', authenticateToken, async (req, res) => {
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

    // Send the student profile to the frontend
    res.status(200).json({
      success: true,
      student: student
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Route to get student's available credits by student ID
app.get('/students/:id/available-credits', authenticateToken, async (req, res) => {
    try {
      const studentId = req.params.id;
  
      // Find the student by ID and select only the available_credit field
      const student = await Student.findById(studentId).select('available_credit');
  
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      // Send the available credit to the frontend
      res.status(200).json({
        available_credit: student.available_credit
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Route to get student's used credits by student ID
  app.get('/students/:id/used-credits', authenticateToken, async (req, res) => {
    try {
      const studentId = req.params.id;
  
      // Find the student by ID and select only the used_credit field
      const student = await Student.findById(studentId).select('used_credit');
  
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      // Send the used credit to the frontend
      res.status(200).json({
        used_credit: student.used_credit
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  // Route to get completed courses by student ID
app.get('/students/:id/completed-courses', authenticateToken, async (req, res) => {
    try {
      const studentId = req.params.id;
  
      // Find the student by ID and select only the course_id field
      const student = await Student.findById(studentId).select('course_id');
  
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      // Get all course IDs from the student
      const courseIds = student.course_id;
  
      if (!courseIds || courseIds.length === 0) {
        return res.status(200).json([]);
      }
  
      // Find all courses with the matching IDs and completion status as 'completed'
      const completedCourses = await Course.find({
        _id: { $in: courseIds },
        completionStatus: 'completed'
      });
  
      // Send the completed courses to the frontend
      res.status(200).json(completedCourses);
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});