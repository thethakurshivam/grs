const express = require('express');

const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');

const path = require('path');
const fs = require('fs');
const CreditCalculation = require('./model3/bprndstudents');
const umbrella = require('./model3/umbrella');
const Credit = require('./model3/credit');
const multer = require('multer');
const PendingCredits = require('./model3/pendingcredits'); // Import your schema

// Load environment variables from .env.api4 file
require('dotenv').config({ path: '.env.api4' });

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 3004;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'pdfs');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory:', uploadsDir);
  }
} catch (e) {
  console.warn('⚠️ Could not ensure uploads dir:', e?.message);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics';

// Connect to MongoDB with options
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log('Database:', MONGODB_URI);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// MongoDB connection event handlers
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
});

// CORS Configuration - Permissive for development
app.use(
  cors({
    origin: true, // Allow all origins for development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Login route for BPRND students
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 BPRND Login attempt:', {
      origin: req.get('Origin'),
      userAgent: req.get('User-Agent'),
      body: {
        email: req.body?.email,
        password: req.body?.password ? '[HIDDEN]' : 'undefined',
      },
    });

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const student = await CreditCalculation.findOne({
      email: email.toLowerCase(),
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if password exists (since it's not required in schema)
    if (!student.password) {
      return res.status(401).json({
        success: false,
        message:
          'Account not properly configured. Please contact administrator.',
      });
    }

    // Direct password comparison (no hashing)
    if (password !== student.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: student._id,
        email: student.email,
        name: student.Name,
        designation: student.Designation,
        state: student.State,
      },
      process.env.JWT_SECRET || 'bprnd-student-secret-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove password from response
    const studentData = student.toObject();
    delete studentData.password;

    // Send success response with token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      student: studentData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get BPRND student profile by ID
router.get('/student/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID parameter
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required',
      });
    }

    console.log('Fetching BPRND student profile for ID:', id);

    // Find student by ID in credit_calculations collection
    const student = await CreditCalculation.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Remove password from response for security
    const studentData = student.toObject();
    delete studentData.password;

    console.log('BPRND student profile found:', {
      id: studentData._id,
      name: studentData.Name,
      email: studentData.email,
      designation: studentData.Designation,
      state: studentData.State,
      umbrella: studentData.Umbrella,
    });

    // Send success response with complete student data
    res.status(200).json({
      success: true,
      message: 'Student profile retrieved successfully',
      student: studentData,
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);

    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get BPRND student's total credits by ID
router.get('/student/:id/credits', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required',
      });
    }

    // Fetch only the Total_Credits field for efficiency
    const student = await CreditCalculation.findById(id).select('Total_Credits');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Total credits retrieved successfully',
      data: {
        id: student._id,
        totalCredits: student.Total_Credits,
      },
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    console.error('Error fetching total credits:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get BPRND student's umbrella credits breakdown by ID
router.get('/student/:id/credits/breakdown', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required',
      });
    }

    // Project only the umbrella credit fields for efficiency
    const projection = {
      Cyber_Security: 1,
      Criminology: 1,
      Military_Law: 1,
      Police_Administration: 1,
      Forensic_Science: 1,
      National_Security: 1,
      International_Security: 1,
      Counter_Terrorism: 1,
      Intelligence_Studies: 1,
      Emergency_Management: 1,
    };

    const student = await CreditCalculation.findById(id).select(projection);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Ensure all fields are numbers (fallback to 0 if undefined)
    const data = {
      Cyber_Security: Number(student.Cyber_Security || 0),
      Criminology: Number(student.Criminology || 0),
      Military_Law: Number(student.Military_Law || 0),
      Police_Administration: Number(student.Police_Administration || 0),
      Forensic_Science: Number(student.Forensic_Science || 0),
      National_Security: Number(student.National_Security || 0),
      International_Security: Number(student.International_Security || 0),
      Counter_Terrorism: Number(student.Counter_Terrorism || 0),
      Intelligence_Studies: Number(student.Intelligence_Studies || 0),
      Emergency_Management: Number(student.Emergency_Management || 0),
    };

    return res.status(200).json({
      success: true,
      message: 'Credits breakdown retrieved successfully',
      data,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }
    console.error('Error fetching credits breakdown:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Pending credits upload (PDF)
router.post('/pending-credits', upload.single('pdf'), async (req, res) => {
  try {
    const { name, organization } = req.body;

    // Validate required fields
    if (!name || !organization || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Name, organization, and PDF file are required'
      });
    }

    // Create new pending credit record
    const pendingCredit = new PendingCredits({
      name: name,
      organization: organization,
      pdf: req.file.path // Store the file path
    });

    // Save to database
    const savedRecord = await pendingCredit.save();

    res.status(201).json({
      success: true,
      message: 'Pending credit record created successfully',
      data: savedRecord
    });

  } catch (error) {
    console.error('Error creating pending credit:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Internal server error'
    });
  }
});




// Mount router
app.use('/', router);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'BPRND Student API is running' });
});

// Database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    // Test database connection by counting documents
    const studentCount = await CreditCalculation.countDocuments();
    const umbrellaCount = await umbrella.countDocuments();
    const creditCount = await Credit.countDocuments();

    res.json({
      status: 'OK',
      message: 'Database connection successful',
      data: {
        totalStudents: studentCount,
        totalUmbrellas: umbrellaCount,
        totalCredits: creditCount,
        database: MONGODB_URI.split('/').pop(),
      },
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`BPRND Student API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
