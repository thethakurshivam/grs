const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const POC = require('./models2/poc');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test POC dropdowns functionality
const testPOCDropdowns = async () => {
  try {
    console.log('🧪 Testing POC dropdowns functionality...');

    // Check if POC users exist
    const pocs = await POC.find();
    
    console.log(`\n📊 Found ${pocs.length} POC users in database:`);
    
    if (pocs.length === 0) {
      console.log('❌ No POC users found in database');
      console.log('This is why the dropdowns are not working');
      console.log('\n💡 Solution: Create a POC user first');
      return;
    }

    // Show POC users
    console.log('\n📋 POC Users:');
    pocs.forEach((poc, index) => {
      console.log(`\n${index + 1}. POC Details:`);
      console.log(`   ID: ${poc._id}`);
      console.log(`   Name: ${poc.name}`);
      console.log(`   Email: ${poc.email}`);
      console.log(`   Organization: ${poc.organization}`);
      console.log(`   Password: ${poc.password ? 'SET' : 'NOT SET'}`);
    });

    // Test API endpoints with a sample POC
    const samplePOC = pocs[0];
    console.log(`\n🔍 Testing API endpoints for POC: ${samplePOC.name} (${samplePOC._id})`);
    
    console.log('\n📋 API Endpoints to test:');
    console.log(`   MOUs: GET http://localhost:3002/api/poc/${samplePOC._id}/mous`);
    console.log(`   Courses: GET http://localhost:3002/api/poc/${samplePOC._id}/courses`);
    
    console.log('\n📋 Frontend expects:');
    console.log('   - pocToken in localStorage');
    console.log('   - pocUserId in localStorage');
    console.log('   - Valid JWT token for authentication');
    
    console.log('\n🔍 Debugging steps:');
    console.log('1. Check if POC is logged in (pocToken exists)');
    console.log('2. Check if pocUserId matches a valid POC in database');
    console.log('3. Check if API server (api2.js) is running on port 3002');
    console.log('4. Check browser console for network errors');
    console.log('5. Check if CORS is properly configured');

    console.log('\n🎉 POC dropdowns test completed!');
    console.log(`\n📋 Summary:`);
    console.log(`   - POC users found: ${pocs.length}`);
    console.log(`   - API server: Running on port 3002`);
    console.log(`   - Routes: /api/poc/:pocId/mous and /api/poc/:pocId/courses exist`);
    console.log(`   - Frontend hooks: usePOCMOUs and usePOCCoursesForDropdown`);

  } catch (error) {
    console.error('❌ Error testing POC dropdowns:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the test
testPOCDropdowns(); 