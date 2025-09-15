const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.poc' });

const app = express();
const PORT = process.env.PORT || 3003;

// Import models
const POCBPRND = require('./model3/pocbprnd');
const MOU = require('./models/MOU');

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:8080'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'BPRND POC API',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ 
      status: 'OK', 
      message: 'Database connection successful',
      database: mongoose.connection.db.databaseName
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// POC Login endpoint
app.post('/api/poc/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 BPRND POC Login attempt:', {
      origin: req.get('origin'),
      userAgent: req.get('user-agent'),
      body: { email, password: '[HIDDEN]' }
    });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find POC by email
    const poc = await POCBPRND.findOne({ email: email.toLowerCase() });
    if (!poc) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await poc.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        pocId: poc._id, 
        email: poc.email,
        organization: poc.organization,
        type: 'bprnd-poc'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('✅ POC login successful:', poc.email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      poc: {
        id: poc._id,
        name: poc.name,
        email: poc.email,
        organization: poc.organization,
        mous: poc.mous
      }
    });

  } catch (error) {
    console.error('❌ POC login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get POC profile (protected route)
app.get('/api/poc/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const poc = await POCBPRND.findById(decoded.pocId).populate('mous');
    
    if (!poc) {
      return res.status(404).json({
        success: false,
        error: 'POC not found'
      });
    }

    res.json({
      success: true,
      poc: poc.toPublicJSON()
    });

  } catch (error) {
    console.error('❌ Get POC profile error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get POC MOUs
app.get('/api/poc/mous', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const poc = await POCBPRND.findById(decoded.pocId).populate('mous');
    
    if (!poc) {
      return res.status(404).json({
        success: false,
        error: 'POC not found'
      });
    }

    res.json({
      success: true,
      mous: poc.mous || []
    });

  } catch (error) {
    console.error('❌ Get POC MOUs error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POC Registration endpoint
app.post('/api/poc/register', async (req, res) => {
  try {
    const { name, email, password, mobileNumber, organization } = req.body;

    // Validate input
    if (!name || !email || !password || !mobileNumber || !organization) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Check if POC already exists
    const existingPOC = await POCBPRND.findOne({ email: email.toLowerCase() });
    if (existingPOC) {
      return res.status(400).json({
        success: false,
        error: 'POC with this email already exists'
      });
    }

    // Create new POC
    const newPOC = new POCBPRND({
      name,
      email: email.toLowerCase(),
      password,
      mobileNumber,
      organization,
      mous: []
    });

    await newPOC.save();

    console.log('✅ New POC registered:', email);

    res.status(201).json({
      success: true,
      message: 'POC registered successfully',
      poc: newPOC.toPublicJSON()
    });

  } catch (error) {
    console.error('❌ POC registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log('Database:', process.env.MONGODB_URI);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BPRND POC API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test DB: http://localhost:${PORT}/test-db`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS Origins: ${process.env.ALLOWED_ORIGINS}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
  process.exit(0);
});
