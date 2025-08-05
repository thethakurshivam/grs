const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if(!origin) return callback(null, true);
    
    const allowedOrigins = process.env.FRONTEND_URL ? 
      [process.env.FRONTEND_URL] : 
      ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081'];
    
    if(allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('CORS blocked request from:', origin);
      callback(null, true); // Allow all origins for now to debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Import models
const poc = require('./models2/poc');
const MOU = require('./models/MOU');
const Course = require('./models/courses');
const Student = require('./models1/student');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'poc-secret-key';

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
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

// Explicitly set port to 3002
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`POC API Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
