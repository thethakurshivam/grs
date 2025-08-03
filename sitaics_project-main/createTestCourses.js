const mongoose = require('mongoose');
const Course = require('./models/courses');
const MOU = require('./models/MOU');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics';

async function createTestCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the test MOU ID
    const testMOU = await MOU.findOne({ ID: 'TEST-MOU-001' });
    if (!testMOU) {
      console.log('❌ Test MOU not found. Please run createTestData.js first.');
      return;
    }

    // Clear existing test courses
    console.log('🧹 Clearing existing test courses...');
    await Course.deleteMany({ 
      courseName: { 
        $in: [
          'Test Course 1', 
          'Test Course 2', 
          'Test Course 3',
          'Advanced Web Development',
          'Data Science Fundamentals',
          'Machine Learning Basics'
        ] 
      } 
    });

    // Create test courses
    const testCourses = [
      {
        ID: 'COURSE-001',
        courseName: 'Advanced Web Development',
        organization: 'Test University',
        duration: '12 weeks',
        indoorCredits: 3,
        outdoorCredits: 2,
        field: 'Computer Science',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        completionStatus: 'upcoming',
        mou_id: testMOU._id.toString(),
        description: 'Advanced web development course covering modern frameworks and technologies',
        level: 'Advanced',
        courseType: 'Online',
        credits: 5,
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
        ID: 'COURSE-002',
        courseName: 'Data Science Fundamentals',
        organization: 'Test University',
        duration: '8 weeks',
        indoorCredits: 2,
        outdoorCredits: 1,
        field: 'Data Science',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        completionStatus: 'upcoming',
        mou_id: testMOU._id.toString(),
        description: 'Introduction to data science concepts and tools',
        level: 'Beginner',
        courseType: 'Hybrid',
        credits: 3,
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
        ID: 'COURSE-003',
        courseName: 'Machine Learning Basics',
        organization: 'Test University',
        duration: '10 weeks',
        indoorCredits: 4,
        outdoorCredits: 2,
        field: 'Artificial Intelligence',
        startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        completionStatus: 'upcoming',
        mou_id: testMOU._id.toString(),
        description: 'Basic machine learning algorithms and applications',
        level: 'Intermediate',
        courseType: 'Online',
        credits: 6,
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
        ID: 'COURSE-004',
        courseName: 'Test Course 1',
        organization: 'Test University',
        duration: '6 weeks',
        indoorCredits: 2,
        outdoorCredits: 1,
        field: 'Computer Science',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        completionStatus: 'upcoming',
        mou_id: testMOU._id.toString(),
        description: 'Test course for upcoming courses display',
        level: 'Beginner',
        courseType: 'Online',
        credits: 3,
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
        ID: 'COURSE-005',
        courseName: 'Test Course 2',
        organization: 'Test University',
        duration: '4 weeks',
        indoorCredits: 1,
        outdoorCredits: 1,
        field: 'Engineering',
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        completionStatus: 'upcoming',
        mou_id: testMOU._id.toString(),
        description: 'Another test course for upcoming courses display',
        level: 'Intermediate',
        courseType: 'Hybrid',
        credits: 2,
        subjects: [
          {
            noOfPeriods: 4,
            periodsMin: 60,
            totalMins: 240,
            totalHrs: 4,
            credits: 1
          }
        ]
      }
    ];

    console.log('📚 Creating test courses...');
    const savedCourses = await Course.insertMany(testCourses);
    console.log(`✅ ${savedCourses.length} test courses created successfully!`);

    // Display course details
    console.log('\n📋 Test Courses Created:');
    savedCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.courseName} - ${course.field} (${course.completionStatus})`);
      console.log(`   Start Date: ${course.startDate.toLocaleDateString()}`);
      console.log(`   Credits: ${course.credits}`);
    });

    console.log('\n🎉 Test courses created successfully!');
    console.log('🌐 The upcoming courses card should now display the count correctly.');

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