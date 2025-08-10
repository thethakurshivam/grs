const mongoose = require('mongoose');
require('dotenv').config();

// Import the School model
const School = require('./models/school');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create schools data
const createSchools = async () => {
  try {
    console.log('🚀 Starting to create schools...');

    // Define the schools to create
    const schoolsToCreate = [
      { name: 'SITAICS', count: 0 },
      { name: 'SISPA', count: 0 },
      { name: 'SISDSS', count: 0 },
      { name: 'SICMSS', count: 0 },
      { name: 'SCLML', count: 0 },
      { name: 'SICSSL', count: 0 },
      { name: 'RRUHQ', count: 0 }
    ];

    const createdSchools = [];
    const existingSchools = [];

    for (const schoolData of schoolsToCreate) {
      // Check if school already exists
      let school = await School.findOne({ name: schoolData.name });
      if (!school) {
        school = new School(schoolData);
        await school.save();
        createdSchools.push(school);
        console.log(`✅ Created school: ${schoolData.name}`);
      } else {
        existingSchools.push(school);
        console.log(`⚠️ School already exists: ${schoolData.name}`);
      }
    }

    console.log('\n🎉 Schools creation completed!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${createdSchools.length} new schools`);
    console.log(`- Found ${existingSchools.length} existing schools`);
    
    if (createdSchools.length > 0) {
      console.log('\n✅ Newly Created Schools:');
      createdSchools.forEach(school => {
        console.log(`  - ${school.name} (Count: ${school.count})`);
      });
    }
    
    if (existingSchools.length > 0) {
      console.log('\n⚠️ Existing Schools:');
      existingSchools.forEach(school => {
        console.log(`  - ${school.name} (Count: ${school.count})`);
      });
    }

    // Show all schools in database
    const allSchools = await School.find({});
    console.log('\n📋 All Schools in Database:');
    allSchools.forEach(school => {
      console.log(`  - ${school.name} (Count: ${school.count})`);
    });

  } catch (error) {
    console.error('❌ Error creating schools:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the script
createSchools(); 