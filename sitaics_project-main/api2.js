const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if(!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',  // Vite dev server
      'http://localhost:3000',  // React dev server
      'http://localhost:8080',  // Alternative dev server
      'http://localhost:8081',  // Alternative dev server
      'http://127.0.0.1:5173',  // Vite with IP
      'http://127.0.0.1:3000',  // React with IP
      'http://127.0.0.1:8080',  // Alternative with IP
      'http://127.0.0.1:8081'   // Alternative with IP
    ];
    
    // Add custom frontend URL from environment if provided
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    
    if(allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked request from:', origin);
      // For development, allow all origins
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));

// Handle preflight requests
app.options('*', cors());

// Import models
const poc = require('./models2/poc');
const MOU = require('./models/MOU');
const Course = require('./models/courses');
const Student = require('./models1/student');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'poc-secret-key';

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File upload attempt:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'text/csv' ||
        file.mimetype === 'text/plain' ||
        file.originalname.endsWith('.csv') ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')) {
      console.log('✅ File accepted:', file.originalname);
      cb(null, true);
    } else {
      console.log('❌ File rejected:', file.originalname, 'MIME type:', file.mimetype);
      cb(new Error('Only Excel and CSV files are allowed'), false);
    }
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Log CORS configuration
console.log('CORS Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('- Allowed origins for development:', [
  'http://localhost:5173',
  'http://localhost:3000', 
  'http://localhost:8080',
  'http://localhost:8081'
].join(', '));

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

// Authentication Middleware
const authenticatePOC = (req, res, next) => {
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

// Test route to verify CORS is working
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// POC Login Route (Public - no authentication required)
app.post('/api/poc/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find POC by email
    const pocUser = await poc.findOne({ email: email.toLowerCase() });
    
    if (!pocUser) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await pocUser.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        pocId: pocUser._id, 
        email: pocUser.email,
        name: pocUser.name,
        organization: pocUser.organization
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      data: pocUser.toPublicJSON()
    });

  } catch (error) {
    console.error('POC Login Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POC Registration Route (Public - no authentication required)
app.post('/api/poc/register', async (req, res) => {
  try {
    const { name, email, password, mobileNumber, organization, mous } = req.body;

    // Validate input
    if (!name || !email || !password || !mobileNumber || !organization || !mous) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Check if POC already exists
    const existingPOC = await poc.findOne({ email: email.toLowerCase() });
    
    if (existingPOC) {
      return res.status(400).json({
        success: false,
        error: 'POC with this email already exists'
      });
    }

    // Create new POC
    const newPOC = new poc({
      name,
      email: email.toLowerCase(),
      password,
      mobileNumber,
      organization,
      mous
    });

    await newPOC.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        pocId: newPOC._id, 
        email: newPOC.email,
        name: newPOC.name,
        organization: newPOC.organization
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: 'POC registered successfully',
      token: token,
      data: newPOC.toPublicJSON()
    });

  } catch (error) {
    console.error('POC Registration Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Protected Routes - All routes below this require authentication

// API route to get POC information and related courses
app.get('/api/poc/:pocId/courses', authenticatePOC, async (req, res) => {
  try {
    const { pocId } = req.params;

    // Verify that the authenticated POC is accessing their own data
    if (req.user.pocId !== pocId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own data.'
      });
    }

    // Get POC information
    const pocInfo = await poc.findById(pocId).populate('mous');
    
    if (!pocInfo) {
      return res.status(404).json({
        success: false,
        error: 'POC not found'
      });
    }

    // Get all MOU IDs from the POC's mous field
    const mouIds = pocInfo.mous.map(mou => mou._id);

    // Get all courses that have any of the MOU IDs
    const courses = await Course.find({
      mou_id: { $in: mouIds }
    });

    res.json({
      success: true,
      data: {
        poc: pocInfo,
        courses: courses
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// API route to get POC information and related MOUs
app.get('/api/poc/:pocId/mous', authenticatePOC, async (req, res) => {
  try {
    const { pocId } = req.params;

    // Verify that the authenticated POC is accessing their own data
    if (req.user.pocId !== pocId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own data.'
      });
    }

    // Get POC information
    const pocInfo = await poc.findById(pocId).populate('mous');
    
    if (!pocInfo) {
      return res.status(404).json({
        success: false,
        error: 'POC not found'
      });
    }

    // Get all MOU IDs from the POC's mous field
    const mouIds = pocInfo.mous.map(mou => mou._id);

    // Get all MOUs that have the same MOU IDs as in the POC's mous field
    const mous = await MOU.find({
      _id: { $in: mouIds }
    });

    res.json({
      success: true,
      data: {
        poc: pocInfo,
        mous: mous
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// API route to get POC information and related students
app.get('/api/poc/:pocId/students', authenticatePOC, async (req, res) => {
  try {
    const { pocId } = req.params;

    // Verify that the authenticated POC is accessing their own data
    if (req.user.pocId !== pocId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own data.'
      });
    }

    // Get POC information
    const pocInfo = await poc.findById(pocId).populate('mous');
    
    if (!pocInfo) {
      return res.status(404).json({
        success: false,
        error: 'POC not found'
      });
    }

    // Get all MOU IDs from the POC's mous field
    const mouIds = pocInfo.mous.map(mou => mou._id.toString());

    // Get all students that have the same MOU IDs as in the POC's mous field
    const students = await Student.find({
      mou_id: { $in: mouIds }
    });

    res.json({
      success: true,
      data: {
        poc: pocInfo,
        students: students
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});


/// Route for bulk importing students from Excel
app.post('/api/poc/:pocId/bulk-import-students', authenticatePOC, upload.single('file'), async (req, res) => {
  try {
    const { pocId } = req.params;
    
    // Verify that the authenticated POC is accessing their own data
    if (req.user.pocId !== pocId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own data.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'File is required'
      });
    }

    const { mouId, courseId } = req.body;

    const XLSX = require('xlsx');
    
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
      errors: []
    };

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2;

      try {
        // Hash the default password
        const defaultPassword = 'password123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Extract data from Excel row (only fields that come from Excel)
        const studentData = {
          srNo: parseInt(row.srNo || '0'),
          batchNo: (row.batchNo || '').toString().trim(),
          rank: (row.rank || '').toString().trim(),
          serialNumberRRU: (row.serialNumberRRU || '').toString().trim(),
          enrollmentNumber: (row.enrollmentNumber || '').toString().trim(),
          fullName: (row.fullName || '').toString().trim(),
          gender: (row.gender || '').toString().trim(),
          dateOfBirth: new Date(row.dateOfBirth || ''),
          birthPlace: (row.birthPlace || '').toString().trim(),
          birthState: (row.birthState || '').toString().trim(),
          country: (row.country || '').toString().trim(),
          aadharNo: (row.aadharNo || '').toString().trim(),
          mobileNumber: (row.mobileNumber || '').toString().trim(),
          alternateNumber: (row.alternateNumber || '').toString().trim(),
          email: (row.email || '').toString().trim().toLowerCase(),
          address: (row.address || '').toString().trim(),
          mou_id: mouId,
          course_id: [courseId],
          credits: 0,
          available_credit: 0,
          used_credit: 0
        };

        // Create new student
        const newStudent = new Student(studentData);
        const savedStudent = await newStudent.save();

        // Send email with credentials (optional - won't fail import if email fails)
        try {
          if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransporter({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
              }
            });

            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: studentData.email,
              subject: 'Your Account Credentials',
              text: `Your email is your registered email and password is password123`
            };

            await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent successfully to ${studentData.email}`);
          } else {
            console.log(`⚠️ Email not configured - skipping email for ${studentData.email}`);
          }
        } catch (emailError) {
          console.log(`❌ Email sending failed for ${studentData.email}:`, emailError.message);
          // Don't fail the import for email errors
        }

        results.success.push({
          row: rowNumber,
          data: savedStudent
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
      message: 'Student bulk import completed',
      results: {
        totalRows: jsonData.length,
        successCount: results.success.length,
        errorCount: results.errors.length,
        details: results
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error processing Excel file: ' + error.message
    });
  }
});

// Explicitly set port to 3002
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`POC API Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
