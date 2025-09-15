const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const School = require('./models/school');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test schools API functionality
const testSchoolsAPI = async () => {
  try {
    console.log('🧪 Testing schools API functionality...');

    // Get all schools from database
    const schools = await School.find();
    
    console.log(`\n📊 Found ${schools.length} schools in database:`);
    schools.forEach((school, index) => {
      console.log(`${index + 1}. ${school.name} - ${school.count} MOUs`);
    });

    // Simulate the API route logic
    console.log('\n🔄 Simulating API route logic...');
    
    const schoolsWithLinks = schools.map(school => ({
      _id: school._id,
      id: school._id,
      name: school.name,
      count: school.count,
      link: `/api/schools/${encodeURIComponent(school.name)}`
    }));

    const mockAPIResponse = {
      success: true,
      count: schoolsWithLinks.length,
      data: schoolsWithLinks
    };

    console.log('\n📋 Mock API Response:');
    console.log(JSON.stringify(mockAPIResponse, null, 2));

    // Check if there are schools with MOUs
    const schoolsWithMOUs = schools.filter(school => school.count > 0);
    console.log(`\n📈 Schools with MOUs: ${schoolsWithMOUs.length}`);
    schoolsWithMOUs.forEach(school => {
      console.log(`  - ${school.name}: ${school.count} MOUs`);
    });

    if (schoolsWithMOUs.length === 0) {
      console.log('\n⚠️ No schools have MOUs, but this shouldn\'t cause "no school" error');
      console.log('The frontend should still show all schools, even with 0 MOUs');
    } else {
      console.log('\n✅ Schools with MOUs found - API should return these');
    }

    // Check what the frontend would receive
    console.log('\n🎯 Frontend would receive:');
    console.log(`  - Total schools: ${mockAPIResponse.count}`);
    console.log(`  - Schools data: ${mockAPIResponse.data.length} items`);
    console.log(`  - Success: ${mockAPIResponse.success}`);

  } catch (error) {
    console.error('❌ Error testing schools API:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the test
testSchoolsAPI(); 