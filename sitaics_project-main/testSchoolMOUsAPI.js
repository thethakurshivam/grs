const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const School = require('./models/school');
const MOU = require('./models/MOU');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test school MOUs API functionality
const testSchoolMOUsAPI = async () => {
  try {
    console.log('🧪 Testing school MOUs API functionality...');

    // Test with RRUHQ school
    const schoolName = 'RRUHQ';
    
    // First find the school to get its information
    const school = await School.findOne({ name: schoolName });
    if (!school) {
      console.log(`❌ School '${schoolName}' not found`);
      return;
    }

    console.log(`\n📊 School found:`);
    console.log(`  Name: ${school.name}`);
    console.log(`  ID: ${school._id}`);
    console.log(`  Count: ${school.count}`);

    // Find all MOUs that belong to this school using the school's ObjectId
    const schoolMOUs = await MOU.find({ school: school._id });
    
    console.log(`\n📋 MOUs found for ${schoolName}:`);
    console.log(`  Total MOUs: ${schoolMOUs.length}`);
    
    schoolMOUs.forEach((mou, index) => {
      console.log(`  ${index + 1}. MOU ID: ${mou.ID}`);
      console.log(`     Partner Institution: ${mou.nameOfPartnerInstitution}`);
      console.log(`     Strategic Areas: ${mou.strategicAreas}`);
      console.log(`     Date of Signing: ${mou.dateOfSigning.toDateString()}`);
    });

    // Simulate the API response
    const mockAPIResponse = {
      success: true,
      school: school,
      count: schoolMOUs.length,
      data: schoolMOUs
    };

    console.log('\n📋 Mock API Response:');
    console.log(`  Success: ${mockAPIResponse.success}`);
    console.log(`  School: ${mockAPIResponse.school.name}`);
    console.log(`  MOUs Count: ${mockAPIResponse.count}`);
    console.log(`  Data: ${mockAPIResponse.data.length} MOUs`);

    // Test the old (broken) query
    console.log('\n🔍 Testing old (broken) query...');
    try {
      const brokenQuery = await MOU.find({ school: schoolName });
      console.log(`  Old query result: ${brokenQuery.length} MOUs (this would cause the error)`);
    } catch (error) {
      console.log(`  ❌ Old query failed: ${error.message}`);
    }

    // Test the new (fixed) query
    console.log('\n🔍 Testing new (fixed) query...');
    try {
      const fixedQuery = await MOU.find({ school: school._id });
      console.log(`  ✅ New query result: ${fixedQuery.length} MOUs (this works correctly)`);
    } catch (error) {
      console.log(`  ❌ New query failed: ${error.message}`);
    }

    console.log('\n🎉 API route should now work correctly!');

  } catch (error) {
    console.error('❌ Error testing school MOUs API:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the test
testSchoolMOUsAPI(); 