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
require('dotenv').config();

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
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
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
            from: process.env.EMAIL_USER,
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

          emailPromises.push(transporter.sendMail(mailOptions));
        } catch (error) {
          console.error(`Error processing student ${row.email}:`, error);
        }
      }

      // Send all emails
      try {
        await Promise.all(emailPromises);
        console.log('All emails sent successfully');
      } catch (emailError) {
        console.error('Some emails failed to send:', emailError);
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

// Retrieve all pending credit records (including a public pdfUrl for the PDF)
app.get('/api/bprnd/pending-credits', async (req, res) => {
  try {
    const records = await PendingCredits.find({}).sort({ createdAt: -1 }).lean();

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
        acceptUrl,
        rejectUrl,
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

    // Compute new credits as integer part of (Total_Hours / 15)
    const newCredits = Math.floor(hoursNum / 15);

    // Find student and update Total_Credits
    const student = await bprndStudents.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const previousTotal = Number(student.Total_Credits || 0);
    student.Total_Credits = previousTotal + newCredits;

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
    const norm = String(discipline || '')
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const fieldKey = UMBRELLA_KEYS.find(
      (k) => k.replace(/_/g, ' ').toLowerCase() === norm
    );
    if (fieldKey && Object.prototype.hasOwnProperty.call(student, fieldKey)) {
      const current = Number(student[fieldKey] || 0);
      student[fieldKey] = current + newCredits;
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Credits applied successfully',
      data: {
        studentId: student._id,
        name,
        organization,
        discipline,
        totalHours: hoursNum,
        noOfDays: daysNum,
        pdf: pdf || null,
        newCredits,
        updatedTotalCredits: student.Total_Credits,
        updatedUmbrellaField: fieldKey || null,
        updatedUmbrellaCredits: fieldKey ? student[fieldKey] : null,
        previousTotalCredits: previousTotal,
      },
    });
  } catch (error) {
    console.error('Error applying pending credits:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Backward compatibility: keep old route for now
app.post('/api/bprnd/pending-credits/apply', async (req, res) => {
  try {
    const {
      studentId,
      name,
      organization,
      discipline,
      totalHours,
      noOfDays,
      pdf,
    } = req.body || {};

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'studentId is required' });
    }

    // Delegate to param route logic by reusing code path
    req.params.studentId = studentId;
    return app._router.handle(req, res, () => {});
  } catch (error) {
    console.error('Error applying pending credits (legacy route):', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
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
