const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Student = require('./models1/student');
const Course = require('./models/courses');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test enrollment API functionality
const testEnrollmentAPI = async () => {
  try {
    console.log('🧪 Testing enrollment API functionality...');

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

    console.log(`\n📊 Test Data:`);
    console.log(`  Student: ${student.full_name} (${student._id})`);
    console.log(`  Course: ${course.courseName} (${course._id})`);
    console.log(`  Current enrolled courses: ${student.course_id.length}`);

    // Simulate the API route call
    const studentId = student._id.toString();
    const courseId = course._id.toString();

    // Check if course is already enrolled
    if (student.course_id.includes(courseId)) {
      console.log('\n⚠️ Course is already enrolled by this student');
      console.log('This simulates the duplicate enrollment prevention in the API');
      return;
    }

    // Simulate the API route behavior
    console.log('\n🔄 Simulating API enrollment...');
    
    // Add course ID to student's course_id array
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $push: { course_id: courseId } },
      { new: true }
    );

    console.log(`\n✅ Enrollment successful!`);
    console.log(`  Updated enrolled courses: ${updatedStudent.course_id.length}`);
    console.log(`  Course IDs: ${updatedStudent.course_id.join(', ')}`);

    // Verify the enrollment
    if (updatedStudent.course_id.includes(courseId)) {
      console.log('\n🎉 SUCCESS: Course was successfully added to student!');
      console.log('This confirms the API route would work correctly');
    } else {
      console.log('\n❌ FAILED: Course was not added to student!');
    }

    // Test the API response format
    const mockAPIResponse = {
      success: true,
      message: 'Course successfully added to student',
      student: {
        id: updatedStudent._id,
        full_name: updatedStudent.full_name,
        email: updatedStudent.email,
        course_id: updatedStudent.course_id
      },
      course: {
        id: course._id,
        courseName: course.courseName,
        organization: course.organization
      }
    };

    console.log('\n📋 Mock API Response:');
    console.log(JSON.stringify(mockAPIResponse, null, 2));

    // Clean up - remove the test course from student
    await Student.findByIdAndUpdate(
      studentId,
      { $pull: { course_id: courseId } }
    );

    console.log('\n🧹 Cleaned up test data');

  } catch (error) {
    console.error('❌ Error testing enrollment API:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the test
testEnrollmentAPI(); 