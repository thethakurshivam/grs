const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Course = require('./models/courses');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Update ongoing courses status
const updateOngoingCoursesStatus = async () => {
  try {
    console.log('🚀 Starting to update ongoing courses status...');

    // Find all courses with ONGOING in their ID
    const ongoingCourses = await Course.find({ ID: { $regex: /ONGOING/ } });
    console.log(`Found ${ongoingCourses.length} ongoing courses to update`);

    const updatedCourses = [];

    for (const course of ongoingCourses) {
      // Update the course with new dates and status
      const updateData = {
        completionStatus: 'ongoing'
      };

      // Set appropriate start dates based on course ID
      switch (course.ID) {
        case 'COURSE_ONGOING001':
          updateData.startDate = new Date('2024-06-01');
          break;
        case 'COURSE_ONGOING002':
          updateData.startDate = new Date('2024-07-01');
          break;
        case 'COURSE_ONGOING003':
          updateData.startDate = new Date('2024-08-01');
          break;
        case 'COURSE_ONGOING004':
          updateData.startDate = new Date('2024-09-01');
          break;
        case 'COURSE_ONGOING005':
          updateData.startDate = new Date('2024-05-01');
          break;
        default:
          updateData.startDate = new Date('2024-06-01');
      }

      // Update the course
      const updatedCourse = await Course.findByIdAndUpdate(
        course._id,
        updateData,
        { new: true }
      );

      if (updatedCourse) {
        updatedCourses.push(updatedCourse);
        console.log(`✅ Updated course: ${updatedCourse.courseName} (${updatedCourse.ID})`);
        console.log(`   Status: ${updatedCourse.completionStatus}`);
        console.log(`   Start Date: ${updatedCourse.startDate.toDateString()}`);
      }
    }

    console.log('\n🎉 Ongoing courses status update completed!');
    console.log('\n📊 Summary:');
    console.log(`- Updated ${updatedCourses.length} courses to ongoing status`);
    
    if (updatedCourses.length > 0) {
      console.log('\n✅ Updated Courses:');
      updatedCourses.forEach(course => {
        console.log(`  - ${course.courseName} (${course.ID})`);
        console.log(`    Status: ${course.completionStatus}`);
        console.log(`    Start Date: ${course.startDate.toDateString()}`);
      });
    }

    // Show all ongoing courses in database
    const allOngoingCourses = await Course.find({ completionStatus: 'ongoing' });
    console.log('\n📋 All Ongoing Courses in Database:');
    allOngoingCourses.forEach(course => {
      console.log(`  - ${course.courseName} (${course.ID}) - ${course.duration}`);
    });

  } catch (error) {
    console.error('❌ Error updating ongoing courses status:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the script
updateOngoingCoursesStatus(); 