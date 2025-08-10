const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const School = require('./models/school');
const MOU = require('./models/MOU');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Update school counts based on MOUs
const updateSchoolCounts = async () => {
  try {
    console.log('🚀 Starting to update school counts...');

    // Get all schools
    const schools = await School.find({});
    console.log(`Found ${schools.length} schools`);

    // Get all MOUs
    const mous = await MOU.find({});
    console.log(`Found ${mous.length} MOUs`);

    // Create a map to count MOUs per school
    const schoolMOUCounts = {};

    // Count MOUs for each school
    mous.forEach(mou => {
      const schoolId = mou.school.toString();
      schoolMOUCounts[schoolId] = (schoolMOUCounts[schoolId] || 0) + 1;
    });

    console.log('\n📊 MOUs per school:');
    Object.keys(schoolMOUCounts).forEach(schoolId => {
      const school = schools.find(s => s._id.toString() === schoolId);
      const schoolName = school ? school.name : 'Unknown School';
      console.log(`  ${schoolName} (${schoolId}): ${schoolMOUCounts[schoolId]} MOUs`);
    });

    // Update each school's count
    const updatedSchools = [];
    for (const school of schools) {
      const schoolId = school._id.toString();
      const newCount = schoolMOUCounts[schoolId] || 0;
      
      if (school.count !== newCount) {
        const updatedSchool = await School.findByIdAndUpdate(
          school._id,
          { count: newCount },
          { new: true }
        );
        updatedSchools.push(updatedSchool);
        console.log(`✅ Updated ${school.name}: ${school.count} → ${newCount}`);
      } else {
        console.log(`ℹ️  ${school.name}: count already correct (${school.count})`);
      }
    }

    console.log('\n🎉 School counts update completed!');
    console.log(`\n📊 Summary:`);
    console.log(`- Updated ${updatedSchools.length} schools`);
    
    if (updatedSchools.length > 0) {
      console.log('\n✅ Updated Schools:');
      updatedSchools.forEach(school => {
        console.log(`  - ${school.name}: ${school.count} MOUs`);
      });
    }

    // Show final school counts
    const finalSchools = await School.find({});
    console.log('\n📋 Final School Counts:');
    finalSchools.forEach(school => {
      console.log(`  - ${school.name}: ${school.count} MOUs`);
    });

  } catch (error) {
    console.error('❌ Error updating school counts:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
};

// Run the script
updateSchoolCounts(); 