const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const POC = require('./models2/poc');
const MOU = require('./models/MOU');
const Course = require('./models/courses');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Check POC MOUs and courses
const checkPOCMOUs = async () => {
  try {
    console.log('🔍 Checking POC MOUs and courses...');

    // Find the POC user
    const pocUser = await POC.findOne({ email: 'poc@demo.com' });
    
    if (!pocUser) {
      console.log('❌ POC user not found');
      return;
    }

    console.log(`\n📋 POC User: ${pocUser.name} (${pocUser._id})`);
    console.log(`   Email: ${pocUser.email}`);
    console.log(`   Organization: ${pocUser.organization}`);
    console.log(`   MOUs assigned: ${pocUser.mous.length}`);

    if (pocUser.mous.length === 0) {
      console.log('\n❌ No MOUs assigned to POC user');
      console.log('This is why the dropdowns are empty!');
      console.log('\n💡 Solution: Assign MOUs to the POC user');
      return;
    }

    // Get the assigned MOUs
    const assignedMOUs = await MOU.find({ _id: { $in: pocUser.mous } });
    
    console.log('\n📋 Assigned MOUs:');
    assignedMOUs.forEach((mou, index) => {
      console.log(`\n${index + 1}. MOU Details:`);
      console.log(`   ID: ${mou._id}`);
      console.log(`   MOU ID: ${mou.ID}`);
      console.log(`   Partner Institution: ${mou.nameOfPartnerInstitution}`);
      console.log(`   School: ${mou.school}`);
    });

    // Get courses linked to these MOUs
    const mouIds = assignedMOUs.map(mou => mou._id);
    const linkedCourses = await Course.find({ mou_id: { $in: mouIds } });
    
    console.log(`\n📋 Courses linked to POC MOUs: ${linkedCourses.length}`);
    linkedCourses.forEach((course, index) => {
      console.log(`\n${index + 1}. Course Details:`);
      console.log(`   ID: ${course._id}`);
      console.log(`   Course ID: ${course.ID}`);
      console.log(`   Name: ${course.courseName}`);
      console.log(`   Organization: ${course.organization}`);
      console.log(`   MOU ID: ${course.mou_id}`);
      console.log(`   Status: ${course.completionStatus}`);
    });

    console.log('\n🎉 POC MOUs and courses check completed!');
    console.log(`\n📋 Summary:`);
    console.log(`   - POC user: ${pocUser.name}`);
    console.log(`   - MOUs assigned: ${assignedMOUs.length}`);
    console.log(`   - Courses available: ${linkedCourses.length}`);
    
    if (assignedMOUs.length === 0) {
      console.log('\n🚨 ISSUE: No MOUs assigned to POC user');
      console.log('   - The dropdowns will be empty');
      console.log('   - Need to assign MOUs to the POC user');
    } else if (linkedCourses.length === 0) {
      console.log('\n⚠️  WARNING: No courses linked to POC MOUs');
      console.log('   - MOU dropdown will work');
      console.log('   - Course dropdown will be empty');
      console.log('   - Need to create courses linked to POC MOUs');
    } else {
      console.log('\n✅ Both dropdowns should work correctly!');
    }

  } catch (error) {
    console.error('❌ Error checking POC MOUs:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the check
checkPOCMOUs(); 