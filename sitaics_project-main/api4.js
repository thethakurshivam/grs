const express = require('express');

const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');

const path = require('path');
const fs = require('fs');
const CreditCalculation = require('./model3/bprndstudents');
const umbrella = require('./model3/umbrella');

// Load environment variables from .env.api4 file
require('dotenv').config({ path: '.env.api4' });

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 3004;

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

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:8081',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:8081',
      ];

      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV === 'development'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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

// Mount router
app.use('/', router);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'BPRND Student API is running' });
});

// Database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    // Test database connection by counting students
    const studentCount = await CreditCalculation.countDocuments();
    const umbrellaCount = await umbrella.countDocuments();

    res.json({
      status: 'OK',
      message: 'Database connection successful',
      data: {
        totalStudents: studentCount,
        totalUmbrellas: umbrellaCount,
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
