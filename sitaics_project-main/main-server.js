const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import route modules
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const pocRoutes = require('./routes/poc');
const bprndPocRoutes = require('./routes/bprnd-poc');
const bprndStudentRoutes = require('./routes/bprnd-student');

const app = express();
const PORT = process.env.MAIN_PORT || 3000;

// CORS Configuration - Allow all necessary origins
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://127.0.0.1:5173',
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      process.env.NODE_ENV !== 'production'
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle CORS preflight requests
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/files', express.static(path.join(__dirname, 'uploads', 'pdfs')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose
  .connect('mongodb://localhost:27017/sitaics')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Unified API Server is running',
    timestamp: new Date().toISOString(),
    services: {
      admin: 'Available at /admin/*',
      student: 'Available at /student/*',
      poc: 'Available at /poc/*',
      bprndPoc: 'Available at /bprnd-poc/*',
      bprndStudent: 'Available at /bprnd-student/*'
    }
  });
});

// Route mounting with prefixes
app.use('/admin', adminRoutes);
app.use('/student', studentRoutes);
app.use('/poc', pocRoutes);
app.use('/bprnd-poc', bprndPocRoutes);
app.use('/bprnd-student', bprndStudentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'BPR&D Training Management System - Unified API',
    version: '2.0.0',
    endpoints: {
      admin: '/admin/*',
      student: '/student/*',
      poc: '/poc/*',
      bprndPoc: '/bprnd-poc/*',
      bprndStudent: '/bprnd-student/*',
      health: '/health'
    },
    documentation: 'See individual route files for specific endpoints'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.originalUrl}`,
    availableEndpoints: {
      admin: '/admin/*',
      student: '/student/*',
      poc: '/poc/*',
      bprndPoc: '/bprnd-poc/*',
      bprndStudent: '/bprnd-student/*'
    }
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n🚀 ================================');
  console.log('🎯 BPR&D Unified API Server Started');
  console.log('🚀 ================================');
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log('\n📋 Available Services:');
  console.log('   📊 Admin API:        /admin/*');
  console.log('   👨‍🎓 Student API:      /student/*');
  console.log('   👮‍♀️ POC API:          /poc/*');
  console.log('   🎖️  BPR&D POC API:    /bprnd-poc/*');
  console.log('   🎓 BPR&D Student API: /bprnd-student/*');
  console.log(`\n💡 Health Check: http://localhost:${PORT}/health`);
  console.log('🚀 ================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});

module.exports = app;
