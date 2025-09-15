const mongoose = require('mongoose');
const Admin = require('./models/admin');
const Student = require('./models1/student');
const MOU = require('./models/MOU');
const School = require('./models/school');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics';

async function verifyTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Verifying test data...\n');

    // Check MOU
    const mous = await MOU.find({ ID: { $in: ['TEST-MOU-001', 'TEST-MOU-002'] } });
    console.log(`📋 MOUs found: ${mous.length}`);
    mous.forEach(mou => {
      console.log(`   - ${mou.ID}: ${mou.nameOfPartnerInstitution}`);
    });

    // Check Admins
    const admins = await Admin.find({ email: { $in: ['admin@test.com', 'testadmin@example.com'] } });
    console.log(`\n👨‍💼 Admins found: ${admins.length}`);
    admins.forEach(admin => {
      console.log(`   - ${admin.name} (${admin.email})`);
    });

    // Check Students
    const students = await Student.find({ email: { $in: ['student@test.com', 'teststudent@example.com'] } });
    console.log(`\n👨‍🎓 Students found: ${students.length}`);
    students.forEach(student => {
      console.log(`   - ${student.full_name} (${student.email}) - Credits: ${student.credits}`);
    });

    // Check Schools
    const schools = await School.find({ name: 'Test School' });
    console.log(`\n🏫 Schools found: ${schools.length}`);
    schools.forEach(school => {
      console.log(`   - ${school.name} (Count: ${school.count})`);
    });

    console.log('\n✅ Verification complete!');
    console.log('\n📋 Test Credentials Summary:');
    console.log('\n👨‍💼 Admin Login:');
    console.log('   Email: admin@test.com | Password: admin123');
    console.log('   Email: testadmin@example.com | Password: admin456');
    console.log('\n👨‍🎓 Student Login:');
    console.log('   Email: student@test.com | Password: student123');
    console.log('   Email: teststudent@example.com | Password: student456');

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error verifying test data:', error);
    process.exit(1);
  }
}

// Run the function
verifyTestData(); 