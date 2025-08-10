const mongoose = require('mongoose');
const Course = require('./models/courses');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics';

// John Doe's MOU ID
const JOHN_DOE_MOU_ID = '688d61c8ecc389d883368363';

// Sample field IDs (you may need to adjust these based on your actual field IDs)
const SAMPLE_FIELD_IDS = [
  '507f1f77bcf86cd799439011', // Cybersecurity
  '507f1f77bcf86cd799439012', // Artificial Intelligence
  '507f1f77bcf86cd799439013', // Data Science
  '507f1f77bcf86cd799439014', // Machine Learning
  '507f1f77bcf86cd799439015'  // Blockchain
];

async function createUpcomingCoursesForJohnDoe() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Sample upcoming courses data
    const upcomingCourses = [
      {
        ID: 'COURSE-UP-001',
        mou_id: JOHN_DOE_MOU_ID,
        courseName: 'Advanced Cybersecurity Fundamentals',
        organization: 'Tech Institute of India',
        duration: '3 months',
        indoorCredits: 15,
        outdoorCredits: 5,
        field: SAMPLE_FIELD_IDS[0], // Cybersecurity
        startDate: new Date('2025-06-01'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 20,
            periodsMin: 45,
            totalMins: 900,
            totalHrs: 15,
            credits: 5
          },
          {
            noOfPeriods: 15,
            periodsMin: 60,
            totalMins: 900,
            totalHrs: 15,
            credits: 5
          }
        ]
      },
      {
        ID: 'COURSE-UP-002',
        mou_id: JOHN_DOE_MOU_ID,
        courseName: 'AI and Machine Learning Basics',
        organization: 'Digital Learning Academy',
        duration: '4 months',
        indoorCredits: 20,
        outdoorCredits: 8,
        field: SAMPLE_FIELD_IDS[1], // AI
        startDate: new Date('2025-07-15'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 25,
            periodsMin: 45,
            totalMins: 1125,
            totalHrs: 18.75,
            credits: 6
          },
          {
            noOfPeriods: 20,
            periodsMin: 60,
            totalMins: 1200,
            totalHrs: 20,
            credits: 7
          }
        ]
      },
      {
        ID: 'COURSE-UP-003',
        mou_id: JOHN_DOE_MOU_ID,
        courseName: 'Data Science and Analytics',
        organization: 'Analytics Pro Institute',
        duration: '5 months',
        indoorCredits: 18,
        outdoorCredits: 10,
        field: SAMPLE_FIELD_IDS[2], // Data Science
        startDate: new Date('2025-08-01'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 30,
            periodsMin: 45,
            totalMins: 1350,
            totalHrs: 22.5,
            credits: 8
          },
          {
            noOfPeriods: 25,
            periodsMin: 60,
            totalMins: 1500,
            totalHrs: 25,
            credits: 9
          }
        ]
      },
      {
        ID: 'COURSE-UP-004',
        mou_id: JOHN_DOE_MOU_ID,
        courseName: 'Blockchain Technology Fundamentals',
        organization: 'Blockchain Institute',
        duration: '2 months',
        indoorCredits: 12,
        outdoorCredits: 6,
        field: SAMPLE_FIELD_IDS[4], // Blockchain
        startDate: new Date('2025-09-01'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 18,
            periodsMin: 45,
            totalMins: 810,
            totalHrs: 13.5,
            credits: 4
          },
          {
            noOfPeriods: 15,
            periodsMin: 60,
            totalMins: 900,
            totalHrs: 15,
            credits: 5
          }
        ]
      },
      {
        ID: 'COURSE-UP-005',
        mou_id: JOHN_DOE_MOU_ID,
        courseName: 'Advanced Machine Learning Applications',
        organization: 'ML Masters Academy',
        duration: '6 months',
        indoorCredits: 25,
        outdoorCredits: 12,
        field: SAMPLE_FIELD_IDS[3], // Machine Learning
        startDate: new Date('2025-10-01'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 35,
            periodsMin: 45,
            totalMins: 1575,
            totalHrs: 26.25,
            credits: 9
          },
          {
            noOfPeriods: 30,
            periodsMin: 60,
            totalMins: 1800,
            totalHrs: 30,
            credits: 10
          }
        ]
      }
    ];

    console.log('📚 Creating upcoming courses for John Doe...');
    console.log(`🎯 MOU ID: ${JOHN_DOE_MOU_ID}`);

    // Create and save each course
    for (const courseData of upcomingCourses) {
      try {
        const course = new Course(courseData);
        const savedCourse = await course.save();
        console.log(`✅ Created course: ${savedCourse.courseName} (ID: ${savedCourse.ID})`);
        console.log(`   📅 Start Date: ${savedCourse.startDate.toDateString()}`);
        console.log(`   🏢 Organization: ${savedCourse.organization}`);
        console.log(`   ⏱️ Duration: ${savedCourse.duration}`);
        console.log(`   🎯 Status: ${savedCourse.completionStatus}`);
        console.log(`   📊 Indoor Credits: ${savedCourse.indoorCredits}, Outdoor Credits: ${savedCourse.outdoorCredits}`);
        console.log('');
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️ Course ${courseData.ID} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating course ${courseData.ID}:`, error.message);
        }
      }
    }

    console.log('🎉 Upcoming courses creation completed!');
    console.log(`📊 Total courses created: ${upcomingCourses.length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error creating upcoming courses:', error);
    process.exit(1);
  }
}

// Run the function
createUpcomingCoursesForJohnDoe();
