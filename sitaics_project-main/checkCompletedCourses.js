const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.student' });

// Import the Course model
const Course = require('./models/courses');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function checkCompletedCourses() {
  try {
    // Find all courses with completionStatus: 'completed'
    const completedCourses = await Course.find({ completionStatus: 'completed' });
    
    console.log(`Found ${completedCourses.length} completed courses:`);
    completedCourses.forEach(course => {
      console.log(`- ${course.courseName} (${course.completionStatus})`);
    });

    // Find all courses
    const allCourses = await Course.find({});
    console.log(`\nTotal courses in database: ${allCourses.length}`);
    allCourses.forEach(course => {
      console.log(`- ${course.courseName} (${course.completionStatus})`);
    });

  } catch (error) {
    console.error('Error checking completed courses:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

checkCompletedCourses(); 