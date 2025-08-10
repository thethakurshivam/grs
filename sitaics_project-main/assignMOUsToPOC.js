const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const POC = require('./models2/poc');
const MOU = require('./models/MOU');
const Course = require('./models/courses');
const Field = require('./models/fields');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Assign MOUs to POC and create courses
const assignMOUsToPOC = async () => {
  try {
    console.log('🔧 Assigning MOUs to POC and creating courses...');

    // Find the POC user
    const pocUser = await POC.findOne({ email: 'poc@demo.com' });
    
    if (!pocUser) {
      console.log('❌ POC user not found');
      return;
    }

    console.log(`\n📋 POC User: ${pocUser.name} (${pocUser._id})`);

    // Get some existing MOUs
    const existingMOUs = await MOU.find().limit(3);
    
    if (existingMOUs.length === 0) {
      console.log('❌ No MOUs found in database');
      return;
    }

    console.log(`\n📋 Found ${existingMOUs.length} existing MOUs to assign:`);
    existingMOUs.forEach((mou, index) => {
      console.log(`${index + 1}. ${mou.nameOfPartnerInstitution} (${mou._id})`);
    });

    // Get a valid field
    const fields = await Field.find();
    if (fields.length === 0) {
      console.log('❌ No fields found in database');
      return;
    }
    const fieldId = fields[0]._id;
    console.log(`\n📋 Using field: ${fields[0].name} (${fieldId})`);

    // Assign MOUs to POC
    pocUser.mous = existingMOUs.map(mou => mou._id);
    await pocUser.save();

    console.log(`\n✅ Assigned ${existingMOUs.length} MOUs to POC user`);

    // Create courses linked to these MOUs
    const coursesToCreate = [];
    
    existingMOUs.forEach((mou, index) => {
      coursesToCreate.push({
        ID: `POC_COURSE_${index + 1}`,
        courseName: `POC Course ${index + 1} - ${mou.nameOfPartnerInstitution}`,
        organization: 'POC Organization',
        duration: '6 months',
        indoorCredits: 15,
        outdoorCredits: 5,
        field: fieldId, // Use the field ObjectId
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-07-15'),
        completionStatus: 'upcoming',
        mou_id: mou._id,
        subjects: [
          {
            noOfPeriods: 10,
            periodsMin: 45,
            totalMins: 450,
            totalHrs: 7.5,
            credits: 2
          }
        ]
      });
    });

    // Create the courses
    const createdCourses = await Course.insertMany(coursesToCreate);

    console.log(`\n✅ Created ${createdCourses.length} courses linked to POC MOUs:`);
    createdCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.courseName} (${course._id})`);
      console.log(`   MOU: ${course.mou_id}`);
      console.log(`   Status: ${course.completionStatus}`);
    });

    console.log('\n🎉 POC setup completed!');
    console.log(`\n📋 Summary:`);
    console.log(`   - POC user: ${pocUser.name}`);
    console.log(`   - MOUs assigned: ${pocUser.mous.length}`);
    console.log(`   - Courses created: ${createdCourses.length}`);
    console.log(`   - Both dropdowns should now work!`);

  } catch (error) {
    console.error('❌ Error setting up POC:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the setup
assignMOUsToPOC(); 