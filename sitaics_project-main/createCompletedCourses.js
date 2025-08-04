const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.student' });

// Import the models
const Course = require('./models/courses');
const MOU = require('./models/MOU');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function createCompletedCourses() {
  try {
    // Find the existing MOU
    const existingMOU = await MOU.findOne({ ID: 'MOU001' });
    if (!existingMOU) {
      console.log('MOU not found. Please create MOU first.');
      return;
    }

    console.log('Using existing MOU:', existingMOU.ID);

    // Sample completed courses data
    const completedCourses = [
      {
        ID: "CS201",
        courseName: "Introduction to Programming",
        organization: "RRU University",
        duration: "8 weeks",
        indoorCredits: 2,
        outdoorCredits: 1,
        field: "Computer Science",
        startDate: new Date("2023-01-01"),
        completionStatus: "completed",
        mou_id: existingMOU._id,
        subjects: [
          {
            noOfPeriods: 8,
            periodsMin: 45,
            totalMins: 360,
            totalHrs: 6,
            credits: 3
          }
        ]
      },
      {
        ID: "CS202",
        courseName: "Web Development Basics",
        organization: "RRU University",
        duration: "10 weeks",
        indoorCredits: 2,
        outdoorCredits: 1,
        field: "Computer Science",
        startDate: new Date("2023-03-01"),
        completionStatus: "completed",
        mou_id: existingMOU._id,
        subjects: [
          {
            noOfPeriods: 10,
            periodsMin: 45,
            totalMins: 450,
            totalHrs: 7.5,
            credits: 3
          }
        ]
      },
      {
        ID: "CS203",
        courseName: "Database Fundamentals",
        organization: "RRU University",
        duration: "12 weeks",
        indoorCredits: 3,
        outdoorCredits: 1,
        field: "Computer Science",
        startDate: new Date("2023-05-01"),
        completionStatus: "completed",
        mou_id: existingMOU._id,
        subjects: [
          {
            noOfPeriods: 12,
            periodsMin: 45,
            totalMins: 540,
            totalHrs: 9,
            credits: 4
          }
        ]
      }
    ];

    // Insert completed courses
    const createdCourses = await Course.insertMany(completedCourses);
    console.log(`Successfully created ${createdCourses.length} completed courses:`);
    
    createdCourses.forEach(course => {
      console.log(`- ${course.courseName} (${course.indoorCredits + course.outdoorCredits} credits, ${course.duration})`);
    });

    console.log('\nCompleted courses are ready for testing!');
  } catch (error) {
    console.error('Error creating completed courses:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

createCompletedCourses(); 