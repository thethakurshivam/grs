const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Student = require('./models1/student');
const Course = require('./models/courses');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test student course enrollment
const testStudentCourseEnrollment = async () => {
  try {
    console.log('🧪 Testing student course enrollment route...');

    // Get a student to test with
    const student = await Student.findOne({});
    if (!student) {
      console.log('❌ No students found in database. Please create a student first.');
      return;
    }

    // Get a course to test with
    const course = await Course.findOne({});
    if (!course) {
      console.log('❌ No courses found in database. Please create a course first.');
      return;
    }

    console.log(`\n📊 Before enrollment:`);
    console.log(`  Student: ${student.full_name} (${student._id})`);
    console.log(`  Current courses: ${student.course_id.length}`);
    console.log(`  Course to add: ${course.courseName} (${course._id})`);

    // Simulate the API route behavior
    // Check if course is already enrolled
    if (student.course_id.includes(course._id.toString())) {
      console.log('\n⚠️ Course is already enrolled by this student');
      return;
    }

    // Add course ID to student's course_id array
    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      { $push: { course_id: course._id.toString() } },
      { new: true }
    );

    console.log(`\n📊 After enrollment:`);
    console.log(`  Student: ${updatedStudent.full_name}`);
    console.log(`  Updated courses: ${updatedStudent.course_id.length}`);
    console.log(`  Course IDs: ${updatedStudent.course_id.join(', ')}`);

    // Verify the enrollment worked
    if (updatedStudent.course_id.includes(course._id.toString())) {
      console.log('\n🎉 SUCCESS: Course was successfully added to student!');
    } else {
      console.log('\n❌ FAILED: Course was not added to student!');
    }

    // Test duplicate enrollment prevention
    console.log('\n🧪 Testing duplicate enrollment prevention...');
    const duplicateCheck = await Student.findById(student._id);
    if (duplicateCheck.course_id.includes(course._id.toString())) {
      console.log('✅ Duplicate enrollment correctly prevented (course already exists)');
    }

    // Clean up - remove the test course from student
    await Student.findByIdAndUpdate(
      student._id,
      { $pull: { course_id: course._id.toString() } }
    );

    console.log('\n🧹 Cleaned up test data');

  } catch (error) {
    console.error('❌ Error testing student course enrollment:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the test
testStudentCourseEnrollment(); 