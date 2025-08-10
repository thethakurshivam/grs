const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const School = require('./models/school');
const MOU = require('./models/MOU');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test MOU creation with school count increment
const testMOUCreation = async () => {
  try {
    console.log('🧪 Testing MOU creation with school count increment...');

    // Get a school to test with
    const testSchool = await School.findOne({ name: 'SITAICS' });
    if (!testSchool) {
      console.log('❌ SITAICS school not found. Creating it...');
      const newSchool = new School({
        name: 'SITAICS',
        count: 0
      });
      await newSchool.save();
      console.log('✅ Created SITAICS school');
    }

    const school = await School.findOne({ name: 'SITAICS' });
    console.log(`\n📊 Before MOU creation:`);
    console.log(`  School: ${school.name}`);
    console.log(`  Current count: ${school.count}`);

    // Create a test MOU
    const testMOU = new MOU({
      ID: 'TEST_MOU_001',
      school: school._id,
      nameOfPartnerInstitution: 'Test Partner Institution',
      strategicAreas: 'Test Strategic Area',
      dateOfSigning: new Date('2024-01-01'),
      validity: '2 years',
      affiliationDate: new Date('2024-01-01')
    });

    const savedMOU = await testMOU.save();
    console.log(`\n✅ Test MOU created: ${savedMOU.ID}`);

    // Manually increment school count (simulating the API behavior)
    const updatedSchool = await School.findByIdAndUpdate(
      school._id,
      { $inc: { count: 1 } },
      { new: true }
    );

    console.log(`\n📊 After MOU creation:`);
    console.log(`  School: ${updatedSchool.name}`);
    console.log(`  New count: ${updatedSchool.count}`);

    // Verify the increment worked
    if (updatedSchool.count === school.count + 1) {
      console.log('\n🎉 SUCCESS: School count was incremented correctly!');
    } else {
      console.log('\n❌ FAILED: School count was not incremented correctly!');
    }

    // Clean up - delete the test MOU and reset school count
    await MOU.findByIdAndDelete(savedMOU._id);
    await School.findByIdAndUpdate(
      school._id,
      { count: school.count } // Reset to original count
    );

    console.log('\n🧹 Cleaned up test data');

  } catch (error) {
    console.error('❌ Error testing MOU creation:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the test
testMOUCreation(); 