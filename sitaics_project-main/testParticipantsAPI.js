const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Student = require('./models1/student');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test participants API functionality
const testParticipantsAPI = async () => {
  try {
    console.log('🧪 Testing participants API functionality...');

    // Get all students from database
    const students = await Student.find();
    
    console.log(`\n📊 Found ${students.length} students in database:`);
    
    if (students.length === 0) {
      console.log('❌ No students found in database');
      console.log('This is why the Participants Trained card shows 0');
      return;
    }

    // Show sample student data
    console.log('\n📋 Sample student data (first 3):');
    students.slice(0, 3).forEach((student, index) => {
      console.log(`\n${index + 1}. Student Details:`);
      console.log(`   Full Name: ${student.full_name}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Enrollment Number: ${student.enrollment_number}`);
      console.log(`   Rank: ${student.rank}`);
      console.log(`   Batch No: ${student.batch_no}`);
      console.log(`   Mobile: ${student.mobile_no}`);
      console.log(`   MOU ID: ${student.mou_id}`);
      console.log(`   Course IDs: ${student.course_id.length} courses`);
    });

    // Simulate the API response
    const mockAPIResponse = {
      success: true,
      count: students.length,
      data: students
    };

    console.log('\n📋 Mock API Response:');
    console.log(`  Success: ${mockAPIResponse.success}`);
    console.log(`  Count: ${mockAPIResponse.count}`);
    console.log(`  Data: ${mockAPIResponse.data.length} students`);

    // Check field mapping
    console.log('\n🔍 Field mapping check:');
    console.log('Frontend expects:');
    console.log('  - fullName (from full_name)');
    console.log('  - enrollmentNumber (from enrollment_number)');
    console.log('  - mobileNumber (from mobile_no)');
    console.log('  - dateOfBirth (from dob)');
    console.log('  - birthPlace (from birth_place)');
    console.log('  - birthState (from birth_state)');
    console.log('  - aadharNo (from aadhar_no)');
    console.log('  - serialNumberRRU (from serial_number)');

    // Test field mapping
    if (students.length > 0) {
      const sampleStudent = students[0];
      console.log('\n📋 Sample field mapping:');
      console.log(`  full_name → fullName: ${sampleStudent.full_name}`);
      console.log(`  enrollment_number → enrollmentNumber: ${sampleStudent.enrollment_number}`);
      console.log(`  mobile_no → mobileNumber: ${sampleStudent.mobile_no}`);
      console.log(`  dob → dateOfBirth: ${sampleStudent.dob}`);
      console.log(`  birth_place → birthPlace: ${sampleStudent.birth_place}`);
      console.log(`  birth_state → birthState: ${sampleStudent.birth_state}`);
      console.log(`  aadhar_no → aadharNo: ${sampleStudent.aadhar_no}`);
      console.log(`  serial_number → serialNumberRRU: ${sampleStudent.serial_number}`);
    }

    console.log('\n🎉 Participants API test completed!');
    console.log(`\n📋 Summary:`);
    console.log(`   - Students found: ${students.length}`);
    console.log(`   - API route: /api/participants`);
    console.log(`   - Model: Student (from models1/student.js)`);
    console.log(`   - Frontend component: ParticipantsCard`);

  } catch (error) {
    console.error('❌ Error testing participants API:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the test
testParticipantsAPI(); 