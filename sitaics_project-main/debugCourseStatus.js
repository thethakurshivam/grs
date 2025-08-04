const mongoose = require('mongoose');
const Course = require('./models/courses');
const Field = require('./models/fields');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics';

async function debugCourseStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all courses and their completion status
    const allCourses = await Course.find().populate('field');
    console.log(`📊 Total courses: ${allCourses.length}`);

    // Group by completion status
    const statusGroups = {
      upcoming: [],
      ongoing: [],
      completed: [],
      other: []
    };

    console.log('\n📋 Course Status Analysis:');
    
    for (const course of allCourses) {
      const status = course.completionStatus;
      const now = new Date();
      const startDate = new Date(course.startDate);
      
      console.log(`   ${course.courseName}:`);
      console.log(`     - Status: ${status}`);
      console.log(`     - Start Date: ${startDate.toDateString()}`);
      console.log(`     - Field: ${course.field?.name || 'No field'}`);
      
      // Calculate what the status should be
      let calculatedStatus = status;
      if (!status || status === 'upcoming') {
        if (startDate > now) {
          calculatedStatus = 'upcoming';
        } else {
          calculatedStatus = 'ongoing';
        }
      }
      
      console.log(`     - Calculated Status: ${calculatedStatus}`);
      console.log('');
      
      // Group courses
      if (calculatedStatus === 'upcoming') {
        statusGroups.upcoming.push(course);
      } else if (calculatedStatus === 'ongoing') {
        statusGroups.ongoing.push(course);
      } else if (calculatedStatus === 'completed') {
        statusGroups.completed.push(course);
      } else {
        statusGroups.other.push(course);
      }
    }

    console.log('\n🎯 Status Summary:');
    console.log(`   Upcoming: ${statusGroups.upcoming.length} courses`);
    console.log(`   Ongoing: ${statusGroups.ongoing.length} courses`);
    console.log(`   Completed: ${statusGroups.completed.length} courses`);
    console.log(`   Other: ${statusGroups.other.length} courses`);

    // Update some courses to have different statuses for testing
    console.log('\n🔧 Updating some courses for testing...');
    
    // Make some courses completed
    const coursesToComplete = allCourses.slice(0, 5);
    for (const course of coursesToComplete) {
      await Course.findByIdAndUpdate(course._id, { 
        completionStatus: 'completed' 
      });
      console.log(`   ✅ Marked "${course.courseName}" as completed`);
    }

    // Make some courses ongoing (with past start dates)
    const coursesToMakeOngoing = allCourses.slice(5, 10);
    for (const course of coursesToMakeOngoing) {
      const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      await Course.findByIdAndUpdate(course._id, { 
        completionStatus: 'ongoing',
        startDate: pastDate
      });
      console.log(`   ⏳ Marked "${course.courseName}" as ongoing`);
    }

    // Make some courses upcoming (with future start dates)
    const coursesToMakeUpcoming = allCourses.slice(10, 15);
    for (const course of coursesToMakeUpcoming) {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      await Course.findByIdAndUpdate(course._id, { 
        completionStatus: 'upcoming',
        startDate: futureDate
      });
      console.log(`   📅 Marked "${course.courseName}" as upcoming`);
    }

    console.log('\n✅ Course status debugging and updates completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the function
debugCourseStatus();
