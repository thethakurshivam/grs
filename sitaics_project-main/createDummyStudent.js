const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Student = require('./models1/student');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics';

async function createDummyStudent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Hash password
    const hashedPassword = await bcrypt.hash('student123', 10);

    // Create dummy student data
    const dummyStudent = new Student({
      sr_no: 1001,
      batch_no: 'BATCH-2024-01',
      rank: '1st',
      serial_number: 'SR001',
      enrollment_number: 'EN2024001',
      full_name: 'John Doe',
      gender: 'Male',
      dob: new Date('2000-05-15'),
      birth_place: 'Mumbai',
      birth_state: 'Maharashtra',
      country: 'India',
      aadhar_no: '123456789012',
      mobile_no: '9876543210',
      alternate_number: '9876543211',
      email: 'john.doe@example.com',
      password: hashedPassword,
      address: '123 Main Street, Mumbai, Maharashtra',
      mou_id: '688d61c8ecc389d883368363',
      credits: 45,
      available_credit: 32,
      used_credit: 13
    });

    // Save the student
    const savedStudent = await dummyStudent.save();
    console.log('✅ Dummy student created successfully!');
    console.log('📋 Student Details:');
    console.log(`   Name: ${savedStudent.full_name}`);
    console.log(`   Email: ${savedStudent.email}`);
    console.log(`   Enrollment: ${savedStudent.enrollment_number}`);
    console.log(`   Credits: ${savedStudent.credits}`);
    console.log(`   Available Credits: ${savedStudent.available_credit}`);
    console.log(`   Used Credits: ${savedStudent.used_credit}`);
    console.log('\n🔑 Login Credentials:');
    console.log(`   Username: ${savedStudent.full_name}`);
    console.log(`   Password: student123`);
    console.log('\n🌐 Test the student portal with these credentials!');

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error creating dummy student:', error);
    process.exit(1);
  }
}

// Run the function
createDummyStudent(); 