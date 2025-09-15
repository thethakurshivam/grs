const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/admin');
const Student = require('./models1/student');
const MOU = require('./models/MOU');
const School = require('./models/school');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics';

async function createTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing test data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing test data...');
    await Admin.deleteMany({ email: { $in: ['admin@test.com', 'testadmin@example.com'] } });
    await Student.deleteMany({ email: { $in: ['student@test.com', 'teststudent@example.com'] } });
    await MOU.deleteMany({ ID: { $in: ['TEST-MOU-001', 'TEST-MOU-002'] } });

    // 1. Create Test MOU (required for students)
    console.log('📋 Creating test MOU...');
    const testMOU = new MOU({
      ID: 'TEST-MOU-001',
      school: 'Test School',
      nameOfPartnerInstitution: 'Test University',
      strategicAreas: 'Computer Science, Engineering',
      dateOfSigning: new Date('2024-01-15'),
      validity: '5 years',
      affiliationDate: new Date('2024-02-01')
    });

    const savedMOU = await testMOU.save();
    console.log(`✅ MOU created with ID: ${savedMOU._id}`);

    // 2. Create Test Admin
    console.log('👨‍💼 Creating test admin...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const testAdmin = new Admin({
      name: 'Test Administrator',
      email: 'admin@test.com',
      phoneNumber: '9876543210',
      password: adminPassword
    });

    const savedAdmin = await testAdmin.save();
    console.log(`✅ Admin created with ID: ${savedAdmin._id}`);

    // 3. Create Test Student
    console.log('👨‍🎓 Creating test student...');
    const studentPassword = await bcrypt.hash('student123', 10);
    const testStudent = new Student({
      sr_no: 1001,
      batch_no: 'BATCH-2024-01',
      rank: '1st',
      serial_number: 'SR001',
      enrollment_number: 'EN2024001',
      full_name: 'Test Student',
      gender: 'Male',
      dob: new Date('2000-05-15'),
      birth_place: 'Mumbai',
      birth_state: 'Maharashtra',
      country: 'India',
      aadhar_no: '123456789012',
      mobile_no: '9876543210',
      alternate_number: '9876543211',
      email: 'student@test.com',
      password: studentPassword,
      address: '123 Test Street, Mumbai, Maharashtra',
      mou_id: savedMOU._id.toString(),
      credits: 45,
      available_credit: 32,
      used_credit: 13
    });

    const savedStudent = await testStudent.save();
    console.log(`✅ Student created with ID: ${savedStudent._id}`);

    // 4. Create Additional Test Admin
    console.log('👨‍💼 Creating additional test admin...');
    const admin2Password = await bcrypt.hash('admin456', 10);
    const testAdmin2 = new Admin({
      name: 'John Doe',
      email: 'testadmin@example.com',
      phoneNumber: '9876543211',
      password: admin2Password
    });

    const savedAdmin2 = await testAdmin2.save();
    console.log(`✅ Additional admin created with ID: ${savedAdmin2._id}`);

    // 5. Create Additional Test Student
    console.log('👨‍🎓 Creating additional test student...');
    const student2Password = await bcrypt.hash('student456', 10);
    const testStudent2 = new Student({
      sr_no: 1002,
      batch_no: 'BATCH-2024-01',
      rank: '2nd',
      serial_number: 'SR002',
      enrollment_number: 'EN2024002',
      full_name: 'Jane Smith',
      gender: 'Female',
      dob: new Date('2001-08-20'),
      birth_place: 'Delhi',
      birth_state: 'Delhi',
      country: 'India',
      aadhar_no: '123456789013',
      mobile_no: '9876543212',
      alternate_number: '9876543213',
      email: 'teststudent@example.com',
      password: student2Password,
      address: '456 Test Avenue, Delhi, Delhi',
      mou_id: savedMOU._id.toString(),
      credits: 40,
      available_credit: 28,
      used_credit: 12
    });

    const savedStudent2 = await testStudent2.save();
    console.log(`✅ Additional student created with ID: ${savedStudent2._id}`);

    // Display test credentials
    console.log('\n🎉 Test data created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('\n👨‍💼 Admin Login Credentials:');
    console.log('   Email: admin@test.com');
    console.log('   Password: admin123');
    console.log('   Email: testadmin@example.com');
    console.log('   Password: admin456');
    
    console.log('\n👨‍🎓 Student Login Credentials:');
    console.log('   Email: student@test.com');
    console.log('   Password: student123');
    console.log('   Email: teststudent@example.com');
    console.log('   Password: student456');
    
    console.log('\n📊 Database Summary:');
    console.log(`   MOU: ${savedMOU.ID} (${savedMOU.nameOfPartnerInstitution})`);
    console.log(`   Admins: 2 users created`);
    console.log(`   Students: 2 users created`);
    
    console.log('\n🌐 You can now test the website with these credentials!');

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  }
}

// Run the function
createTestData(); 