const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const pocbprnd = require('./model3/pocbprnd');
const PendingCredits = require('./model3/pendingcredits');
const CourseHistory = require('./model3/course_history');
const Value = require('./model3/value');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const bprndStudents = require('./model3/bprndstudents');
const umbrella = require('./model3/umbrella');
const bprnd_certification_claim = require('./model3/bprnd_certification_claim');
const emailConfig = require('./email-config');
require('dotenv').config();

// Polyfill fetch if needed
const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: f }) => f(...args)));

const app = express();

// CORS Configuration - Allow all origins for development
const corsOptions = {
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle CORS preflight requests
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded PDFs statically so they are accessible via URL
app.use('/files', express.static(path.join(__dirname, 'uploads', 'pdfs')));

// MongoDB connection
mongoose
  .connect('mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Please upload only Excel files'), false);
    }
  },
});

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: emailConfig.EMAIL_SERVICE,
  auth: {
    user: emailConfig.EMAIL_USER,
    pass: emailConfig.EMAIL_PASS,
  },
});

// Test email configuration on startup
console.log('📧 Email Configuration:');
console.log('  Service:', emailConfig.EMAIL_SERVICE);
console.log('  User:', emailConfig.EMAIL_USER);
console.log('  Password:', emailConfig.EMAIL_PASS ? '***configured***' : 'NOT CONFIGURED');

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email transporter verification failed:', error);
  } else {
    console.log('✅ Email transporter verified successfully');
  }
});

// Bulk import BPRND students from Excel file
app.post(
  '/api/bprnd/students/upload',
  upload.single('excelFile'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No data found in Excel file',
        });
      }

      const results = [];
      const errors = [];

      for (const row of data) {
        try {
          // Validate required fields
          if (!row.Name || !row.Email) {
            errors.push({
              row: row,
              error: 'Missing required fields: Name and Email are required',
            });
            continue;
          }

          // Check if user already exists
          const existingUser = await bprndStudents.findOne({
            email: row.Email.toLowerCase().trim(),
          });

          if (existingUser) {
            errors.push({
              row: row,
              error: 'User with this email already exists',
            });
            continue;
          }

          // Create new user
          const newUser = new bprndStudents({
            Name: row.Name,
            Email: row.Email.toLowerCase().trim(),
            Designation: row.Designation || '',
            State: row.State || '',
            Organization: row.Organization || '',
            Umbrella: row.Umbrella || '',
            Total_Credits: 0,
          });

          await newUser.save();
          results.push({
            name: row.Name,
            email: row.Email,
            status: 'created',
          });

          // Send welcome email
          try {
            const mailOptions = {
              from: emailConfig.EMAIL_USER,
              to: row.Email,
              subject: 'RRU Portal Login Credentials',
              html: `
                <h2>Welcome to RRU Portal!</h2>
                <p>Hello ${row.Name},</p>
                <p>Your account has been created successfully in the RRU Portal.</p>
                <p>You can now login to the RRU portal with the following credentials:</p>
                <ul>
                  <li><strong>Email:</strong> ${row.Email}</li>
                  <li><strong>Password:</strong> Your registered password</li>
                </ul>
                <p>Please login and change your password after first login.</p>
                <p>Best regards,<br>RRU Portal Team</p>
              `,
            };

            await transporter.sendMail(mailOptions);
            console.log(`✅ Welcome email sent to ${row.Email}`);
          } catch (emailError) {
            console.error(`❌ Failed to send welcome email to ${row.Email}:`, emailError);
          }
        } catch (error) {
          errors.push({
            row: row,
            error: error.message,
          });
        }
      }

      res.status(200).json({
        success: true,
        message: `Bulk import completed. ${results.length} users created, ${errors.length} errors.`,
        data: {
          created: results,
          errors: errors,
        },
      });
    } catch (error) {
      console.error('Bulk import error:', error);
      res.status(500).json({
        success: false,
        message: 'Bulk import failed',
        error: error.message,
      });
    }
  }
);

// Login route
app.post('/api/bprnd/poc/login', async (req, res) => {
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
    const user = await pocbprnd.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password using the method defined in the schema
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: '24h',
      }
    );

    // Return success response with token and user data (without password)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Retrieve all pending credit records that need BPRND POC approval
app.get('/api/bprnd/pending-credits', async (req, res) => {
  try {
    console.log('🔍 BPRND POC requesting pending credits...');
    
    // Only show credits that are initial requests (neither admin nor POC approved yet)
    const records = await PendingCredits.find({ 
      admin_approved: false,
      bprnd_poc_approved: false 
    }).sort({ createdAt: -1 }).lean();
    
    console.log(`📊 Found ${records.length} initial pending credits for BPRND POC review`);
    console.log('🔍 Query criteria: admin_approved: false, bprnd_poc_approved: false');
    
    // Log each record for debugging
    records.forEach((rec, index) => {
      console.log(`📋 Record ${index + 1}: ID=${rec._id}, Student=${rec.name}, Admin Approved=${rec.admin_approved}, POC Approved=${rec.bprnd_poc_approved}, Status=${rec.status}`);
    });

    const withUrls = records.map((rec) => {
      const fileName = rec?.pdf ? path.basename(rec.pdf) : '';
      const pdfUrl = fileName
        ? `${req.protocol}://${req.get('host')}/files/${fileName}`
        : null;
      const acceptUrl = `${req.protocol}://${req.get('host')}/api/bprnd/pending-credits/${rec._id}/accept`;
      const rejectUrl = `${req.protocol}://${req.get('host')}/api/bprnd/pending-credits/${rec._id}/reject`;
      return {
        id: rec._id,
        studentId: rec.studentId,
        name: rec.name,
        organization: rec.organization,
        discipline: rec.discipline,
        totalHours: rec.totalHours,
        noOfDays: rec.noOfDays,
        pdf: pdfUrl,
        admin_approved: rec.admin_approved,
        bprnd_poc_approved: rec.bprnd_poc_approved,
        status: rec.status || 'pending',
        acceptUrl,
        rejectUrl,
        createdAt: rec.createdAt,
        updatedAt: rec.updatedAt
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Pending credits retrieved successfully',
      data: withUrls,
    });
  } catch (error) {
    console.error('Error retrieving pending credits:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Accept (approve) a pending credit by BPRND POC
app.post('/api/bprnd/pending-credits/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pending credit ID format'
      });
    }

    // Find and update the pending credit
    const pendingCredit = await PendingCredits.findByIdAndUpdate(
      id,
      { 
        bprnd_poc_approved: true,
        status: 'poc_approved'
      },
      { new: true }
    );
    
    console.log(`🔍 POC Approval Debug:`, {
      pendingCreditId: id,
      adminApproved: pendingCredit.admin_approved,
      pocApproved: pendingCredit.bprnd_poc_approved,
      status: pendingCredit.status,
      discipline: pendingCredit.discipline,
      totalHours: pendingCredit.totalHours
    });

    if (!pendingCredit) {
      return res.status(404).json({
        success: false,
        message: 'Pending credit request not found'
      });
    }

    // POC approval successful - waiting for admin approval
    console.log(`✅ POC approval successful for pending credit ${id}`);

    res.json({
      success: true,
      message: 'BPRND POC approval successful. Waiting for admin approval.',
      data: {
        id: pendingCredit._id,
        admin_approved: pendingCredit.admin_approved,
        bprnd_poc_approved: pendingCredit.bprnd_poc_approved,
        status: 'poc_approved'
      }
    });

  } catch (error) {
    console.error('Error accepting pending credit:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting pending credit: ' + error.message
    });
  }
});

// Reject (decline) a pending credit by BPRND POC
app.post('/api/bprnd/pending-credits/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pending credit ID format'
      });
    }

    // Find and update the pending credit
    const pendingCredit = await PendingCredits.findByIdAndUpdate(
      id,
      { 
        bprnd_poc_approved: false,
        status: 'declined'
      },
      { new: true }
    );

    if (!pendingCredit) {
      return res.status(404).json({
        success: false,
        message: 'Pending credit request not found'
      });
    }

    res.json({
      success: true,
      message: 'BPRND POC rejection successful.',
      data: {
        id: pendingCredit._id,
        admin_approved: pendingCredit.admin_approved,
        bprnd_poc_approved: pendingCredit.bprnd_poc_approved,
        status: 'declined'
      }
    });

  } catch (error) {
    console.error('Error rejecting pending credit:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting pending credit: ' + error.message
    });
  }
});

// Get count of pending credits for BPRND POC dashboard
app.get('/api/bprnd/pending-credits/count', async (req, res) => {
  try {
    const count = await PendingCredits.countDocuments({ 
      admin_approved: false,
      bprnd_poc_approved: false 
    });

    res.status(200).json({
      success: true,
      message: 'Pending credits count retrieved successfully',
      data: {
        pendingCount: count,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error counting pending credits:', error);
    res.status(500).json({
      success: false,
      message: 'Error counting pending credits',
      error: error.message,
    });
  }
});

// Get pending credits for a specific student
app.get('/api/bprnd/pending-credits/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Validate student ID format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    // Find pending credits for the specific student (initial requests)
    const records = await PendingCredits.find({ 
      studentId: studentId,
      admin_approved: false,
      bprnd_poc_approved: false 
    }).sort({ createdAt: -1 }).lean();
    
    if (!records || records.length === 0) {
      return res.status(404).json({
        success: true,
        message: 'No pending credits found for this student',
        data: []
      });
    }

    const withUrls = records.map((rec) => {
      const fileName = rec?.pdf ? path.basename(rec.pdf) : '';
      const pdfUrl = fileName
        ? `${req.protocol}://${req.get('host')}/files/${fileName}`
        : null;
      const acceptUrl = `${req.protocol}://${req.get('host')}/api/bprnd/pending-credits/${rec._id}/accept`;
      const rejectUrl = `${req.protocol}://${req.get('host')}/api/bprnd/pending-credits/${rec._id}/reject`;
      
      return {
        id: rec._id,
        studentId: rec.studentId,
        name: rec.name,
        organization: rec.organization,
        discipline: rec.discipline,
        totalHours: rec.totalHours,
        noOfDays: rec.noOfDays,
        pdf: pdfUrl,
        admin_approved: rec.admin_approved,
        bprnd_poc_approved: rec.bprnd_poc_approved,
        status: rec.status || 'pending',
        acceptUrl,
        rejectUrl,
        createdAt: rec.createdAt,
        updatedAt: rec.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      message: `Found ${records.length} pending credits for student`,
      data: withUrls
    });

  } catch (error) {
    console.error('Error fetching pending credits:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending credits',
      error: error.message
    });
  }
});

// Get BPRND certification claims for POC review
app.get('/api/bprnd/claims', async (req, res) => {
  try {
    const { status } = req.query;
    
    // POC sees only initial requests (neither POC nor admin approved yet)
    let query = { 
      poc_approved: { $ne: true },  // POC has not approved yet
      admin_approved: { $ne: true }  // Admin has not approved yet
    };
    
    if (status) {
      query.status = status;
    }

    const claims = await bprnd_certification_claim.find(query)
      .populate('studentId', 'Name Email Designation State Organization')
      .sort({ createdAt: -1 })
      .lean();

    // Enhance claims with additional information
    const enhancedClaims = claims.map(claim => {
      const umbrellaLabel = claim.umbrellaKey ? claim.umbrellaKey.replace(/_/g, ' ') : 'Unknown';
      const courseCount = claim.courses ? claim.courses.length : 0;
      const totalCreditsFromCourses = claim.courses ? 
        claim.courses.reduce((sum, course) => sum + (course.creditsEarned || 0), 0) : 0;

      return {
        ...claim,
        umbrellaLabel,
        courseCount,
        totalCreditsFromCourses,
        courses: claim.courses || []
      };
    });

    res.status(200).json({
      success: true,
      message: 'BPRND claims retrieved successfully',
      data: enhancedClaims
    });

  } catch (error) {
    console.error('Error retrieving BPRND claims:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving BPRND claims',
      error: error.message
    });
  }
});

// Approve BPRND certification claim
app.post('/api/bprnd/claims/:claimId/approve', async (req, res) => {
  try {
    const { claimId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim ID format'
      });
    }

    const claim = await bprnd_certification_claim.findByIdAndUpdate(
      claimId,
      { 
        status: 'poc_approved',
        poc_approved: true,
        poc_approved_at: new Date()
      },
      { new: true }
    );

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // POC approval successful - waiting for admin approval
    console.log(`✅ POC approval successful for claim ${claimId}`);

    res.status(200).json({
      success: true,
      message: 'Claim approved by POC. Waiting for admin approval.',
      data: claim
    });

  } catch (error) {
    console.error('Error approving claim:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving claim',
      error: error.message
    });
  }
});

// Decline BPRND certification claim
app.post('/api/bprnd/claims/:claimId/decline', async (req, res) => {
  try {
    const { claimId } = req.params;
    const { reason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim ID format'
      });
    }

    const claim = await bprnd_certification_claim.findByIdAndUpdate(
      claimId,
      { 
        status: 'declined',
        poc_approved: false,
        declined_reason: reason,
        declined_at: new Date()
      },
      { new: true }
    );

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Claim declined successfully',
      data: claim
    });

  } catch (error) {
    console.error('Error declining claim:', error);
    res.status(500).json({
      success: false,
      message: 'Error declining claim',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS error: Origin not allowed',
      error: err.message
    });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const PORT = process.env.BPRND_PORT || 3003;
const server = app.listen(PORT, () => {
  console.log(`BPRND POC API Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
  console.log('CORS enabled for:', corsOptions.origin);
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;
