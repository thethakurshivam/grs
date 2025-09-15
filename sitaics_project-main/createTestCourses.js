const mongoose = require('mongoose');
const Course = require('./models/courses');
const MOU = require('./models/MOU');
const Field = require('./models/fields');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics';

async function createTestCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all available fields
    const fields = await Field.find();
    if (fields.length === 0) {
      console.log('❌ No fields found. Please run createTestFields.js first.');
      return;
    }

    // Get the test MOU ID
    const testMOU = await MOU.findOne({ ID: 'TEST-MOU-001' });
    if (!testMOU) {
      console.log('❌ Test MOU not found. Please run createTestData.js first.');
      return;
    }

    // Clear existing test courses
    console.log('🧹 Clearing existing test courses...');
    await Course.deleteMany({});

    // Create comprehensive test courses
    const testCourses = [
      // Computer Science & Technology Courses
      {
        ID: 'CS-001',
        courseName: 'Advanced Web Development',
        organization: 'MIT',
        duration: '12 weeks',
        indoorCredits: 3,
        outdoorCredits: 2,
        field: fields.find(f => f.name === 'Computer Science')?._id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        completionStatus: 'upcoming',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 10,
            periodsMin: 45,
            totalMins: 450,
            totalHrs: 7.5,
            credits: 2
          }
        ]
      },
      {
        ID: 'CS-002',
        courseName: 'Data Science Fundamentals',
        organization: 'Stanford University',
        duration: '8 weeks',
        indoorCredits: 2,
        outdoorCredits: 1,
        field: fields.find(f => f.name === 'Data Science')?._id,
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        completionStatus: 'ongoing',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 8,
            periodsMin: 60,
            totalMins: 480,
            totalHrs: 8,
            credits: 1
          }
        ]
      },
      {
        ID: 'CS-003',
        courseName: 'Machine Learning Basics',
        organization: 'Harvard University',
        duration: '10 weeks',
        indoorCredits: 4,
        outdoorCredits: 2,
        field: fields.find(f => f.name === 'Artificial Intelligence')?._id,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        completionStatus: 'completed',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 12,
            periodsMin: 50,
            totalMins: 600,
            totalHrs: 10,
            credits: 3
          }
        ]
      },
      {
        ID: 'CS-004',
        courseName: 'Cybersecurity Essentials',
        organization: 'Carnegie Mellon',
        duration: '6 weeks',
        indoorCredits: 2,
        outdoorCredits: 1,
        field: fields.find(f => f.name === 'Cybersecurity')?._id,
        startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        completionStatus: 'upcoming',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 6,
            periodsMin: 45,
            totalMins: 270,
            totalHrs: 4.5,
            credits: 1
          }
        ]
      },

      // Engineering Courses
      {
        ID: 'ENG-001',
        courseName: 'Mechanical Engineering Design',
        organization: 'Caltech',
        duration: '16 weeks',
        indoorCredits: 4,
        outdoorCredits: 3,
        field: fields.find(f => f.name === 'Mechanical Engineering')?._id,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completionStatus: 'ongoing',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 15,
            periodsMin: 60,
            totalMins: 900,
            totalHrs: 15,
            credits: 4
          }
        ]
      },
      {
        ID: 'ENG-002',
        courseName: 'Electrical Circuit Analysis',
        organization: 'MIT',
        duration: '14 weeks',
        indoorCredits: 3,
        outdoorCredits: 2,
        field: fields.find(f => f.name === 'Electrical Engineering')?._id,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        completionStatus: 'upcoming',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 12,
            periodsMin: 50,
            totalMins: 600,
            totalHrs: 10,
            credits: 3
          }
        ]
      },

      // Business & Management Courses
      {
        ID: 'BUS-001',
        courseName: 'Business Administration Fundamentals',
        organization: 'Harvard Business School',
        duration: '12 weeks',
        indoorCredits: 3,
        outdoorCredits: 2,
        field: fields.find(f => f.name === 'Business Administration')?._id,
        startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        completionStatus: 'completed',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 10,
            periodsMin: 45,
            totalMins: 450,
            totalHrs: 7.5,
            credits: 2
          }
        ]
      },
      {
        ID: 'BUS-002',
        courseName: 'Financial Management',
        organization: 'Wharton School',
        duration: '10 weeks',
        indoorCredits: 2,
        outdoorCredits: 1,
        field: fields.find(f => f.name === 'Finance')?._id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        completionStatus: 'upcoming',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 8,
            periodsMin: 60,
            totalMins: 480,
            totalHrs: 8,
            credits: 1
          }
        ]
      },

      // Healthcare & Medicine Courses
      {
        ID: 'MED-001',
        courseName: 'Medical Technology Fundamentals',
        organization: 'Johns Hopkins',
        duration: '8 weeks',
        indoorCredits: 2,
        outdoorCredits: 1,
        field: fields.find(f => f.name === 'Medical Technology')?._id,
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        completionStatus: 'ongoing',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 6,
            periodsMin: 45,
            totalMins: 270,
            totalHrs: 4.5,
            credits: 1
          }
        ]
      },
      {
        ID: 'MED-002',
        courseName: 'Public Health Essentials',
        organization: 'Yale University',
        duration: '12 weeks',
        indoorCredits: 3,
        outdoorCredits: 2,
        field: fields.find(f => f.name === 'Public Health')?._id,
        startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        completionStatus: 'upcoming',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 10,
            periodsMin: 50,
            totalMins: 500,
            totalHrs: 8.33,
            credits: 2
          }
        ]
      },

      // Education Courses
      {
        ID: 'EDU-001',
        courseName: 'Educational Technology',
        organization: 'Stanford Graduate School of Education',
        duration: '10 weeks',
        indoorCredits: 2,
        outdoorCredits: 1,
        field: fields.find(f => f.name === 'Educational Technology')?._id,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completionStatus: 'ongoing',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 8,
            periodsMin: 60,
            totalMins: 480,
            totalHrs: 8,
            credits: 1
          }
        ]
      },

      // Arts & Humanities Courses
      {
        ID: 'ART-001',
        courseName: 'Digital Media Production',
        organization: 'NYU Tisch',
        duration: '8 weeks',
        indoorCredits: 2,
        outdoorCredits: 1,
        field: fields.find(f => f.name === 'Digital Media')?._id,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        completionStatus: 'upcoming',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 6,
            periodsMin: 45,
            totalMins: 270,
            totalHrs: 4.5,
            credits: 1
          }
        ]
      },

      // Social Sciences Courses
      {
        ID: 'SOC-001',
        courseName: 'Psychology Fundamentals',
        organization: 'University of California',
        duration: '12 weeks',
        indoorCredits: 3,
        outdoorCredits: 2,
        field: fields.find(f => f.name === 'Psychology')?._id,
        startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        completionStatus: 'completed',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 10,
            periodsMin: 50,
            totalMins: 500,
            totalHrs: 8.33,
            credits: 2
          }
        ]
      },

      // Natural Sciences Courses
      {
        ID: 'SCI-001',
        courseName: 'Environmental Science',
        organization: 'UC Berkeley',
        duration: '10 weeks',
        indoorCredits: 2,
        outdoorCredits: 1,
        field: fields.find(f => f.name === 'Environmental Science')?._id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        completionStatus: 'upcoming',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 8,
            periodsMin: 60,
            totalMins: 480,
            totalHrs: 8,
            credits: 1
          }
        ]
      },

      // Law & Justice Courses
      {
        ID: 'LAW-001',
        courseName: 'Criminal Justice System',
        organization: 'Yale Law School',
        duration: '12 weeks',
        indoorCredits: 3,
        outdoorCredits: 2,
        field: fields.find(f => f.name === 'Criminal Justice')?._id,
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        completionStatus: 'ongoing',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 10,
            periodsMin: 45,
            totalMins: 450,
            totalHrs: 7.5,
            credits: 2
          }
        ]
      },

      // Architecture & Design Courses
      {
        ID: 'ARC-001',
        courseName: 'Architectural Design Principles',
        organization: 'Harvard Graduate School of Design',
        duration: '16 weeks',
        indoorCredits: 4,
        outdoorCredits: 3,
        field: fields.find(f => f.name === 'Architecture')?._id,
        startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        completionStatus: 'upcoming',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 15,
            periodsMin: 60,
            totalMins: 900,
            totalHrs: 15,
            credits: 4
          }
        ]
      },

      // Energy & Sustainability Courses
      {
        ID: 'ENV-001',
        courseName: 'Renewable Energy Systems',
        organization: 'Stanford University',
        duration: '10 weeks',
        indoorCredits: 2,
        outdoorCredits: 1,
        field: fields.find(f => f.name === 'Renewable Energy')?._id,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completionStatus: 'ongoing',
        mou_id: testMOU._id,
        subjects: [
          {
            noOfPeriods: 8,
            periodsMin: 60,
            totalMins: 480,
            totalHrs: 8,
            credits: 1
          }
        ]
      }
    ];

    // Filter out courses where field is not found
    const validCourses = testCourses.filter(course => course.field);
    console.log(`📚 Creating ${validCourses.length} test courses...`);
    
    const savedCourses = await Course.insertMany(validCourses);
    console.log(`✅ ${savedCourses.length} test courses created successfully!`);

    // Update field counts
    console.log('🔄 Updating field counts...');
    for (const field of fields) {
      const courseCount = await Course.countDocuments({ field: field._id });
      field.count = courseCount;
      await field.save();
    }

    // Display course details
    console.log('\n📋 Test Courses Created:');
    savedCourses.forEach((course, index) => {
      const fieldName = fields.find(f => f._id.toString() === course.field.toString())?.name || 'Unknown';
      console.log(`${index + 1}. ${course.courseName} - ${fieldName} (${course.completionStatus})`);
      console.log(`   Start Date: ${course.startDate.toLocaleDateString()}`);
      console.log(`   Credits: ${course.indoorCredits + course.outdoorCredits}`);
    });

    console.log('\n🎉 Test courses created successfully!');
    console.log('🌐 The sector training fields should now show course counts.');

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error creating test courses:', error);
    process.exit(1);
  }
}

// Run the function
createTestCourses(); 