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

async function addMoreUpcomingCoursesForJohnDoe() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Additional upcoming courses data
    const additionalUpcomingCourses = [
      {
        ID: 'COURSE-UP-006',
        mou_id: JOHN_DOE_MOU_ID,
        courseName: 'Cloud Computing Fundamentals',
        organization: 'Cloud Tech Academy',
        duration: '4 months',
        indoorCredits: 22,
        outdoorCredits: 8,
        field: SAMPLE_FIELD_IDS[0], // Cybersecurity
        startDate: new Date('2025-11-01'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 28,
            periodsMin: 45,
            totalMins: 1260,
            totalHrs: 21,
            credits: 7
          },
          {
            noOfPeriods: 24,
            periodsMin: 60,
            totalMins: 1440,
            totalHrs: 24,
            credits: 8
          }
        ]
      },
      {
        ID: 'COURSE-UP-007',
        mou_id: JOHN_DOE_MOU_ID,
        courseName: 'Internet of Things (IoT) Development',
        organization: 'IoT Innovation Institute',
        duration: '3 months',
        indoorCredits: 16,
        outdoorCredits: 6,
        field: SAMPLE_FIELD_IDS[1], // AI
        startDate: new Date('2025-12-01'),
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
            noOfPeriods: 18,
            periodsMin: 60,
            totalMins: 1080,
            totalHrs: 18,
            credits: 6
          }
        ]
      },
      {
        ID: 'COURSE-UP-008',
        mou_id: JOHN_DOE_MOU_ID,
        courseName: 'Digital Marketing Analytics',
        organization: 'Marketing Analytics Pro',
        duration: '2 months',
        indoorCredits: 14,
        outdoorCredits: 4,
        field: SAMPLE_FIELD_IDS[2], // Data Science
        startDate: new Date('2026-01-01'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 16,
            periodsMin: 45,
            totalMins: 720,
            totalHrs: 12,
            credits: 4
          },
          {
            noOfPeriods: 14,
            periodsMin: 60,
            totalMins: 840,
            totalHrs: 14,
            credits: 4
          }
        ]
      },
      {
        ID: 'COURSE-UP-009',
        mou_id: JOHN_DOE_MOU_ID,
        courseName: 'Robotics and Automation',
        organization: 'Robotics Institute',
        duration: '5 months',
        indoorCredits: 24,
        outdoorCredits: 10,
        field: SAMPLE_FIELD_IDS[3], // Machine Learning
        startDate: new Date('2026-02-01'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 32,
            periodsMin: 45,
            totalMins: 1440,
            totalHrs: 24,
            credits: 8
          },
          {
            noOfPeriods: 28,
            periodsMin: 60,
            totalMins: 1680,
            totalHrs: 28,
            credits: 9
          }
        ]
      },
      {
        ID: 'COURSE-UP-010',
        mou_id: JOHN_DOE_MOU_ID,
        courseName: 'Quantum Computing Basics',
        organization: 'Quantum Tech Academy',
        duration: '6 months',
        indoorCredits: 28,
        outdoorCredits: 12,
        field: SAMPLE_FIELD_IDS[4], // Blockchain
        startDate: new Date('2026-03-01'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 38,
            periodsMin: 45,
            totalMins: 1710,
            totalHrs: 28.5,
            credits: 9
          },
          {
            noOfPeriods: 32,
            periodsMin: 60,
            totalMins: 1920,
            totalHrs: 32,
            credits: 10
          }
        ]
      }
    ];

    console.log('📚 Adding more upcoming courses for John Doe...');
    console.log(`🎯 MOU ID: ${JOHN_DOE_MOU_ID}`);

    // Create and save each course
    for (const courseData of additionalUpcomingCourses) {
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

    console.log('🎉 Additional upcoming courses creation completed!');
    console.log(`📊 Total additional courses created: ${additionalUpcomingCourses.length}`);

    // Show final summary
    const allCourses = await Course.find({ mou_id: JOHN_DOE_MOU_ID }).select('ID courseName completionStatus');
    console.log(`\n📋 Total courses for John Doe's MOU: ${allCourses.length}`);
    
    const statusCounts = {};
    allCourses.forEach(course => {
      statusCounts[course.completionStatus] = (statusCounts[course.completionStatus] || 0) + 1;
    });
    
    console.log('📊 Final Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} courses`);
    });

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error creating additional upcoming courses:', error);
    process.exit(1);
  }
}

// Run the function
addMoreUpcomingCoursesForJohnDoe();
