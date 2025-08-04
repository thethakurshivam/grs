const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.student' });

// Import the models
const Student = require('./models1/student');
const Course = require('./models/courses');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function checkStudentMOU() {
  try {
    // Find the student
    const student = await Student.findOne({ email: 'john.doe@example.com' });
    if (!student) {
      console.log('Student not found');
      return;
    }

    console.log('Student MOU ID:', student.mou_id);
    console.log('Student MOU ID type:', typeof student.mou_id);

    // Find completed courses with this MOU ID
    const completedCourses = await Course.find({ 
      mou_id: student.mou_id,
      completionStatus: 'completed'
    });

    console.log(`\nFound ${completedCourses.length} completed courses for student's MOU:`);
    completedCourses.forEach(course => {
      console.log(`- ${course.courseName} (MOU: ${course.mou_id})`);
    });

    // Find all completed courses regardless of MOU
    const allCompletedCourses = await Course.find({ completionStatus: 'completed' });
    console.log(`\nTotal completed courses in database: ${allCompletedCourses.length}`);
    allCompletedCourses.forEach(course => {
      console.log(`- ${course.courseName} (MOU: ${course.mou_id})`);
    });

  } catch (error) {
    console.error('Error checking student MOU:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

checkStudentMOU(); 