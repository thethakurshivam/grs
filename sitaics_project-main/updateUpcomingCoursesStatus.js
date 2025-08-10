const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Course = require('./models/courses');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Update upcoming courses status
const updateUpcomingCoursesStatus = async () => {
  try {
    console.log('🚀 Starting to update upcoming courses status...');

    // Find all courses with UPCOMING in their ID
    const upcomingCourses = await Course.find({ ID: { $regex: /UPCOMING/ } });
    console.log(`Found ${upcomingCourses.length} upcoming courses to update`);

    const updatedCourses = [];

    for (const course of upcomingCourses) {
      // Update the course with upcoming status
      const updateData = {
        completionStatus: 'upcoming'
      };

      // Update the course using updateOne to bypass pre-save middleware
      const result = await Course.updateOne(
        { _id: course._id },
        { $set: updateData }
      );

      if (result.modifiedCount > 0) {
        // Fetch the updated course
        const updatedCourse = await Course.findById(course._id);
        updatedCourses.push(updatedCourse);
        console.log(`✅ Updated course: ${updatedCourse.courseName} (${updatedCourse.ID})`);
        console.log(`   Status: ${updatedCourse.completionStatus}`);
        console.log(`   Start Date: ${updatedCourse.startDate.toDateString()}`);
      }
    }

    console.log('\n🎉 Upcoming courses status update completed!');
    console.log('\n📊 Summary:');
    console.log(`- Updated ${updatedCourses.length} courses to upcoming status`);
    
    if (updatedCourses.length > 0) {
      console.log('\n✅ Updated Courses:');
      updatedCourses.forEach(course => {
        console.log(`  - ${course.courseName} (${course.ID})`);
        console.log(`    Status: ${course.completionStatus}`);
        console.log(`    Start Date: ${course.startDate.toDateString()}`);
      });
    }

    // Show all upcoming courses in database
    const allUpcomingCourses = await Course.find({ completionStatus: 'upcoming' });
    console.log('\n📋 All Upcoming Courses in Database:');
    allUpcomingCourses.forEach(course => {
      console.log(`  - ${course.courseName} (${course.ID}) - ${course.duration} - ${course.startDate.toDateString()}`);
    });

  } catch (error) {
    console.error('❌ Error updating upcoming courses status:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the script
updateUpcomingCoursesStatus(); 