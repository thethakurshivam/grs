const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const School = require('./models/school');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Check schools in database
const checkSchools = async () => {
  try {
    console.log('🔍 Checking schools in database...');

    // Find all schools
    const schools = await School.find({});
    
    console.log(`\n📊 Found ${schools.length} schools in database:`);
    
    if (schools.length === 0) {
      console.log('❌ No schools found in database!');
      console.log('This is why the MOU School Activity card shows "no school"');
    } else {
      schools.forEach((school, index) => {
        console.log(`\n${index + 1}. School: ${school.name}`);
        console.log(`   ID: ${school._id}`);
        console.log(`   Count: ${school.count}`);
      });
    }

    // Also check if there are any MOUs
    const MOU = require('./models/MOU');
    const mous = await MOU.find({});
    console.log(`\n📋 Found ${mous.length} MOUs in database`);
    
    if (mous.length > 0) {
      console.log('\n🔗 MOUs and their schools:');
      mous.forEach((mou, index) => {
        console.log(`${index + 1}. MOU ID: ${mou.ID}`);
        console.log(`   School: ${mou.school}`);
        console.log(`   Partner Institution: ${mou.nameOfPartnerInstitution}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking schools:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
};

// Run the script
checkSchools(); 