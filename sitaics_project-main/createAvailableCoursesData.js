const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Course = require('./models/courses');
const MOU = require('./models/MOU');
const Field = require('./models/fields');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create available courses data
const createAvailableCourses = async () => {
  try {
    console.log('🚀 Starting to create available courses for enrollment...');

    // Get existing MOUs and Fields
    const mous = await MOU.find({});
    const fields = await Field.find({});

    if (mous.length === 0) {
      console.log('❌ No MOUs found. Please run createStudentCompletedCoursesData.js first.');
      return;
    }

    if (fields.length === 0) {
      console.log('❌ No Fields found. Please run createStudentCompletedCoursesData.js first.');
      return;
    }

    // Create available courses (upcoming and ongoing)
    const availableCourses = [
      {
        ID: 'COURSE005',
        courseName: 'Web Development Fundamentals',
        organization: 'TechCorp Solutions',
        duration: '4 months',
        indoorCredits: 12,
        outdoorCredits: 3,
        field: fields[0]._id, // Cybersecurity
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-11-30'),
        completionStatus: 'upcoming',
        mou_id: mous[0]._id,
        subjects: [
          {
            noOfPeriods: 16,
            periodsMin: 45,
            totalMins: 720,
            totalHrs: 12,
            credits: 4
          },
          {
            noOfPeriods: 12,
            periodsMin: 60,
            totalMins: 720,
            totalHrs: 12,
            credits: 4
          }
        ]
      },
      {
        ID: 'COURSE006',
        courseName: 'Python Programming',
        organization: 'TechCorp Solutions',
        duration: '3 months',
        indoorCredits: 10,
        outdoorCredits: 2,
        field: fields[1]._id, // AI/ML
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-10-15'),
        completionStatus: 'upcoming',
        mou_id: mous[0]._id,
        subjects: [
          {
            noOfPeriods: 20,
            periodsMin: 40,
            totalMins: 800,
            totalHrs: 13.33,
            credits: 4
          }
        ]
      },
      {
        ID: 'COURSE007',
        courseName: 'Database Management',
        organization: 'DataFlow Analytics',
        duration: '5 months',
        indoorCredits: 15,
        outdoorCredits: 5,
        field: fields[2]._id, // Data Science
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-10-31'),
        completionStatus: 'ongoing',
        mou_id: mous[1]._id,
        subjects: [
          {
            noOfPeriods: 18,
            periodsMin: 50,
            totalMins: 900,
            totalHrs: 15,
            credits: 5
          },
          {
            noOfPeriods: 8,
            periodsMin: 60,
            totalMins: 480,
            totalHrs: 8,
            credits: 3
          }
        ]
      },
      {
        ID: 'COURSE008',
        courseName: 'Cloud Computing Basics',
        organization: 'DataFlow Analytics',
        duration: '4 months',
        indoorCredits: 14,
        outdoorCredits: 6,
        field: fields[3]._id, // Big Data
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-31'),
        completionStatus: 'upcoming',
        mou_id: mous[1]._id,
        subjects: [
          {
            noOfPeriods: 22,
            periodsMin: 45,
            totalMins: 990,
            totalHrs: 16.5,
            credits: 5
          },
          {
            noOfPeriods: 10,
            periodsMin: 60,
            totalMins: 600,
            totalHrs: 10,
            credits: 4
          }
        ]
      },
      {
        ID: 'COURSE009',
        courseName: 'Mobile App Development',
        organization: 'TechCorp Solutions',
        duration: '6 months',
        indoorCredits: 18,
        outdoorCredits: 7,
        field: fields[0]._id, // Cybersecurity
        startDate: new Date('2024-08-15'),
        endDate: new Date('2025-02-15'),
        completionStatus: 'upcoming',
        mou_id: mous[0]._id,
        subjects: [
          {
            noOfPeriods: 24,
            periodsMin: 45,
            totalMins: 1080,
            totalHrs: 18,
            credits: 6
          },
          {
            noOfPeriods: 12,
            periodsMin: 60,
            totalMins: 720,
            totalHrs: 12,
            credits: 4
          }
        ]
      }
    ];

    let createdCount = 0;
    for (const courseData of availableCourses) {
      let course = await Course.findOne({ ID: courseData.ID });
      if (!course) {
        course = new Course(courseData);
        await course.save();
        console.log(`✅ Created available course: ${courseData.courseName} (${courseData.completionStatus})`);
        createdCount++;
      } else {
        console.log(`⚠️ Course already exists: ${courseData.courseName}`);
      }
    }

    console.log('\n🎉 Available courses creation completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`- Created ${createdCount} new available courses`);
    console.log(`- Total available courses: ${availableCourses.length}`);
    console.log('\n📋 Available Courses:');
    availableCourses.forEach(course => {
      console.log(`- ${course.courseName} (${course.completionStatus}) - ${course.duration}`);
    });

  } catch (error) {
    console.error('❌ Error creating available courses:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the script
createAvailableCourses(); 