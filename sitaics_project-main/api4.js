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
const CourseHistory = require('./model3/course_history');

const BprndClaim = require('./model3/bprnd_certification_claim');
const BprndCertificate = require('./model3/bprnd_certificate');

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

// Serve static files from the uploads directory
app.use('/files', express.static(uploadsDir));

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
const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

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

    // Compare password using bcrypt
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, student.password);
    
    if (!isPasswordValid) {
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

    // First, get all available umbrella fields from the database
    const umbrellas = await umbrella.find({}).sort({ name: 1 });
    
    if (!umbrellas || umbrellas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No umbrella fields found in database',
      });
    }

    // Build dynamic projection based on actual umbrella fields
    const projection = { Total_Credits: 1 };
    umbrellas.forEach(u => {
      // Convert umbrella name to field key format (e.g., "Cyber Security" -> "Cyber_Security")
      const fieldKey = u.name.replace(/\s+/g, '_');
      projection[fieldKey] = 1;
    });

    const student = await CreditCalculation.findById(id).select(projection);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Build dynamic data object based on actual umbrella fields
    const data = {};
    umbrellas.forEach(u => {
      const fieldKey = u.name.replace(/\s+/g, '_');
      const fieldValue = student[fieldKey];
      data[fieldKey] = Number(fieldValue || 0);
    });

    // Also include total credits if available
    if (student.Total_Credits !== undefined) {
      data.Total_Credits = Number(student.Total_Credits || 0);
    }

    console.log(`📊 Credits breakdown for student ${id}:`, data);
    console.log(`🔍 Available umbrella fields:`, umbrellas.map(u => u.name));

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

// Get course history for a specific student and umbrella field
router.get('/student/:id/course-history/:umbrella', async (req, res) => {
  try {
    const { id, umbrella } = req.params;

    if (!id || !umbrella) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and umbrella field are required',
      });
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    console.log(`🔍 Fetching course history for student ${id} in umbrella: ${umbrella}`);

    // Find all course history records for this student and discipline
    // Note: discipline in coursehistories matches umbrella name from database
    // Show ALL courses to properly display credit usage (both used and unused)
    const courseHistory = await CourseHistory.find({
      studentId: new mongoose.Types.ObjectId(id),
      discipline: { $regex: new RegExp(umbrella, 'i') } // Case-insensitive match
    })
    .sort({ createdAt: -1 }) // Sort by newest first
    .lean();

    console.log(`📊 Found ${courseHistory.length} course history records for ${umbrella}`);

    // Get the student's current stored credits for this umbrella
    const student = await CreditCalculation.findById(id).lean();
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Convert umbrella name to field key format (e.g., "Police Administration" -> "Police_Administration")
    const umbrellaFieldKey = umbrella.replace(/\s+/g, '_');
    const currentStoredCredits = Number(student[umbrellaFieldKey] || 0);

    console.log(`💰 Current stored credits for ${umbrella}: ${currentStoredCredits}`);

    // Calculate remaining credits for each course based on what's actually been used
    const coursesWithRemainingCredits = [];

    for (const course of courseHistory) {
      const courseTotalCredits = (course.theoryCredits || 0) + (course.practicalCredits || 0);
      
      // Check if this course has contributed to any certificates
      const hasContributed = course.certificateContributed === true;
      
      if (hasContributed) {
        // Course has been used for certification - calculate remaining credits
        let contributedCredits = 0;
        
        if (course.contributedToCertificate?.creditsContributed) {
          // Use actual contributed credits if available
          contributedCredits = course.contributedToCertificate.creditsContributed;
        } else {
          // If contributedToCertificate is missing but course is marked as contributed,
          // we need to make a reasonable assumption about credit usage
          
          // Check if this is a "Remaining Credits" course (created when partial credits were used)
          if (course.name && course.name.includes('(Remaining Credits)')) {
            // This is already a remaining credits course, so all credits are available
            contributedCredits = 0;
          } else {
            // This is an original course marked as contributed but missing details
            // Look for corresponding "Remaining Credits" course to determine usage
            let remainingCourseExists = null;
            
            // First try to find by originalCourseId
            if (course._id) {
              remainingCourseExists = courseHistory.find(c => 
                c.originalCourseId && c.originalCourseId.toString() === course._id.toString()
              );
            }
            
            // If not found by ID, try to find by name pattern
            if (!remainingCourseExists) {
              remainingCourseExists = courseHistory.find(c => 
                c.name && c.name.includes(`${course.name} (Remaining Credits)`) &&
                c.certificateContributed === false // Only consider unused remaining courses
              );
            }
            
            if (remainingCourseExists) {
              // If remaining course exists, calculate how much was used
              const remainingCreditsFromOtherCourse = (remainingCourseExists.theoryCredits || 0) + (remainingCourseExists.practicalCredits || 0);
              contributedCredits = Math.max(0, courseTotalCredits - remainingCreditsFromOtherCourse);
              console.log(`🔍 Found remaining course for ${course.name}: original=${courseTotalCredits}, remaining=${remainingCreditsFromOtherCourse}, used=${contributedCredits}`);
            } else {
              // No remaining course found - assume course was fully used
              contributedCredits = courseTotalCredits;
              console.log(`⚠️ No remaining course found for ${course.name}: marking as fully used (${contributedCredits} credits)`);
            }
          }
        }
        
        const remainingCredits = Math.max(0, courseTotalCredits - contributedCredits);
        
        // Distribute remaining credits proportionally between theory and practical
        const theoryRatio = courseTotalCredits > 0 ? (course.theoryCredits || 0) / courseTotalCredits : 0;
        const practicalRatio = courseTotalCredits > 0 ? (course.practicalCredits || 0) / courseTotalCredits : 0;
        
        const remainingTheoryCredits = Math.round(remainingCredits * theoryRatio);
        const remainingPracticalCredits = Math.round(remainingCredits * practicalRatio);
        
        coursesWithRemainingCredits.push({
          ...course,
          originalTheoryCredits: course.theoryCredits || 0,
          originalPracticalCredits: course.practicalCredits || 0,
          originalTotalCredits: courseTotalCredits,
          remainingTheoryCredits: remainingTheoryCredits,
          remainingPracticalCredits: remainingPracticalCredits,
          remainingTotalCredits: remainingCredits,
          creditsUsed: contributedCredits,
          isFullyAvailable: remainingCredits === courseTotalCredits
        });
      } else {
        // Course hasn't been used for certification yet - all credits available
        coursesWithRemainingCredits.push({
          ...course,
          originalTheoryCredits: course.theoryCredits || 0,
          originalPracticalCredits: course.practicalCredits || 0,
          originalTotalCredits: courseTotalCredits,
          remainingTheoryCredits: course.theoryCredits || 0,
          remainingPracticalCredits: course.practicalCredits || 0,
          remainingTotalCredits: courseTotalCredits,
          creditsUsed: 0,
          isFullyAvailable: true
        });
      }
    }

    // Calculate summary statistics using REMAINING credits (not total earned)
    const totalRemainingTheoryCredits = coursesWithRemainingCredits.reduce((sum, course) => sum + (course.remainingTheoryCredits || 0), 0);
    const totalRemainingPracticalCredits = coursesWithRemainingCredits.reduce((sum, course) => sum + (course.remainingPracticalCredits || 0), 0);
    const totalRemainingCredits = totalRemainingTheoryCredits + totalRemainingPracticalCredits;
    const totalHours = coursesWithRemainingCredits.reduce((sum, course) => sum + (course.totalHours || 0), 0);
    const totalDays = coursesWithRemainingCredits.reduce((sum, course) => sum + (course.noOfDays || 0), 0);
    const totalCreditsUsed = coursesWithRemainingCredits.reduce((sum, course) => sum + (course.creditsUsed || 0), 0);

    console.log(`📊 Summary for ${umbrella}: ${totalRemainingCredits} remaining credits (${totalRemainingTheoryCredits} theory + ${totalRemainingPracticalCredits} practical), ${totalCreditsUsed} credits used`);

    return res.status(200).json({
      success: true,
      message: 'Course history retrieved successfully',
      data: {
        umbrella: umbrella,
        studentId: id,
        courses: coursesWithRemainingCredits,
        summary: {
          totalCourses: coursesWithRemainingCredits.length,
          totalCredits: totalRemainingCredits, // This now matches the credit bank card!
          totalTheoryCredits: totalRemainingTheoryCredits,
          totalPracticalCredits: totalRemainingPracticalCredits,
          totalHours,
          totalDays,
          totalCreditsUsed, // Total credits used from all courses
          currentStoredCredits, // Include for reference
          note: `Course history shows remaining credits (${totalRemainingCredits}) that can still contribute to future certifications. Total credits used: ${totalCreditsUsed}. This matches your credit bank card.`
        }
      }
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }
    console.error('Error fetching course history:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Pending credits upload (PDF)
router.post('/pending-credits', upload.single('pdf'), async (req, res) => {
  try {
    const { name, courseName, organization, discipline, studentId } = req.body;
    const theoryHours = Number(req.body?.theoryHours);
    const practicalHours = Number(req.body?.practicalHours);
    const noOfDays = Number(req.body?.noOfDays);

    // Validate required fields
    if (!studentId || !name || !courseName || !organization || !discipline || Number.isNaN(theoryHours) || Number.isNaN(practicalHours) || Number.isNaN(noOfDays) || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'studentId, name, courseName, organization, discipline, theoryHours, practicalHours, noOfDays, and PDF file are required'
      });
    }

    if (theoryHours < 0 || practicalHours < 0 || noOfDays < 0) {
      return res.status(400).json({
        success: false,
        message: 'theoryHours, practicalHours, and noOfDays must be non-negative numbers'
      });
    }

    // Create new pending credit record
    const pendingCredit = new PendingCredits({
      studentId,
      name: String(name),
      courseName: String(courseName),
      organization: String(organization),
      discipline: String(discipline),
      theoryHours,
      practicalHours,
      noOfDays,
      pdf: req.file.path, // Store the file path
      admin_approved: false, // Explicitly set default value
      bprnd_poc_approved: false // Explicitly set default value
    });

    // Save to database
    const savedRecord = await pendingCredit.save();

    res.status(201).json({
      success: true,
      message: 'Pending credit record created successfully. Waiting for admin and BPR&D POC approval.',
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

    // Find pending credits for the specific student
    const records = await PendingCredits.find({ 
      studentId: studentId
    }).sort({ createdAt: -1 }).lean();
    
    if (!records || records.length === 0) {
      return res.status(200).json({
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
      
      return {
        id: rec._id,
        studentId: rec.studentId,
        name: rec.name,
        courseName: rec.courseName,
        organization: rec.organization,
        discipline: rec.discipline,
        theoryHours: rec.theoryHours,
        practicalHours: rec.practicalHours,
        totalHours: rec.totalHours,
        calculatedCredits: rec.calculatedCredits,
        noOfDays: rec.noOfDays,
        pdf: pdfUrl,
        status: rec.status || 'pending',
        admin_approved: rec.admin_approved,
        bprnd_poc_approved: rec.bprnd_poc_approved,
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
    console.error('Error retrieving pending credits for student:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Mount router
// Login endpoint for BPRND students
app.post('/api/bprnd/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find student by email
    const student = await CreditCalculation.findOne({ email: email.toLowerCase().trim() });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password using the method defined in the schema
    const isPasswordValid = await student.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        studentId: student._id,
        email: student.email,
        type: 'bprnd-student',
      },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: '24h',
      }
    );

    // Return success response with token and student data (without password)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      student: {
        _id: student._id,
        email: student.email,
        Name: student.Name,
        Designation: student.Designation,
        State: student.State,
        Department: student.Department,
        EmployeeId: student.EmployeeId,
        Umbrella: student.Umbrella,
        Phone: student.Phone,
        JoiningDate: student.JoiningDate,
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

// Retrieve all umbrellas for discipline dropdown
router.get('/umbrellas', async (req, res) => {
  try {
    const umbrellas = await umbrella.find({}).sort({ name: 1 }).lean();
    return res.status(200).json({
      success: true,
      message: 'Umbrellas retrieved successfully',
      data: umbrellas,
    });
  } catch (error) {
    console.error('Error fetching umbrellas:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Determine certification eligibility for a BPRND student by umbrella field credits
router.get('/student/:id/certifications', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const student = await CreditCalculation.findById(id).lean();
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Dynamically fetch umbrella fields from database
    const umbrellaFields = await umbrella.find({}).lean();
    if (!umbrellaFields || umbrellaFields.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No umbrella fields found in database' 
      });
    }

    // Convert umbrella names to field keys (e.g., "Cyber Security" -> "Cyber_Security")
    const UMBRELLA_FIELDS = umbrellaFields.map(u => u.name.replace(/\s+/g, '_'));
    
    console.log(`🔍 Available umbrella fields for certification: ${UMBRELLA_FIELDS.join(', ')}`);

    // Build a working copy of umbrella credits
    const creditsByField = {};
    let anyUmbrellaCredits = false;
    for (const key of UMBRELLA_FIELDS) {
      const val = Number(student[key] || 0);
      creditsByField[key] = val;
      if (val > 0) anyUmbrellaCredits = true;
    }

    // Fallback: Some historical records only have Total_Credits and Umbrella name filled.
    // If none of the umbrella-specific fields have credits, attribute Total_Credits to the student's Umbrella.
    if (!anyUmbrellaCredits && typeof student.Total_Credits === 'number' && student.Total_Credits > 0 && student.Umbrella) {
      const umbrellaName = String(student.Umbrella)
        .trim()
        .replace(/\s+/g, '_');
      const matchedKey = UMBRELLA_FIELDS.find(
        (k) => k.toLowerCase() === umbrellaName.toLowerCase()
      );
      if (matchedKey) {
        creditsByField[matchedKey] = Number(student.Total_Credits);
      }
    }

    // Now calculate credits from course history for ALL umbrellas to ensure consistency
    console.log('🔄 Calculating credits from course history for consistency...');
    const calculatedCredits = {};

    for (const umbrella of umbrellaFields) {
      try {
        // Get course history for this umbrella (only non-contributed courses)
        const courseHistoryResponse = await fetch(
          `http://localhost:3004/student/${id}/course-history/${encodeURIComponent(umbrella.name)}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (courseHistoryResponse.ok) {
          const courseHistoryData = await courseHistoryResponse.json();
          if (courseHistoryData.success) {
            // Calculate total credits from available courses (not contributed to certificates)
            const totalCredits = courseHistoryData.data.summary.totalCredits || 0;
            
            // Convert umbrella name to field key format (e.g., "Cyber Security" -> "Cyber_Security")
            const fieldKey = umbrella.name.replace(/\s+/g, '_');
            // Round credits to whole numbers for better display
            calculatedCredits[fieldKey] = Math.round(totalCredits);
          } else {
            // If no courses found, set to 0
            const fieldKey = umbrella.name.replace(/\s+/g, '_');
            calculatedCredits[fieldKey] = 0;
          }
        } else {
          // If API call fails, set to 0
          const fieldKey = umbrella.name.replace(/\s+/g, '_');
          calculatedCredits[fieldKey] = 0;
        }
      } catch (umbrellaError) {
        // If individual umbrella fails, set to 0 and continue
        const fieldKey = umbrella.name.replace(/\s+/g, '_');
        calculatedCredits[fieldKey] = 0;
        console.warn(`Failed to fetch course history for ${umbrella.name}:`, umbrellaError);
      }
    }

    console.log('📊 Calculated credits from course history:', calculatedCredits);
    
    // For certification eligibility, use STORED credits (what's available to spend)
    // Course history is for display purposes only
    console.log('📊 Using stored credits for certification eligibility:', creditsByField);
    
    const results = [];
    for (const key of UMBRELLA_FIELDS) {
      const credits = Number(creditsByField[key] || 0);
      let qualification = null;
      if (credits >= 40) {
        qualification = 'pg diploma';
      } else if (credits >= 30) {
        qualification = 'diploma';
      } else if (credits >= 20) {
        qualification = 'certificate';
      }

      if (qualification) {
        // Human readable label: replace underscores with spaces
        const fieldLabel = key.replace(/_/g, ' ');
        const claimUrl = `${req.protocol}://${req.get('host')}/student/${id}/claim-certification`;
        results.push({
          fieldKey: key,
          field: fieldLabel,
          credits,
          qualification,
          claimUrl,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Certification eligibility computed',
      data: results,
      totalEligible: results.length,
    });
  } catch (error) {
    console.error('Error computing certifications:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Placeholder claim endpoint (can be extended to create records or issue certificates)
router.post('/student/:id/claim-certification', async (req, res) => {
  try {
    const { id } = req.params;
    const { fieldKey, qualification } = req.body || {};
    if (!id || !fieldKey || !qualification) {
      return res.status(400).json({ success: false, message: 'id, fieldKey and qualification are required' });
    }
    // Here you could persist a claim record; for now just confirm receipt
    return res.status(200).json({
      success: true,
      message: 'Certification claim received',
      data: { studentId: id, fieldKey, qualification },
    });
  } catch (error) {
    console.error('Error claiming certification:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Redeem credits from a student's umbrella field based on claimed qualification
// Params: :id (studentId), :umbrella (e.g., "Cyber Security"), :qualification (certificate|diploma|pg%20diploma)
router.post('/student/:id/umbrella/:umbrella/redeem/:qualification', async (req, res) => {
  try {
    const { id, umbrella, qualification } = req.params;

    if (!id || !umbrella || !qualification) {
      return res.status(400).json({ success: false, message: 'id, umbrella and qualification are required' });
    }

    // Determine decrement credits based on qualification
    const q = decodeURIComponent(String(qualification)).trim().toLowerCase();
    const decMap = new Map([
      ['certificate', 20],
      ['diploma', 30],
      ['pg diploma', 40],
    ]);
    if (!decMap.has(q)) {
      return res.status(400).json({ success: false, message: 'Invalid qualification. Use certificate | diploma | pg diploma' });
    }
    const decredit = decMap.get(q);

    // Map umbrella name to field key (spaces -> underscores) and validate exists
    const fieldKey = decodeURIComponent(String(umbrella)).replace(/\s+/g, '_');
    
    // Dynamically fetch and validate umbrella fields from database
    const umbrellaFields = await umbrella.find({}).lean();
    if (!umbrellaFields || umbrellaFields.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No umbrella fields found in database' 
      });
    }
    
    const UMBRELLA_FIELDS = new Set(umbrellaFields.map(u => u.name.replace(/\s+/g, '_')));
    console.log(`🔍 Available umbrella fields for credit redemption: ${Array.from(UMBRELLA_FIELDS).join(', ')}`);
    
    if (!UMBRELLA_FIELDS.has(fieldKey)) {
      return res.status(400).json({ 
        success: false, 
        message: `Unknown umbrella field: ${fieldKey}. Available fields: ${Array.from(UMBRELLA_FIELDS).join(', ')}` 
      });
    }

    // Fetch student
    const student = await CreditCalculation.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const previous = Number(student[fieldKey] || 0);
    const updated = Math.max(0, previous - decredit);
    student[fieldKey] = updated;
    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Umbrella credits updated successfully',
      data: {
        studentId: student._id,
        umbrella: fieldKey,
        qualification: q,
        decredit,
        previous,
        updated,
      },
    });
  } catch (error) {
    console.error('Error redeeming umbrella credits:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Student requests a certification (creates a claim). No deduction here.
router.post('/student/:id/certifications/request', async (req, res) => {
  try {
    const { id } = req.params;
    const { umbrellaKey, qualification } = req.body || {};
    if (!id || !umbrellaKey || !qualification) {
      return res.status(400).json({ success: false, message: 'id, umbrellaKey and qualification are required' });
    }

    // Map required credits
    const decMap = new Map([
      ['certificate', 20],
      ['diploma', 30],
      ['pg diploma', 40],
    ]);
    const q = String(qualification).trim().toLowerCase();
    if (!decMap.has(q)) {
      return res.status(400).json({ success: false, message: 'Invalid qualification. Use certificate | diploma | pg diploma' });
    }
    const requiredCredits = decMap.get(q);

    // Normalize umbrella key from label or key
    const key = String(umbrellaKey).replace(/\s+/g, '_');
    
    // Dynamically fetch and validate umbrella fields from database
    const umbrellaFields = await umbrella.find({}).lean();
    if (!umbrellaFields || umbrellaFields.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No umbrella fields found in database' 
      });
    }
    
    const UMBRELLA_FIELDS = new Set(umbrellaFields.map(u => u.name.replace(/\s+/g, '_')));
    console.log(`🔍 Available umbrella fields for certification request: ${Array.from(UMBRELLA_FIELDS).join(', ')}`);
    
    if (!UMBRELLA_FIELDS.has(key)) {
      return res.status(400).json({ 
        success: false, 
        message: `Unknown umbrella field: ${key}. Available fields: ${Array.from(UMBRELLA_FIELDS).join(', ')}` 
      });
    }

    // Validate eligibility at request time (has at least required credits now)
    const student = await CreditCalculation.findById(id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const available = Number(student[key] || 0);
    if (available < requiredCredits) {
      return res.status(400).json({ success: false, message: `Insufficient credits in ${key.replace(/_/g,' ')}. Required ${requiredCredits}, found ${available}` });
    }

    // Prevent duplicate pending claim for same umbrella+qualification
    const existingPending = await BprndClaim.findOne({ studentId: id, umbrellaKey: key, qualification: q, status: { $in: ['pending','admin_approved','poc_approved'] } });
    if (existingPending) {
      return res.status(409).json({ success: false, message: 'A similar claim is already in progress' });
    }

    // Query coursehistories to get contributing courses for this certification
    // Filter out courses that have already contributed to certificates
    // Convert umbrellaKey back to proper format for course history query
    // e.g., "Police_Administration" -> "Police Administration"
    const disciplineForQuery = key.replace(/_/g, ' ');
    
    console.log(`🔍 Querying course history for discipline: "${disciplineForQuery}" (converted from umbrellaKey: "${key}")`);
    
    const courseHistory = await CourseHistory.find({
      studentId: new mongoose.Types.ObjectId(id),
      discipline: disciplineForQuery,
      certificateContributed: { $ne: true } // Only consider courses not already contributed
    }).sort({ createdAt: 1 }).lean(); // Sort by oldest first for FIFO
    
    console.log(`📊 Found ${courseHistory.length} course history records for discipline: "${disciplineForQuery}"`);

    // TEST: Simple log to verify execution
    console.log(`🚨 TEST: PDF lookup section is being executed!`);
    
    // Fetch PDF information from pending credits for these courses
    console.log(`🔍 Starting PDF lookup for discipline: "${disciplineForQuery}"`);
    
    let pendingCreditsWithPDFs = [];
    try {
      const courseIds = courseHistory.map(course => course._id);
      pendingCreditsWithPDFs = await PendingCredits.find({
        studentId: new mongoose.Types.ObjectId(id),
        discipline: disciplineForQuery
      }).lean();
      
      console.log(`📄 PDF lookup step 1: Found ${pendingCreditsWithPDFs.length} pending credits`);
    } catch (error) {
      console.error(`❌ Error in PDF lookup step 1:`, error);
      pendingCreditsWithPDFs = []; // Fallback to empty array
    }
    
    // Create a map of course name + organization to PDF info for easier lookup
    let pdfMap = new Map();
    try {
      pendingCreditsWithPDFs.forEach(pending => {
        const key = `${pending.name}|${pending.organization}`;
        pdfMap.set(key, {
          pdfPath: pending.pdf,
          pdfFileName: pending.pdf ? pending.pdf.split('/').pop() : null
        });
      });
      
      console.log(`📄 PDF lookup step 2: Created PDF map with ${pdfMap.size} entries`);
    } catch (error) {
      console.error(`❌ Error in PDF lookup step 2:`, error);
      pdfMap = new Map(); // Fallback to empty map
    }
    
    console.log(`📄 Found ${pendingCreditsWithPDFs.length} pending credits with PDFs for discipline: "${disciplineForQuery}"`);
    
    // Also check if any courses in courseHistory have PDF information directly
    try {
      courseHistory.forEach(course => {
        if (course.pdfPath || course.pdf) {
          const key = `${course.name}|${course.organization}`;
          if (!pdfMap.has(key)) {
            pdfMap.set(key, {
              pdfPath: course.pdfPath || course.pdf,
              pdfFileName: (course.pdfPath || course.pdf) ? (course.pdfPath || course.pdf).split('/').pop() : null
            });
          }
        }
      });
      
      console.log(`📄 PDF lookup step 3: Added course history PDFs to map`);
    } catch (error) {
      console.error(`❌ Error in PDF lookup step 3:`, error);
    }
    
    // Prioritize PDF information from course history over pending credits
    // (since we're now storing PDFs in course history)
    try {
      courseHistory.forEach(course => {
        const key = `${course.name}|${course.organization}`;
        if (course.pdfPath || course.pdf) {
          pdfMap.set(key, {
            pdfPath: course.pdfPath || course.pdf,
            pdfFileName: (course.pdfPath || course.pdf) ? (course.pdfPath || course.pdf).split('/').pop() : null
          });
        }
      });
      
      console.log(`📄 PDF lookup step 4: Prioritized course history PDFs`);
    } catch (error) {
      console.error(`❌ Error in PDF lookup step 4:`, error);
    }
    
    try {
      console.log(`📄 Total PDF mappings available: ${pdfMap.size}`);
      console.log(`📄 PDF mappings:`, Array.from(pdfMap.entries()).map(([key, value]) => ({
        courseKey: key,
        pdfPath: value.pdfPath,
        fileName: value.pdfFileName
      })));
      
      // Debug: Check what's in courseHistory
      console.log(`🔍 Course History PDF Check for discipline: "${disciplineForQuery}":`);
      courseHistory.forEach((course, index) => {
        console.log(`  Course ${index + 1}: "${course.name}" by "${course.organization}"`);
        console.log(`    - Has pdfPath: ${!!course.pdfPath}`);
        console.log(`    - Has pdf field: ${!!course.pdf}`);
        console.log(`    - pdfPath value: ${course.pdfPath || 'null'}`);
        console.log(`    - pdf value: ${course.pdf || 'null'}`);
      });
      
      console.log(`📄 PDF lookup step 5: Final logging completed`);
    } catch (error) {
      console.error(`❌ Error in PDF lookup step 5:`, error);
    }

    // Calculate which courses contribute to this certification
    const contributingCourses = [];
    let accumulatedCredits = 0;
    
    for (const course of courseHistory) {
      if (accumulatedCredits >= requiredCredits) break;
      
      // Calculate course credits from theory + practical (new logic)
      const courseCredits = (course.theoryCredits || 0) + (course.practicalCredits || 0);
      if (accumulatedCredits + courseCredits <= requiredCredits) {
        // This course fully contributes to the certification
        // Look up PDF information
        const pdfKey = `${course.name}|${course.organization}`;
        const pdfInfo = pdfMap.get(pdfKey) || { pdfPath: null, pdfFileName: null };
        
        console.log(`🔍 Course "${course.name}" PDF lookup:`, {
          courseKey: pdfKey,
          pdfFound: !!pdfInfo.pdfPath,
          pdfPath: pdfInfo.pdfPath,
          fileName: pdfInfo.pdfFileName,
          pdfMapSize: pdfMap.size,
          pdfMapKeys: Array.from(pdfMap.keys())
        });
        
        contributingCourses.push({
          _id: course._id,
          name: course.name,
          organization: course.organization,
          discipline: course.discipline,
          theoryHours: course.theoryHours || 0,
          practicalHours: course.practicalHours || 0,
          theoryCredits: course.theoryCredits || 0,
          practicalCredits: course.practicalCredits || 0,
          totalHours: course.totalHours,
          creditsEarned: courseCredits, // Use calculated credits
          noOfDays: course.noOfDays || 0,
          completionDate: course.completionDate ? new Date(course.completionDate) : new Date(),
          courseId: course._id,
          // Add PDF information from pending credits
          pdfPath: pdfInfo.pdfPath ? `${req.protocol}://${req.get('host')}/files/${pdfInfo.pdfFileName}` : null,
          pdfFileName: pdfInfo.pdfFileName
        });
        accumulatedCredits += courseCredits;
      } else {
        // This course partially contributes (if needed)
        const remainingCredits = requiredCredits - accumulatedCredits;
        if (remainingCredits > 0) {
          // For partial contribution, we need to calculate proportional credits
          const totalCourseCredits = courseCredits;
          const theoryRatio = totalCourseCredits > 0 ? (course.theoryCredits || 0) / totalCourseCredits : 0;
          const practicalRatio = totalCourseCredits > 0 ? (course.practicalCredits || 0) / totalCourseCredits : 0;
          
          // Calculate the credits that will be contributed
          const contributedTheoryCredits = remainingCredits * theoryRatio;
          const contributedPracticalCredits = remainingCredits * practicalRatio;
          
          // Calculate the credits that will remain
          const remainingTheoryCredits = (course.theoryCredits || 0) - contributedTheoryCredits;
          const remainingPracticalCredits = (course.practicalCredits || 0) - contributedPracticalCredits;
          
          // Look up PDF information for this course
          const pdfKey = `${course.name}|${course.organization}`;
          const pdfInfo = pdfMap.get(pdfKey) || { pdfPath: null, pdfFileName: null };
          
          console.log(`🔍 Partial Course "${course.name}" PDF lookup:`, {
            courseKey: pdfKey,
            pdfFound: !!pdfInfo.pdfPath,
            pdfPath: pdfInfo.pdfPath,
            fileName: pdfInfo.pdfFileName
          });
          
          contributingCourses.push({
            _id: course._id,
            name: course.name,
            organization: course.organization,
            discipline: course.discipline,
            theoryHours: Math.round((course.theoryHours || 0) * (remainingCredits / totalCourseCredits)),
            practicalHours: Math.round((course.practicalHours || 0) * (remainingCredits / totalCourseCredits)),
            theoryCredits: contributedTheoryCredits,
            practicalCredits: contributedPracticalCredits,
            totalHours: Math.ceil(remainingCredits * 15), // Convert back to hours
            creditsEarned: remainingCredits,
            noOfDays: course.noOfDays || 0,
            completionDate: course.completionDate ? new Date(course.completionDate) : new Date(),
            courseId: course._id,
            // Add PDF information from pending credits
            pdfPath: pdfInfo.pdfPath ? `${req.protocol}://${req.get('host')}/files/${pdfInfo.pdfFileName}` : null,
            pdfFileName: pdfInfo.pdfFileName
          });
          
          // Create a new course entry for the remaining credits
          if (remainingTheoryCredits > 0 || remainingPracticalCredits > 0) {
            const remainingCourse = new CourseHistory({
              studentId: course.studentId,
              name: `${course.name} (Remaining Credits)`,
              organization: course.organization,
              discipline: course.discipline,
              theoryHours: Math.round((course.theoryHours || 0) * ((remainingTheoryCredits + remainingPracticalCredits) / totalCourseCredits)),
              practicalHours: Math.round((course.practicalHours || 0) * ((remainingTheoryCredits + remainingPracticalCredits) / totalCourseCredits)),
              theoryCredits: remainingTheoryCredits,
              practicalCredits: remainingPracticalCredits,
              creditsEarned: remainingTheoryCredits + remainingPracticalCredits,
              totalHours: Math.ceil((remainingTheoryCredits + remainingPracticalCredits) * 15),
              noOfDays: course.noOfDays || 0,
              completionDate: course.completionDate ? new Date(course.completionDate) : new Date(),
              certificateContributed: false, // Available for future certifications
              originalCourseId: course._id, // Track which course this came from
              createdAt: new Date(),
              updatedAt: new Date(),
              // Add PDF information from the original course
              pdfPath: course.pdfPath || course.pdf || null,
              pdfFileName: (course.pdfPath || course.pdf) ? (course.pdfPath || course.pdf).split('/').pop() : null
            });
            
            await remainingCourse.save();
            console.log(`✅ Created remaining credits course: ${remainingCourse.name} with ${remainingTheoryCredits + remainingPracticalCredits} credits`);
          }
          
          accumulatedCredits = requiredCredits;
        }
        break;
      }
    }

    console.log(`🔍 Certification request: ${accumulatedCredits}/${requiredCredits} credits from ${contributingCourses.length} courses`);
    console.log(`📚 Contributing courses details:`, contributingCourses.map(c => ({
      name: c.name,
      discipline: c.discipline,
      credits: c.creditsEarned
    })));
    
    // Debug: Check PDF information in contributingCourses
    console.log(`🔍 PDF Debug: Contributing courses with PDF info:`);
    contributingCourses.forEach((course, index) => {
      console.log(`  Course ${index + 1}: "${course.name}" by "${course.organization}"`);
      console.log(`    - Has pdfPath: ${!!course.pdfPath}`);
      console.log(`    - Has pdfFileName: ${!!course.pdfFileName}`);
      console.log(`    - pdfPath value: ${course.pdfPath || 'null'}`);
      console.log(`    - pdfFileName value: ${course.pdfFileName || 'null'}`);
    });

    const claim = await BprndClaim.create({
      studentId: id,
      umbrellaKey: key,
      qualification: q,
      requiredCredits,
      status: 'pending',
      courses: contributingCourses // Include the contributing courses
    });
    
    console.log(`✅ Certification claim created successfully:`, {
      claimId: claim._id,
      studentId: claim.studentId,
      umbrellaKey: claim.umbrellaKey,
      qualification: claim.qualification,
      coursesCount: claim.courses.length,
      totalCredits: claim.courses.reduce((sum, c) => sum + c.creditsEarned, 0)
    });

    return res.status(201).json({ success: true, message: 'Certification request submitted', data: claim });
  } catch (error) {
    console.error('Error creating certification request:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// List student claims
router.get('/student/:id/claims', async (req, res) => {
  try {
    const { id } = req.params;
    const claims = await BprndClaim.find({ studentId: new mongoose.Types.ObjectId(id) }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: claims });
  } catch (error) {
    console.error('Error listing claims:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// List student certificates
router.get('/student/:id/certificates', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate student ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid student ID format' 
      });
    }

    // Retrieve all certificates for the student
    const certificates = await BprndCertificate.find({ studentId: new mongoose.Types.ObjectId(id) })
      .sort({ issuedAt: -1 }) // Sort by most recent first
      .lean();

    return res.status(200).json({ 
      success: true, 
      message: 'Certificates retrieved successfully',
      count: certificates.length,
      data: certificates 
    });
  } catch (error) {
    console.error('Error listing student certificates:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Internal finalize: called by admin/POC APIs once both approved; idempotent
router.post('/internal/bprnd/claims/:claimId/finalize', async (req, res) => {
  try {
    const { claimId } = req.params;
    const claim = await BprndClaim.findById(claimId);
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

    // Idempotency: if certificate already exists for this claim, return success with current totals
    const existingCertificate = await BprndCertificate.findOne({ claimId: claim._id });
    if (existingCertificate) {
      const studentForTotals = await CreditCalculation.findById(claim.studentId).select('Total_Credits');
      return res.status(200).json({
        success: true,
        message: 'Already finalized',
        data: {
          claim,
          certificate: existingCertificate,
          totals: { total: studentForTotals?.Total_Credits ?? null }
        }
      });
    }

    // Require both approvals using the new boolean fields
    const bothApproved = claim.admin_approved === true && claim.poc_approved === true;
    if (!bothApproved) return res.status(400).json({ success: false, message: 'Both approvals required' });

    // Deduct credits atomically with minimal race window
    const key = claim.umbrellaKey;
    const student = await CreditCalculation.findById(claim.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const beforeUmbrella = Number(student[key] || 0);
    const beforeTotal = Number(student.Total_Credits || 0);
    if (beforeUmbrella < claim.requiredCredits) {
      claim.status = 'declined';
      await claim.save();
      return res.status(409).json({ success: false, message: 'Insufficient credits at finalize time; claim declined' });
    }

    student[key] = Math.max(0, beforeUmbrella - claim.requiredCredits);
    student.Total_Credits = Math.max(0, beforeTotal - claim.requiredCredits);
    await student.save();

    // Issue certificate record
    const certificate = await BprndCertificate.create({
      studentId: claim.studentId,
      umbrellaKey: key,
      qualification: claim.qualification,
      claimId: claim._id,
      issuedAt: new Date(),
      certificateNo: `rru_${key}_${nextSequenceNumber}`,
    });

    // Mark claim approved
    claim.status = 'approved';
    await claim.save();

    return res.status(200).json({ success: true, message: 'Finalized: credits deducted and certificate issued', data: { claim, certificate, totals: { total: student.Total_Credits, umbrella: student[key] } } });
  } catch (error) {
    console.error('Error finalizing claim:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get student profile by ID
app.get('/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    // Find student in the bprndstudents collection
    const student = await CreditCalculation.findById(id).lean();
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Return student profile data
    return res.status(200).json({
      success: true,
      message: 'Student profile retrieved successfully',
      student: {
        _id: student._id,
        Name: student.Name,
        email: student.email,
        Designation: student.Designation,
        State: student.State,
        Umbrella: student.Umbrella,
        Department: student.Department,
        EmployeeId: student.EmployeeId,
        Phone: student.Phone,
        JoiningDate: student.JoiningDate,
        Total_Credits: student.Total_Credits,
        // Include umbrella-specific credits (dynamically based on available umbrella fields)
        ...(await (async () => {
          const umbrellaFields = await umbrella.find({}).lean();
          const credits = {};
          if (umbrellaFields && umbrellaFields.length > 0) {
            umbrellaFields.forEach(u => {
              const fieldKey = u.name.replace(/\s+/g, '_');
              credits[fieldKey] = student[fieldKey] || 0;
            });
          }
          return credits;
        })()),
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      }
    });

  } catch (error) {
    console.error('Error retrieving student profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get student certificates by ID
app.get('/student/:id/certificates', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    // Find all certificates for the student
    const certificates = await BprndCertificate.find({ studentId: id })
      .sort({ issuedAt: -1 }) // Sort by most recent first
      .lean();
    
    if (!certificates || certificates.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No certificates found for this student',
        data: [],
        count: 0
      });
    }

    // Return certificates data
    return res.status(200).json({
      success: true,
      message: 'Student certificates retrieved successfully',
      data: certificates.map(cert => ({
        _id: cert._id,
        studentId: cert.studentId,
        umbrellaKey: cert.umbrellaKey,
        qualification: cert.qualification,
        claimId: cert.claimId,
        issuedAt: cert.issuedAt,
        certificateNo: cert.certificateNo,
        createdAt: cert.createdAt,
        updatedAt: cert.updatedAt
      })),
      count: certificates.length
    });

  } catch (error) {
    console.error('Error retrieving student certificates:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Generate PDF certificate for download
router.get('/student/certificate/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid certificate id' });
    }

    // Fetch certificate by id
    const cert = await BprndCertificate.findById(id)
      .populate('studentId', 'Name email EmployeeId Designation State Department') // Populate student details from credit_calculations
      .populate('claimId', 'umbrellaKey qualification requiredCredits') // Populate claim details
      .lean();

    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Prepare response headers for file download
    const fileName = `bprnd-certificate-${cert.umbrellaKey}-${cert.certificateNo || cert._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Create PDF and pipe to response
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    // --- Certificate layout ---
    // Header
    doc.fontSize(22).text('BPR&D Certificate', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).text('Issued by Rashtriya Raksha University', { align: 'center' });
    doc.moveDown(1.5);

    // Divider
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Student Information
    doc.fontSize(16).text('Student Information', { underline: true });
    doc.moveDown(0.5);
    
    const student = cert.studentId;
    if (student) {
      doc.fontSize(12)
        .text(`Name: ${student.Name || 'N/A'}`)
        .text(`Employee ID: ${student.EmployeeId || 'N/A'}`)
        .text(`Designation: ${student.Designation || 'N/A'}`)
        .text(`State: ${student.State || 'N/A'}`)
        .text(`Department: ${student.Department || 'N/A'}`);
    }
    doc.moveDown(1);

    // Certificate Details
    doc.fontSize(16).text('Certificate Details', { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12)
      .text(`Certificate ID: ${cert._id}`)
      .text(`Umbrella: ${cert.umbrellaKey.replace(/_/g, ' ')}`)
      .text(`Qualification: ${cert.qualification}`)
      .text(`Certificate No: ${cert.certificateNo || 'N/A'}`)
      .text(`Issued Date: ${new Date(cert.issuedAt).toLocaleDateString()}`);

    doc.moveDown(1);

    // Claim Information (if available)
    if (cert.claimId) {
      doc.fontSize(16).text('Training Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12)
        .text(`Required Credits: ${cert.claimId.requiredCredits || 'N/A'}`)
        .text(`Discipline: ${cert.claimId.umbrellaKey || cert.umbrellaKey}`);
      doc.moveDown(1);
    }

    // Signature area
    doc.moveDown(2);
    doc.text('______________________________', { align: 'right' });
    doc.text('Authorized Signatory', { align: 'right' });
    doc.moveDown(0.5);
    doc.text('Rashtriya Raksha University', { align: 'right' });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text('This certificate is issued upon successful completion of the training program.', {
      align: 'center',
    });

    // Finalize and end stream
    doc.end();
  } catch (err) {
    console.error('PDF generation error:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      certificateId: req.params.id
    });
    // If headers already sent (e.g., while streaming), we cannot send JSON
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Failed to generate certificate PDF',
        details: err.message 
      });
    }
    // If streaming already began, just destroy the connection
    res.end();
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
