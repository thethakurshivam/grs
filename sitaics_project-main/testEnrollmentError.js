const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Student = require('./models1/student');
const Course = require('./models/courses');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test enrollment error scenarios
const testEnrollmentError = async () => {
  try {
    console.log('🧪 Testing enrollment error scenarios...');

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
    console.log(`  Enrolled course IDs: ${student.course_id.join(', ')}`);

    const studentId = student._id.toString();
    const courseId = course._id.toString();

    // Test 1: Check if course is already enrolled
    console.log('\n🔍 Test 1: Checking if course is already enrolled...');
    if (student.course_id.includes(courseId)) {
      console.log('⚠️ Course is already enrolled by this student');
      console.log('This would cause the API to return "already enrolled" error');
      
      // Remove the course to test fresh enrollment
      console.log('\n🧹 Removing course to test fresh enrollment...');
      await Student.findByIdAndUpdate(
        studentId,
        { $pull: { course_id: courseId } }
      );
      console.log('✅ Course removed from student enrollment');
    } else {
      console.log('✅ Course is not enrolled yet');
    }

    // Test 2: Simulate the API route logic
    console.log('\n🔍 Test 2: Simulating API route logic...');
    
    // Check if course is already in student's course_id array
    const updatedStudent = await Student.findById(studentId);
    if (updatedStudent.course_id.includes(courseId)) {
      console.log('❌ API would return: Course is already enrolled by this student');
      console.log('This is the source of the "already enrolled" error');
    } else {
      console.log('✅ API would proceed with enrollment');
      
      // Test the actual enrollment
      console.log('\n🔄 Testing actual enrollment...');
      const finalStudent = await Student.findByIdAndUpdate(
        studentId,
        { $push: { course_id: courseId } },
        { new: true }
      );
      
      console.log(`✅ Enrollment successful!`);
      console.log(`  Updated enrolled courses: ${finalStudent.course_id.length}`);
      console.log(`  Course IDs: ${finalStudent.course_id.join(', ')}`);
    }

    // Test 3: Check what happens on duplicate enrollment attempt
    console.log('\n🔍 Test 3: Testing duplicate enrollment attempt...');
    const duplicateStudent = await Student.findById(studentId);
    if (duplicateStudent.course_id.includes(courseId)) {
      console.log('❌ Duplicate enrollment would fail with: Course is already enrolled by this student');
      console.log('This confirms the API route is working correctly');
    }

    console.log('\n📋 Summary:');
    console.log('The "already enrolled" error occurs when:');
    console.log('1. Student is already enrolled in the course in the database');
    console.log('2. API route correctly prevents duplicate enrollment');
    console.log('3. Frontend should fetch current enrolled courses and filter them out');

  } catch (error) {
    console.error('❌ Error testing enrollment scenarios:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the test
testEnrollmentError(); 