const mongoose = require('mongoose');
const Course = require('./models/courses');
const Field = require('./models/fields');
const MOU = require('./models/MOU');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics';

async function addMoreTestCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all fields that have 0 courses
    const allFields = await Field.find();
    const fieldsWithoutCourses = [];
    
    for (const field of allFields) {
      const courseCount = await Course.countDocuments({ field: field._id });
      if (courseCount === 0) {
        fieldsWithoutCourses.push(field);
      }
    }

    console.log(`📊 Found ${fieldsWithoutCourses.length} fields without courses`);

    // Get test MOU
    const testMOU = await MOU.findOne({ ID: 'TEST-MOU-001' });
    if (!testMOU) {
      console.log('❌ Test MOU not found. Creating one...');
      const newMOU = new MOU({
        ID: 'TEST-MOU-001',
        organization: 'Test Organization',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        status: 'active'
      });
      await newMOU.save();
      console.log('✅ Created test MOU');
    }

    // Create additional courses for fields that have 0 courses
    const additionalCourses = [];
    let courseIdCounter = 100;

    // Add 1-3 courses for each field without courses (first 30 fields)
    const fieldsToProcess = fieldsWithoutCourses.slice(0, 30);
    
    for (const field of fieldsToProcess) {
      const numCourses = Math.floor(Math.random() * 3) + 1; // 1-3 courses per field
      
      for (let i = 0; i < numCourses; i++) {
        courseIdCounter++;
        const course = {
          ID: `TEST-${courseIdCounter}`,
          courseName: `${field.name} Fundamentals ${i + 1}`,
          organization: ['MIT', 'Stanford', 'Harvard', 'Berkeley', 'CMU'][Math.floor(Math.random() * 5)],
          duration: ['8 weeks', '10 weeks', '12 weeks', '16 weeks'][Math.floor(Math.random() * 4)],
          indoorCredits: Math.floor(Math.random() * 4) + 1,
          outdoorCredits: Math.floor(Math.random() * 3) + 1,
          field: field._id,
          startDate: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000), // Random date within 90 days
          completionStatus: ['upcoming', 'ongoing', 'completed'][Math.floor(Math.random() * 3)],
          mou_id: testMOU._id,
          subjects: [
            {
              noOfPeriods: Math.floor(Math.random() * 15) + 5,
              periodsMin: 45,
              totalMins: (Math.floor(Math.random() * 15) + 5) * 45,
              totalHrs: Math.ceil(((Math.floor(Math.random() * 15) + 5) * 45) / 60),
              credits: Math.floor(Math.random() * 4) + 1
            }
          ]
        };
        additionalCourses.push(course);
      }
    }

    console.log(`🚀 Creating ${additionalCourses.length} additional courses...`);
    
    // Insert all courses
    await Course.insertMany(additionalCourses);
    
    console.log('✅ Additional courses created successfully!');

    // Final verification
    console.log('\n📊 Updated Field Analysis:');
    const updatedFields = await Field.find().limit(20); // Show first 20 fields
    
    for (const field of updatedFields) {
      const courseCount = await Course.countDocuments({ field: field._id });
      console.log(`   ${field.name}: ${courseCount} courses`);
    }

    const totalCourses = await Course.countDocuments();
    console.log(`\n🎯 Total courses in database: ${totalCourses}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the function
addMoreTestCourses();
