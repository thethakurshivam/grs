const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const pocbprnd = require('../model3/pocbprnd');
const PendingCredits = require('../model3/pendingcredits');
const CourseHistory = require('../model3/course_history');
const Value = require('../model3/value');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const bprndStudents = require('../model3/bprndstudents');
const UmbrellaModel = require('../model3/umbrella');
const bprnd_certification_claim = require('../model3/bprnd_certification_claim');

const router = express.Router();

// Polyfill fetch if needed
const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: f }) => f(...args)));

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
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'trinayan.1303@gmail.com',
    pass: process.env.EMAIL_PASS || 'sfnw ucmk zunl zmra',
  },
});

// Test email configuration on startup
console.log('📧 Email Configuration:');
console.log('  Service:', process.env.EMAIL_SERVICE || 'gmail');
console.log('  User:', process.env.EMAIL_USER || 'trinayan.1303@gmail.com');
console.log('  Password:', process.env.EMAIL_PASS ? '***configured***' : 'NOT CONFIGURED');

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email transporter verification failed:', error);
  } else {
    console.log('✅ Email transporter verified successfully');
  }
});

// Test route to verify API is working
router.get('/test', (req, res) => {
  console.log('✅ Test route hit');
  res.json({ message: 'BPRND POC API is working!' });
});

// Bulk import BPRND students from Excel file
router.post(
  '/students/upload',
  upload.single('excelFile'),
  async (req, res) => {
    console.log('🚀 BPRND students upload route hit');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    try {
      if (!req.file) {
        console.log('❌ No file uploaded');
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      // Get umbrella from form data
      const { umbrella } = req.body;
      if (!umbrella) {
        return res.status(400).json({
          success: false,
          message: 'Umbrella selection is required',
        });
      }

      console.log('Processing bulk import for umbrella:', umbrella);
      console.log('File received:', req.file.originalname, 'Size:', req.file.size);

      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      console.log('Excel data rows:', data.length);

      if (data.length > 0) {
        console.log('📊 First row structure:', Object.keys(data[0]));
        console.log('📊 Sample data:', data[0]);
      }

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
          // Normalize all fields
          const normalizedRow = {
            Name: row.Name || row.name,
            Email: row.Email || row.email,
            Designation: row.Designation || row.designation || '',
            State: row.State || row.state || '',
            Organization: row.Organization || row.organization || '',

            Training_Topic: row.Training_Topic || row.training_topic || '',
            Per_session_minutes: row.Per_session_minutes || row.per_session_minutes || 0,
            Theory_sessions: row.Theory_sessions || row.theory_sessions || 0,
            Practical_sessions: row.Practical_sessions || row.practical_sessions || 0,
            Theory_Hours: row.Theory_Hours || row.theory_hours || 0,
            Practical_Hours: row.Practical_Hours || row.practical_hours || 0,
            Total_Hours: row.Total_Hours || row.total_hours || 0,
            Theory_Credits: row.Theory_Credits || row.theory_credits || 0,
            Practical_Credits: row.Practical_Credits || row.practical_credits || 0,
            Total_Credits: row.Total_Credits || row.total_credits || 0,
            date_of_birth: row.date_of_birth,
          };

          // Handle Excel numeric dates → JS Date
          if (typeof normalizedRow.date_of_birth === 'number') {
            normalizedRow.date_of_birth = new Date(
              Math.round((normalizedRow.date_of_birth - 25569) * 86400 * 1000)
            );
          } else if (normalizedRow.date_of_birth) {
            normalizedRow.date_of_birth = new Date(normalizedRow.date_of_birth);
          } else {
            normalizedRow.date_of_birth = new Date('1990-01-01');
          }

          // Validate required fields
          if (!normalizedRow.Name || !normalizedRow.Email) {
            errors.push({
              row,
              error: `Missing required fields: Name and Email are required. Found: Name="${normalizedRow.Name}", Email="${normalizedRow.Email}"`,
            });
            continue;
          }

          // Check if user already exists
          const existingUser = await bprndStudents.findOne({
            email: normalizedRow.Email.toLowerCase().trim(),
          });

          if (existingUser) {
            errors.push({
              row,
              error: 'User with this email already exists',
            });
            continue;
          }

          // Create new user with dynamic umbrella handling
          // First, fetch available umbrellas from database
          const availableUmbrellas = await UmbrellaModel.find().select('name');
          
          // Initialize all umbrella fields to 0
          const umbrellaCredits = {};
          availableUmbrellas.forEach(umbrellaItem => {
            const fieldName = umbrellaItem.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
            umbrellaCredits[fieldName] = 0;
          });

          // Set the student's specific umbrella to their earned credits
          const selectedUmbrellaField = umbrella.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
          if (umbrellaCredits.hasOwnProperty(selectedUmbrellaField)) {
            umbrellaCredits[selectedUmbrellaField] = normalizedRow.Total_Credits;
            console.log(`🎯 Assigning ${normalizedRow.Total_Credits} credits to umbrella field: ${selectedUmbrellaField}`);
          } else {
            console.warn(`⚠️ Warning: Umbrella '${umbrella}' not found in database. Available umbrellas:`, availableUmbrellas.map(u => u.name));
          }

          console.log(`🔍 DEBUG: Umbrella credits object:`, umbrellaCredits);

          const newUser = new bprndStudents({
            Name: normalizedRow.Name,
            email: normalizedRow.Email.toLowerCase().trim(),
            Designation: normalizedRow.Designation,
            State: normalizedRow.State,
            Organization: normalizedRow.Organization,
            Umbrella: umbrella,
            password: 'password123', // Default password for bulk imported students

            Training_Topic: normalizedRow.Training_Topic,
            Per_session_minutes: normalizedRow.Per_session_minutes,
            Theory_sessions: normalizedRow.Theory_sessions,
            Practical_sessions: normalizedRow.Practical_sessions,
            Theory_Hours: normalizedRow.Theory_Hours,
            Practical_Hours: normalizedRow.Practical_Hours,
            Total_Hours: normalizedRow.Total_Hours,
            Theory_Credits: normalizedRow.Theory_Credits,
            Practical_Credits: normalizedRow.Practical_Credits,
            Total_Credits: normalizedRow.Total_Credits,
            date_of_birth: normalizedRow.date_of_birth,

            // Dynamic umbrella credit fields
            ...umbrellaCredits,
          });

          // Debug: Log what we're trying to save
          console.log('🔍 DEBUG: Attempting to save user with data:', JSON.stringify(newUser.toObject(), null, 2));
          console.log('🔍 DEBUG: Schema validation should pass for all required fields');

          await newUser.save();
          
          // Create corresponding entry in coursehistories collection
          try {
            const courseHistoryEntry = new CourseHistory({
              studentId: newUser._id,
              name: normalizedRow.Training_Topic,
              organization: 'CDTI', // Default organization for bulk imported courses
              discipline: umbrella,
              theoryHours: normalizedRow.Theory_Hours,
              practicalHours: normalizedRow.Practical_Hours,
              totalHours: normalizedRow.Total_Hours,
              noOfDays: 1, // Default to 1 day for now
              theoryCredits: normalizedRow.Theory_Credits,
              practicalCredits: normalizedRow.Practical_Credits,
              creditsEarned: normalizedRow.Total_Credits,
              count: normalizedRow.Total_Credits, // Same value as Total Credits
              certificateContributed: false
            });

            await courseHistoryEntry.save();
            console.log(`✅ Course history entry created for: ${normalizedRow.Training_Topic}`);
          } catch (courseHistoryError) {
            console.error(`❌ Failed to create course history entry for ${normalizedRow.Training_Topic}:`, courseHistoryError);
            // Don't fail the entire import if course history creation fails
          }

          results.push({
            name: normalizedRow.Name,
            email: normalizedRow.Email,
            status: 'created',
          });

          console.log(`✅ User created: ${normalizedRow.Name} (${normalizedRow.Email})`);

          // Send welcome email
          try {
            const mailOptions = {
              from: process.env.EMAIL_USER || 'trinayan.1303@gmail.com',
              to: normalizedRow.Email,
              subject: 'RRU Portal Login Credentials',
              html: `
                <h2>Welcome to RRU Portal!</h2>
                <p>Hello ${normalizedRow.Name},</p>
                <p>Your account has been created successfully in the RRU Portal.</p>
                <p>You can now login to the RRU portal with the following credentials:</p>
                <ul>
                  <li><strong>Email:</strong> ${normalizedRow.Email}</li>
                  <li><strong>Password:</strong> password123</li>
                </ul>
                <p><strong>Important:</strong> Please login and change your password after first login for security.</p>
                <p>Best regards,<br>RRU Portal Team</p>
              `,
            };

            await transporter.sendMail(mailOptions);
            console.log(`✅ Welcome email sent to ${normalizedRow.Email}`);
          } catch (emailError) {
            console.error(`❌ Failed to send welcome email to ${normalizedRow.Email}:`, emailError);
          }
        } catch (error) {
          console.error('❌ ERROR: Failed to save user:', error);
          console.error('❌ ERROR: Validation details:', error.errors);
          console.error('❌ ERROR: Full error object:', JSON.stringify(error, null, 2));
          errors.push({
            row,
            error: error.message,
          });
        }
      }

      console.log(`Bulk import completed: ${results.length} created, ${errors.length} errors`);

      res.status(200).json({
        success: true,
        message: `Bulk import completed. ${results.length} users created, ${errors.length} errors.`,
        data: {
          totalProcessed: data.length,
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

// Login route for frontend compatibility
router.post('/poc/login', async (req, res) => {
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
        pocId: user._id,
        email: user.email,
        organization: user.organization,
        type: 'bprnd-poc',
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
      poc: {
        id: user._id,
        name: user.name,
        email: user.email,
        organization: user.organization,
        mous: []
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Login route
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
      poc: {
        id: user._id,
        name: user.name,
        email: user.email,
        organization: user.organization,
        mous: []
      },
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
router.get('/pending-credits', async (req, res) => {
  try {
    console.log('🔍 BPRND POC requesting pending credits...');
    
    // Show credits that are waiting for BPRND POC approval (POC approves first, then admin)
    const records = await PendingCredits.find({ 
      bprnd_poc_approved: false,
      status: { $nin: ['declined', 'poc_declined'] }  // Exclude both old and new declined requests
    }).sort({ createdAt: -1 }).lean();
    
    console.log(`📊 Found ${records.length} initial pending credits for BPRND POC review`);
    console.log('🔍 Query criteria: bprnd_poc_approved: false, status not in [declined, poc_declined]');
    
    // Log each record for debugging
    records.forEach((rec, index) => {
      console.log(`📋 Record ${index + 1}: ID=${rec._id}, Student=${rec.name}, Admin Approved=${rec.admin_approved}, POC Approved=${rec.bprnd_poc_approved}, Status=${rec.status}`);
    });

    const withUrls = records.map((rec) => {
      const fileName = rec?.pdf ? path.basename(rec.pdf) : '';
      const pdfUrl = fileName
        ? `${req.protocol}://${req.get('host')}/files/${fileName}`
        : null;
      const acceptUrl = `${req.protocol}://${req.get('host')}/api/bprnd-poc/pending-credits/${rec._id}/accept`;
      const rejectUrl = `${req.protocol}://${req.get('host')}/api/bprnd-poc/pending-credits/${rec._id}/reject`;
      return {
        id: rec._id,
        studentId: rec.studentId,
        name: rec.name,
        organization: rec.organization,
        discipline: rec.discipline,
        theoryHours: rec.theoryHours,
        practicalHours: rec.practicalHours,
        theoryCredits: rec.theoryCredits,
        practicalCredits: rec.practicalCredits,
        totalHours: rec.totalHours,
        calculatedCredits: rec.calculatedCredits,
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
router.post('/pending-credits/:id/accept', async (req, res) => {
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
        status: 'pending'
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
        status: 'pending'
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
router.post('/pending-credits/:id/reject', async (req, res) => {
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
        status: 'poc_declined'
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
        status: 'poc_declined'
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

// Get pending credits for a specific student
router.get('/pending-credits/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Validate student ID format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    // Find pending credits for the specific student (waiting for POC approval)
    const records = await PendingCredits.find({ 
      studentId: studentId,
      bprnd_poc_approved: false,
      status: { $nin: ['declined', 'poc_declined'] }  // Exclude both old and new declined requests
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
      const acceptUrl = `${req.protocol}://${req.get('host')}/api/bprnd-poc/pending-credits/${rec._id}/accept`;
      const rejectUrl = `${req.protocol}://${req.get('host')}/api/bprnd-poc/pending-credits/${rec._id}/reject`;
      
      return {
        id: rec._id,
        studentId: rec.studentId,
        name: rec.name,
        organization: rec.organization,
        discipline: rec.discipline,
        theoryHours: rec.theoryHours,
        practicalHours: rec.practicalHours,
        theoryCredits: rec.theoryCredits,
        practicalCredits: rec.practicalCredits,
        totalHours: rec.totalHours,
        calculatedCredits: rec.calculatedCredits,
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
router.get('/claims', async (req, res) => {
  try {
    const { status } = req.query;
    
    // POC sees only requests that POC has not approved yet
    let query = { 
      poc_approved: { $ne: true },  // POC has not approved yet
      status: { $nin: ['poc_declined', 'admin_declined'] } // Exclude declined claims
    };
    
    if (status) {
      // If status is provided, ensure it's not declined
      if (status !== 'poc_declined' && status !== 'admin_declined') {
        query.status = status;
      }
      // If status is declined, keep the original filter (will return empty results)
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
router.post('/claims/:claimId/approve', async (req, res) => {
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
        status: 'pending',
        poc_approved: true,
        poc_approved_at: new Date()
      },
      { new: true, runValidators: false }
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
router.post('/claims/:claimId/decline', async (req, res) => {
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
        status: 'poc_declined',
        poc_approved: false,
        declined_reason: reason,
        declined_at: new Date()
      },
      { new: true, runValidators: false }
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

// Get declined BPRND certification claims
router.get('/declined-certificates-request', async (req, res) => {
  try {
    // Find all certification claims with status 'poc_declined' or 'admin_declined'
    const declinedClaims = await bprnd_certification_claim.find({
      status: { $in: ['poc_declined', 'admin_declined'] }
    })
    .populate('studentId', 'Name Email Designation State Organization')
    .sort({ declined_at: -1, createdAt: -1 })
    .lean();

    // Transform the data to include additional information
    const transformedClaims = declinedClaims.map(claim => {
      // Calculate total credits from courses
      const totalCredits = claim.courses.reduce((sum, course) => sum + (course.creditsEarned || 0), 0);
      
      // Get the most recent decline reason and date
      const declineInfo = {
        reason: claim.declined_reason || 'No reason provided',
        declinedAt: claim.declined_at || claim.updatedAt,
        declinedBy: claim.status === 'poc_declined' ? 'POC' : 'Admin'
      };

      return {
        _id: claim._id,
        studentId: claim.studentId,
        umbrellaKey: claim.umbrellaKey,
        qualification: claim.qualification,
        requiredCredits: claim.requiredCredits,
        status: claim.status,
        totalCredits,
        courses: claim.courses,
        declineInfo,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
        notes: claim.notes
      };
    });

    res.status(200).json({
      success: true,
      message: 'Declined certification claims retrieved successfully',
      data: transformedClaims,
      count: transformedClaims.length
    });

  } catch (error) {
    console.error('Error retrieving declined certification claims:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving declined certification claims',
      error: error.message
    });
  }
});

// Get count of declined BPRND certification claims
router.get('/declined-certificates-request/count', async (req, res) => {
  try {
    // Count certification claims with status 'poc_declined' or 'admin_declined'
    const declinedCount = await bprnd_certification_claim.countDocuments({
      status: { $in: ['poc_declined', 'admin_declined'] }
    });

    res.json({
      success: true,
      message: 'Declined certification claims count retrieved successfully',
      data: {
        count: declinedCount
      }
    });

  } catch (error) {
    console.error('Error retrieving declined certification claims count:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving declined certification claims count',
      error: error.message
    });
  }
});

// Get count of pending credit requests for POC dashboard
router.get('/poc/pending-credits/count', async (req, res) => {
  try {
    // Count pending credits that are waiting for POC approval (neither POC nor admin approved yet)
    const pendingCreditsCount = await PendingCredits.countDocuments({
      bprnd_poc_approved: false,
      admin_approved: false
    });

    res.json({
      success: true,
      message: 'Pending credits count retrieved successfully',
      data: {
        count: pendingCreditsCount
      }
    });
  } catch (error) {
    console.error('Error fetching pending credits count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending credits count',
      details: error.message
    });
  }
});

// Get all umbrellas for BPRND bulk import
router.get('/umbrellas', async (req, res) => {
  try {
    const umbrellas = await UmbrellaModel.find({}).sort({ name: 1 }).lean();
    
    res.json({
      success: true,
      message: 'Umbrellas retrieved successfully',
      data: umbrellas
    });
  } catch (error) {
    console.error('Error fetching umbrellas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch umbrellas',
      error: error.message
    });
  }
});

// Get all BPRND students data from credit_calculation collection
router.get('/students', async (req, res) => {
  try {
    console.log('👥 Fetching all BPRND students from credit_calculations collection...');
    
    // Use the Mongoose model instead of raw MongoDB collection
    const students = await bprndStudents.find({}).lean();
    
    console.log(`✅ Found ${students.length} BPRND students in credit_calculations collection`);
    
    res.json({
      success: true,
      message: 'BPRND students data retrieved successfully',
      data: students,
      count: students.length
    });
  } catch (error) {
    console.error('❌ Error fetching BPRND students data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch BPRND students data',
      error: error.message
    });
  }
});

// Get discipline course counts from coursehistories collection for pie chart
router.get('/disciplines/count', async (req, res) => {
  try {
    console.log('📊 Fetching discipline course counts from coursehistories collection...');
    
    // Directly query the coursehistories collection
    const db = mongoose.connection.db;
    const coursehistoriesCollection = db.collection('coursehistories');
    
    // Aggregate to count courses by discipline
    const disciplineCounts = await coursehistoriesCollection.aggregate([
      {
        $group: {
          _id: '$discipline',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 } // Sort by count descending
      }
    ]).toArray();
    
    // Convert to the format needed for frontend
    const disciplineData = {};
    let totalCourses = 0;
    
    disciplineCounts.forEach(item => {
      if (item._id) { // Only include disciplines with valid names
        disciplineData[item._id] = item.count;
        totalCourses += item.count;
      }
    });
    
    console.log(`✅ Found ${disciplineCounts.length} disciplines with ${totalCourses} total courses`);
    console.log('📈 Discipline breakdown:', disciplineData);
    
    res.json({
      success: true,
      message: 'Discipline course counts retrieved successfully',
      data: disciplineData,
      totalCourses: totalCourses,
      disciplineCount: disciplineCounts.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching discipline course counts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discipline course counts',
      error: error.message
    });
  }
});

// Get declined requests for BPRND POC
router.get('/declined-requests', async (req, res) => {
  try {
    console.log('🔍 BPRND POC requesting declined requests...');
    
    // Find credits that have been declined by POC or Admin
    const declinedRequests = await PendingCredits.find({ 
      $or: [
        { status: 'poc_declined' },
        { status: 'admin_declined' },
        { status: 'declined' }
      ]
    }).sort({ updatedAt: -1 }).lean();
    
    console.log(`📊 Found ${declinedRequests.length} declined requests`);
    
    // Transform the data to match frontend expectations
    const transformedRequests = declinedRequests.map(request => ({
      id: request._id,
      studentId: request.studentId,
      name: request.name,
      organization: request.organization,
      discipline: request.discipline,
      theoryHours: request.theoryHours,
      practicalHours: request.practicalHours,
      totalHours: request.totalHours,
      calculatedCredits: request.calculatedCredits,
      noOfDays: request.noOfDays,
      pdf: request.pdf,
      status: request.status,
      admin_approved: request.admin_approved,
      bprnd_poc_approved: request.bprnd_poc_approved,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      declinedBy: request.status === 'poc_declined' ? 'POC' : 'Admin',
      declinedAt: request.updatedAt
    }));
    
    res.json({
      success: true,
      message: 'Declined requests retrieved successfully',
      data: transformedRequests
    });
    
  } catch (error) {
    console.error('❌ Error fetching declined requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch declined requests',
      error: error.message
    });
  }
});

// Get count of declined requests for BPRND POC
router.get('/declined-requests/count', async (req, res) => {
  try {
    console.log('🔍 BPRND POC requesting declined requests count...');
    
    // Count declined requests
    const declinedCount = await PendingCredits.countDocuments({ 
      $or: [
        { status: 'poc_declined' },
        { status: 'admin_declined' },
        { status: 'declined' }
      ]
    });
    
    console.log(`📊 Found ${declinedCount} declined requests`);
    
    res.json({
      success: true,
      message: 'Declined requests count retrieved successfully',
      data: {
        count: declinedCount
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching declined requests count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch declined requests count',
      error: error.message
    });
  }
});

module.exports = router;
