const mongoose = require('mongoose');
const Course = require('./models/courses');
const Field = require('./models/fields');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics';

async function fixCourseFieldLinks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check current state
    const totalFields = await Field.countDocuments();
    const totalCourses = await Course.countDocuments();
    console.log(`📊 Database Status:`);
    console.log(`   Fields: ${totalFields}`);
    console.log(`   Courses: ${totalCourses}`);

    // Check how many courses have field references
    const coursesWithFields = await Course.countDocuments({ field: { $exists: true, $ne: null } });
    const coursesWithoutFields = await Course.countDocuments({ field: { $exists: false } });
    console.log(`   Courses with field links: ${coursesWithFields}`);
    console.log(`   Courses without field links: ${coursesWithoutFields}`);

    // Get all fields and their course counts
    const fields = await Field.find();
    console.log('\n📋 Field Analysis:');
    
    for (const field of fields) {
      const courseCount = await Course.countDocuments({ field: field._id });
      console.log(`   ${field.name}: ${courseCount} courses`);
    }

    // If courses exist but don't have field links, let's fix them
    if (coursesWithoutFields > 0) {
      console.log('\n🔧 Fixing course-field links...');
      
      const coursesNeedingFields = await Course.find({ 
        $or: [
          { field: { $exists: false } },
          { field: null }
        ]
      });

      // Distribute courses among available fields
      for (let i = 0; i < coursesNeedingFields.length; i++) {
        const course = coursesNeedingFields[i];
        const fieldIndex = i % fields.length; // Distribute evenly
        const assignedField = fields[fieldIndex];
        
        await Course.findByIdAndUpdate(course._id, { 
          field: assignedField._id 
        });
        
        console.log(`   ✅ Linked "${course.courseName}" to "${assignedField.name}"`);
      }
    }

    // Final verification
    console.log('\n🎯 Final Verification:');
    for (const field of fields) {
      const courseCount = await Course.countDocuments({ field: field._id });
      console.log(`   ${field.name}: ${courseCount} courses`);
    }

    console.log('\n✅ Course-field links have been fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the function
fixCourseFieldLinks();
