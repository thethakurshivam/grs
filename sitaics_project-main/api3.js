const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const pocbprnd = require('./model3/pocbprnd');
const PendingCredits = require('./model3/pendingcredits');
const Value = require('./model3/value');
const path = require('path');
// Add these imports at the top of api3.js after existing imports
const multer = require('multer');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const bprndStudents = require('./model3/bprndstudents');
const umbrella = require('./model3/umbrella');
const emailConfig = require('./email-config');
require('dotenv').config();

// Polyfill fetch if needed
const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: f }) => f(...args)));

const app = express();

// CORS Configuration
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
  allowedHeaders: ['Content-Type', 'Authorization'],
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
  service: emailConfig.EMAIL_SERVICE, // or your email service
  auth: {
    user: emailConfig.EMAIL_USER, // your email
    pass: emailConfig.EMAIL_PASS, // your email password or app password
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

app.post(
  '/api/bprnd/students/upload',
  upload.single('excelFile'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No Excel file uploaded',
        });
      }

      const umbrellaName = req.body.umbrella;
      if (!umbrellaName) {
        return res.status(400).json({
          success: false,
          message: 'Umbrella field is required',
        });
      }

      // Convert umbrella name to match schema field name (replace spaces with underscores)
      const umbrellaField = umbrellaName.replace(/\s+/g, '_');

      // Parse Excel file
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Excel file is empty',
        });
      }

      const savedStudents = [];
      const emailPromises = [];

      // Process each row of data
      for (const row of jsonData) {
        try {
          // Check if student already exists
          const existingStudent = await bprndStudents.findOne({
            email: row.email,
          });

          if (existingStudent) {
            // Increment umbrella credit if already exists
            existingStudent[umbrellaField] =
              (existingStudent[umbrellaField] || 0) + row.Total_Credits;
            existingStudent.Umbrella = umbrellaName; // Update umbrella field
            await existingStudent.save();
            savedStudents.push(existingStudent);
          } else {
            // Create new student
            const studentData = {
              Name: row.Name,
              Designation: row.Designation,
              State: row.State,
              Training_Topic: row.Training_Topic,
              Per_session_minutes: row.Per_session_minutes,
              Theory_sessions: row.Theory_sessions,
              Practical_sessions: row.Practical_sessions,
              Theory_Hours: row.Theory_Hours,
              Practical_Hours: row.Practical_Hours,
              Total_Hours: row.Total_Hours,
              Theory_Credits: row.Theory_Credits,
              Practical_Credits: row.Practical_Credits,
              Total_Credits: row.Total_Credits,
              date_of_birth: new Date(row.date_of_birth),
              email: row.email,
              password: 'password123',
              Umbrella: umbrellaName,
              [umbrellaField]: row.Total_Credits, // set credit for the selected umbrella field
            };

            const student = new bprndStudents(studentData);
            const savedStudent = await student.save();
            savedStudents.push(savedStudent);
          }

          // Prepare email
          const mailOptions = {
            from: emailConfig.EMAIL_USER,
            to: row.email,
            subject: 'RRU Portal Login Credentials',
            html: `
            <h2>Welcome to RRU Portal</h2>
            <p>Dear ${row.Name},</p>
            <p>You can now login to the RRU portal with the following credentials:</p>
            <ul>
              <li><strong>Username:</strong> ${row.email}</li>
              <li><strong>Password:</strong> password123</li>
            </ul>
            <p>Please login and change your password after first login.</p>
            <br>
            <p>Best regards,</p>
            <p>RRU Portal Team</p>
          `,
          };

          // Create a more robust email sending promise with error handling
          const emailPromise = transporter.sendMail(mailOptions)
            .then((info) => {
              console.log(`✅ Email sent successfully to ${row.email}:`, info.messageId);
              return { success: true, email: row.email, messageId: info.messageId };
            })
            .catch((error) => {
              console.error(`❌ Failed to send email to ${row.email}:`, error.message);
              return { success: false, email: row.email, error: error.message };
            });
          
          emailPromises.push(emailPromise);
        } catch (error) {
          console.error(`Error processing student ${row.email}:`, error);
        }
      }

      // Send all emails with detailed logging
      console.log(`Attempting to send ${emailPromises.length} emails...`);
      try {
        const emailResults = await Promise.allSettled(emailPromises);
        let successCount = 0;
        let failureCount = 0;
        
        emailResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            successCount++;
            console.log(`✅ Email ${index + 1} sent successfully:`, result.value);
          } else {
            failureCount++;
            console.error(`❌ Email ${index + 1} failed:`, result.reason);
          }
        });
        
        console.log(`Email sending completed: ${successCount} successful, ${failureCount} failed`);
        
        if (failureCount > 0) {
          console.error('Some emails failed to send. Check the logs above for details.');
        }
      } catch (emailError) {
        console.error('Critical error in email sending:', emailError);
      }

      res.status(200).json({
        success: true,
        message: `Successfully processed ${savedStudents.length} students and sent emails`,
        data: {
          totalProcessed: savedStudents.length,
          studentsData: savedStudents,
        },
      });
    } catch (error) {
      console.error('Excel upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing Excel file',
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
      process.env.JWT_SECRET || 'your-secret-key', // Use environment variable
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

// Retrieve all pending credit records that need BPRND POC approval (including a public pdfUrl for the PDF)
app.get('/api/bprnd/pending-credits', async (req, res) => {
  try {
    // Only show credits that are admin approved but not yet POC approved
    const records = await PendingCredits.find({ 
      admin_approved: true,
      bprnd_poc_approved: false 
    }).sort({ createdAt: -1 }).lean();

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
      { bprnd_poc_approved: true },
      { new: true }
    );

    if (!pendingCredit) {
      return res.status(404).json({
        success: false,
        message: 'Pending credit request not found'
      });
    }

    // Check if both approvals are complete
    if (pendingCredit.admin_approved && pendingCredit.bprnd_poc_approved) {
      // Both approved - process the credit application
      return res.json({
        success: true,
        message: 'BPRND POC approval successful. Credit request fully approved and ready for processing.',
        data: {
          id: pendingCredit._id,
          studentId: pendingCredit.studentId,
          admin_approved: pendingCredit.admin_approved,
          bprnd_poc_approved: pendingCredit.bprnd_poc_approved,
          status: 'fully_approved'
        }
      });
    }

    res.json({
      success: true,
      message: 'BPRND POC approval successful. Waiting for admin approval.',
      data: {
        id: pendingCredit._id,
        admin_approved: pendingCredit.admin_approved,
        bprnd_poc_approved: pendingCredit.bprnd_poc_approved,
        status: 'partially_approved'
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
      { bprnd_poc_approved: false },
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
        status: 'rejected_by_poc'
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
      admin_approved: true,
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

// Get all umbrellas route
app.get('/api/bprnd/umbrellas', async (req, res) => {
  try {
    // Retrieve all umbrellas from the database
    const umbrellas = await umbrella.find({}).sort({ name: 1 }); // Sort by name alphabetically

    res.status(200).json({
      success: true,
      message: 'Umbrellas retrieved successfully',
      data: umbrellas,
      count: umbrellas.length,
    });
  } catch (error) {
    console.error('Error retrieving umbrellas:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving umbrellas',
      error: error.message,
    });
  }
});

// Get pending credits for a specific student (BPRND POC view)
app.get('/api/bprnd/pending-credits/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    // Find pending credits for the specific student
    const records = await PendingCredits.find({ 
      studentId: studentId,
      admin_approved: true,
      bprnd_poc_approved: false 
    }).sort({ createdAt: -1 }).lean();

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
        acceptUrl,
        rejectUrl,
        createdAt: rec.createdAt,
        updatedAt: rec.updatedAt
      };
    });

    return res.status(200).json({
      success: true,
      message: `Found ${withUrls.length} pending credits for student`,
      data: {
        studentId: studentId,
        count: withUrls.length,
        pendingCredits: withUrls
      }
    });

  } catch (error) {
    console.error('Error retrieving pending credits for student:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all value mappings (credit → qualification)
app.get('/api/bprnd/values', async (req, res) => {
  try {
    const values = await Value.find({}).sort({ credit: 1 }).lean();
    return res.status(200).json({
      success: true,
      message: 'Values retrieved successfully',
      data: values,
      count: values.length,
    });
  } catch (error) {
    console.error('Error retrieving values:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Apply pending credits: compute new credits from totalHours and add to student's Total_Credits
// New: studentId as route parameter
app.post('/api/bprnd/pending-credits/:studentId/apply', async (req, res) => {
  try {
    const { studentId } = req.params;
    const {
      name,
      organization,
      discipline,
      totalHours,
      noOfDays,
      pdf,
    } = req.body || {};

    // Validate inputs
    if (!studentId || !name || !organization || !discipline || totalHours === undefined || noOfDays === undefined) {
      return res.status(400).json({
        success: false,
        message: 'studentId, name, organization, discipline, totalHours, and noOfDays are required',
      });
    }

    const hoursNum = Number(totalHours);
    const daysNum = Number(noOfDays);
    if (Number.isNaN(hoursNum) || Number.isNaN(daysNum) || hoursNum < 0 || daysNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'totalHours and noOfDays must be non-negative numbers',
      });
    }

    // Compute new credits and always award at least 1 credit when hours > 0
    const newCredits = hoursNum > 0 ? Math.ceil(hoursNum / 15) : 0;

    // Find student and update Total_Credits
    const student = await bprndStudents.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const previousTotal = Number(student.Total_Credits || 0);

    // Also increment the umbrella-specific field so breakdown reflects the change
    const UMBRELLA_KEYS = [
      'Cyber_Security',
      'Criminology',
      'Military_Law',
      'Police_Administration',
      'Forensic_Science',
      'National_Security',
      'International_Security',
      'Counter_Terrorism',
      'Intelligence_Studies',
      'Emergency_Management',
    ];
    const normalize = (s) => String(s || '')
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/[^a-z\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const normDiscipline = normalize(discipline);
    let fieldKey = UMBRELLA_KEYS.find(
      (k) => normalize(k.replace(/_/g, ' ')) === normDiscipline
    );
    if (!fieldKey) {
      // Try partial includes match
      fieldKey = UMBRELLA_KEYS.find(
        (k) => normalize(k.replace(/_/g, ' ')).includes(normDiscipline) ||
               normDiscipline.includes(normalize(k.replace(/_/g, ' ')))
      );
    }
    if (!fieldKey && student && student.Umbrella) {
      // Fallback to student's umbrella selection
      const normStudentUmbrella = normalize(student.Umbrella);
      fieldKey = UMBRELLA_KEYS.find(
        (k) => normalize(k.replace(/_/g, ' ')) === normStudentUmbrella
      ) || UMBRELLA_KEYS.find(
        (k) => normalize(k.replace(/_/g, ' ')).includes(normStudentUmbrella)
      );
    }
    if (fieldKey) {
      await bprndStudents.updateOne(
        { _id: studentId },
        {
          $inc: {
            Total_Credits: newCredits,
            [fieldKey]: newCredits,
          },
        }
      );
    } else {
      await bprndStudents.updateOne(
        { _id: studentId },
        { $inc: { Total_Credits: newCredits } }
      );
    }

    // Reload the student to get updated values
    const updatedStudent = await bprndStudents.findById(studentId);

    // Delete the corresponding pending credit record
    // Match by studentId and the exact data submitted
    const deleteResult = await PendingCredits.deleteOne({
      studentId: studentId,
      name: name,
      organization: organization,
      discipline: discipline,
      totalHours: hoursNum,
      noOfDays: daysNum
    });

    console.log(`Deleted ${deleteResult.deletedCount} pending credit record(s) for student ${studentId}`);

    return res.status(200).json({
      success: true,
      message: 'Credits applied successfully and pending request removed',
      data: {
        studentId: student._id,
        name,
        organization,
        discipline,
        totalHours: hoursNum,
        noOfDays: daysNum,
        pdf: pdf || null,
        newCredits,
        updatedTotalCredits: updatedStudent ? updatedStudent.Total_Credits : previousTotal + newCredits,
        updatedUmbrellaField: fieldKey || null,
        updatedUmbrellaCredits: fieldKey && updatedStudent ? updatedStudent[fieldKey] : null,
        previousTotalCredits: previousTotal,
        deletedPendingRecords: deleteResult.deletedCount,
      },
    });
  } catch (error) {
    console.error('Error applying pending credits:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Backward compatibility: keep old route for now
// app.post('/api/bprnd/pending-credits/apply', async (req, res) => {
//   try {
//     const {
//       studentId,
//       name,
//       organization,
//       discipline,
//       totalHours,
//       noOfDays,
//       pdf,
//     } = req.body || {};

//     if (!studentId) {
//       return res.status(400).json({ success: false, message: 'studentId is required' });
//     }

//     // Delegate to param route logic by reusing code path
//     req.params.studentId = studentId;
//     return app._router.handle(req, res, () => {});
//   } catch (error) {
//     console.error('Error applying pending credits (legacy route):', error);
//     return res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// });

// ===== BPR&D Certification Claims (POC) =====
const BprndClaim = require('./model3/bprnd_certification_claim');

const pocAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'Access token required' });
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) return res.status(403).json({ success: false, error: 'Invalid token' });
      req.user = user; next();
    });
  } catch {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
};

app.get('/api/bprnd/claims', pocAuth, async (req, res) => {
  try {
    const { status } = req.query;
    
    // If specific status requested, use it; otherwise show only claims needing POC approval
    const filter = status ? { status } : { 
      status: { $in: ['pending', 'admin_approved'] } 
    };
    
    const claims = await BprndClaim.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: claims.length, data: claims });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/bprnd/claims/:claimId/approve', pocAuth, async (req, res) => {
  try {
    const { claimId } = req.params;
    const claim = await BprndClaim.findById(claimId);
    if (!claim) return res.status(404).json({ success: false, error: 'Claim not found' });

    if (claim.status === 'declined' || claim.status === 'approved') {
      return res.json({ success: true, message: `Claim already ${claim.status}` });
    }

    claim.pocApproval = { by: req.user?.email || 'bprnd-poc', at: new Date(), decision: 'approved' };
    claim.status = claim.adminApproval?.decision === 'approved' ? 'approved' : 'poc_approved';
    await claim.save();

    if (claim.status === 'approved') {
      try {
        const finalizeUrl = `http://localhost:3004/internal/bprnd/claims/${claim._id}/finalize`;
        const resp = await fetch(finalizeUrl, { method: 'POST' });
        const json = await resp.json().catch(() => ({}));
        if (!resp.ok || json?.success === false) {
          return res.status(502).json({ success: false, error: json?.message || `Finalize failed: ${resp.status}` });
        }
        return res.json({ success: true, message: 'Approved and finalized', data: json?.data });
      } catch (err) {
        return res.status(502).json({ success: false, error: 'Finalize request failed' });
      }
    }

    res.json({ success: true, message: 'POC approved' });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/bprnd/claims/:claimId/decline', pocAuth, async (req, res) => {
  try {
    const { claimId } = req.params;
    const claim = await BprndClaim.findById(claimId);
    if (!claim) return res.status(404).json({ success: false, error: 'Claim not found' });

    claim.pocApproval = { by: req.user?.email || 'bprnd-poc', at: new Date(), decision: 'declined' };
    claim.status = 'declined';
    await claim.save();
    res.json({ success: true, message: 'POC declined' });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS error: Origin not allowed',
    });
  }
  res.status(500).json({
    success: false,
    message: 'Internal server error',
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
