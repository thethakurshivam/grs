const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const School = require('./models/school');
const MOU = require('./models/MOU');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test complete school MOUs flow
const testCompleteSchoolFlow = async () => {
  try {
    console.log('🧪 Testing complete school MOUs flow...');

    // Test with RRUHQ school
    const schoolName = 'RRUHQ';
    
    console.log(`\n📊 Testing flow for school: ${schoolName}`);

    // Step 1: Find the school
    const school = await School.findOne({ name: schoolName });
    if (!school) {
      console.log(`❌ School '${schoolName}' not found`);
      return;
    }

    console.log(`✅ Step 1: School found`);
    console.log(`   Name: ${school.name}`);
    console.log(`   ID: ${school._id}`);
    console.log(`   Count: ${school.count}`);

    // Step 2: Find MOUs for this school
    const schoolMOUs = await MOU.find({ school: school._id });
    
    console.log(`\n✅ Step 2: MOUs found`);
    console.log(`   Total MOUs: ${schoolMOUs.length}`);

    // Step 3: Simulate the API response
    const apiResponse = {
      success: true,
      school: school,
      count: schoolMOUs.length,
      data: schoolMOUs
    };

    console.log(`\n✅ Step 3: API Response structure`);
    console.log(`   Success: ${apiResponse.success}`);
    console.log(`   School: ${apiResponse.school.name}`);
    console.log(`   MOUs Count: ${apiResponse.count}`);
    console.log(`   Data: ${apiResponse.data.length} MOUs`);

    // Step 4: Simulate frontend data processing
    console.log(`\n✅ Step 4: Frontend would receive:`);
    console.log(`   - School name: ${apiResponse.school.name}`);
    console.log(`   - MOUs count: ${apiResponse.count}`);
    console.log(`   - MOUs data: ${apiResponse.data.length} items`);

    // Step 5: Show sample MOU data
    if (schoolMOUs.length > 0) {
      console.log(`\n📋 Sample MOU data (first 3):`);
      schoolMOUs.slice(0, 3).forEach((mou, index) => {
        console.log(`   ${index + 1}. MOU ID: ${mou.ID}`);
        console.log(`      Partner: ${mou.nameOfPartnerInstitution}`);
        console.log(`      Strategic Areas: ${mou.strategicAreas}`);
        console.log(`      Date: ${mou.dateOfSigning.toDateString()}`);
        console.log(`      Validity: ${mou.validity}`);
      });
    }

    // Step 6: Test URL encoding/decoding
    const encodedSchoolName = encodeURIComponent(schoolName);
    const decodedSchoolName = decodeURIComponent(encodedSchoolName);
    
    console.log(`\n✅ Step 6: URL encoding test`);
    console.log(`   Original: ${schoolName}`);
    console.log(`   Encoded: ${encodedSchoolName}`);
    console.log(`   Decoded: ${decodedSchoolName}`);
    console.log(`   Match: ${schoolName === decodedSchoolName ? '✅' : '❌'}`);

    // Step 7: Test API endpoint simulation
    console.log(`\n✅ Step 7: API endpoint simulation`);
    console.log(`   GET /api/schools/${encodedSchoolName}`);
    console.log(`   Would return: ${apiResponse.count} MOUs`);
    console.log(`   Frontend route: /dashboard/schools/${encodedSchoolName}`);

    console.log(`\n🎉 Complete flow test successful!`);
    console.log(`\n📋 Summary:`);
    console.log(`   - School: ${schoolName}`);
    console.log(`   - MOUs found: ${schoolMOUs.length}`);
    console.log(`   - API route: /api/schools/${encodedSchoolName}`);
    console.log(`   - Frontend route: /dashboard/schools/${encodedSchoolName}`);
    console.log(`   - Component: SchoolMOUsPage`);
    console.log(`   - Hook: useSchoolMOUs`);

  } catch (error) {
    console.error('❌ Error testing complete school flow:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the test
testCompleteSchoolFlow(); 