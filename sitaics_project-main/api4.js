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
    const courseHistory = await CourseHistory.find({
      studentId: new mongoose.Types.ObjectId(id),
      discipline: { $regex: new RegExp(umbrella, 'i') } // Case-insensitive match
    })
    .sort({ createdAt: -1 }) // Sort by newest first
    .lean();

    console.log(`📊 Found ${courseHistory.length} course history records for ${umbrella}`);

    // Calculate summary statistics
    const totalCredits = courseHistory.reduce((sum, course) => sum + (course.creditsEarned || 0), 0);
    const totalHours = courseHistory.reduce((sum, course) => sum + (course.totalHours || 0), 0);
    const totalDays = courseHistory.reduce((sum, course) => sum + (course.noOfDays || 0), 0);

    return res.status(200).json({
      success: true,
      message: 'Course history retrieved successfully',
      data: {
        umbrella: umbrella,
        studentId: id,
        courses: courseHistory,
        summary: {
          totalCourses: courseHistory.length,
          totalCredits,
          totalHours,
          totalDays
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
    const { name, organization, discipline, studentId } = req.body;
    const totalHours = Number(req.body?.totalHours);
    const noOfDays = Number(req.body?.noOfDays);

    // Validate required fields
    if (!studentId || !name || !organization || !discipline || Number.isNaN(totalHours) || Number.isNaN(noOfDays) || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'studentId, name, organization, discipline, totalHours, noOfDays, and PDF file are required'
      });
    }

    if (totalHours < 0 || noOfDays < 0) {
      return res.status(400).json({
        success: false,
        message: 'totalHours and noOfDays must be non-negative numbers'
      });
    }

    // Create new pending credit record
    const pendingCredit = new PendingCredits({
      studentId,
      name: String(name),
      organization: String(organization),
      discipline: String(discipline),
      totalHours,
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
    const courseHistory = await CourseHistory.find({
      studentId: new mongoose.Types.ObjectId(id),
      discipline: key
    }).sort({ createdAt: 1 }).lean(); // Sort by oldest first for FIFO

    // Calculate which courses contribute to this certification
    const contributingCourses = [];
    let accumulatedCredits = 0;
    
    for (const course of courseHistory) {
      if (accumulatedCredits >= requiredCredits) break;
      
      const courseCredits = course.creditsEarned || 0;
      if (accumulatedCredits + courseCredits <= requiredCredits) {
        // This course fully contributes to the certification
        contributingCourses.push({
          courseName: course.name,
          organization: course.organization,
          hoursEarned: course.hoursEarned,
          creditsEarned: course.creditsEarned,
          completionDate: course.completionDate ? new Date(course.completionDate) : new Date(),
          courseId: course._id
        });
        accumulatedCredits += courseCredits;
      } else {
        // This course partially contributes (if needed)
        const remainingCredits = requiredCredits - accumulatedCredits;
        if (remainingCredits > 0) {
          contributingCourses.push({
            courseName: course.name,
            organization: course.organization,
            hoursEarned: Math.ceil(remainingCredits * 15), // Convert back to hours
            creditsEarned: remainingCredits,
            completionDate: course.completionDate ? new Date(course.completionDate) : new Date(),
            courseId: course._id
          });
          accumulatedCredits = requiredCredits;
        }
        break;
      }
    }

    console.log(`🔍 Certification request: ${accumulatedCredits}/${requiredCredits} credits from ${contributingCourses.length} courses`);

    const claim = await BprndClaim.create({
      studentId: id,
      umbrellaKey: key,
      qualification: q,
      requiredCredits,
      status: 'pending',
      courses: contributingCourses // Include the contributing courses
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

// List student pending credit requests
router.get('/student/:id/pending-credits', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate student ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid student ID format' 
      });
    }

    // Retrieve all pending credit requests for the student
    const pendingCredits = await PendingCredits.find({ studentId: new mongoose.Types.ObjectId(id) })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .lean();

    // Add status labels and format dates
    const formattedRequests = pendingCredits.map(request => ({
      ...request,
      statusLabel: getStatusLabel(request.status),
      statusColor: getStatusColor(request.status),
      formattedCreatedAt: new Date(request.createdAt).toLocaleDateString('en-IN'),
      formattedPocApprovedAt: request.poc_approved_at ? new Date(request.poc_approved_at).toLocaleDateString('en-IN') : null,
      formattedAdminApprovedAt: request.admin_approved_at ? new Date(request.admin_approved_at).toLocaleDateString('en-IN') : null,
      formattedDeclinedAt: request.declined_at ? new Date(request.declined_at).toLocaleDateString('en-IN') : null
    }));

    return res.status(200).json({ 
      success: true, 
      message: 'Pending credit requests retrieved successfully',
      count: pendingCredits.length,
      data: formattedRequests 
    });
  } catch (error) {
    console.error('Error listing student pending credit requests:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Helper functions for status formatting
function getStatusLabel(status) {
  const statusMap = {
    'pending': 'Pending POC Approval',
    'poc_approved': 'POC Approved - Waiting for Admin',
    'admin_approved': 'Admin Approved - Finalized',
    'declined': 'Declined',
    'approved': 'Approved'
  };
  return statusMap[status] || status;
}

function getStatusColor(status) {
  const colorMap = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'poc_approved': 'bg-blue-100 text-blue-800',
    'admin_approved': 'bg-green-100 text-green-800',
    'declined': 'bg-red-100 text-red-800',
    'approved': 'bg-green-100 text-green-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

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
      certificateNo: `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
