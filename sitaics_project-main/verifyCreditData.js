const mongoose = require('mongoose');
const Credit = require('./model3/credit');
require('dotenv').config();

async function verifyCreditData() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = 'mongodb://localhost:27017/sitaics';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Count total credit documents
    const totalCredits = await Credit.countDocuments();
    console.log(`📊 Total credit documents: ${totalCredits}`);

    if (totalCredits === 0) {
      console.log('⚠️  No credit documents found in database');
      return;
    }

    // Fetch and display all credit documents
    console.log('\n📋 All credit documents:');
    const allCredits = await Credit.find({});
    
    allCredits.forEach((credit, index) => {
      console.log(`\n${index + 1}. Course: ${credit.course_name}`);
      console.log(`   Organization: ${credit.organization}`);
      console.log(`   Credits: ${credit.total_credits}`);
      console.log(`   MongoDB ID: ${credit._id}`);
      console.log(`   Created: ${credit.createdAt || 'N/A'}`);
      console.log(`   Updated: ${credit.updatedAt || 'N/A'}`);
    });

    // Verify the specific documents we inserted
    console.log('\n🔍 Verifying specific documents:');
    
    const firingCourse = await Credit.findOne({ course_name: 'firing' });
    console.log(`✅ Firing course: ${firingCourse ? 'Found' : 'Not found'}`);
    if (firingCourse) {
      console.log(`   Organization: ${firingCourse.organization}, Credits: ${firingCourse.total_credits}`);
    }

    const swimmingCourse = await Credit.findOne({ course_name: 'swimming' });
    console.log(`✅ Swimming course: ${swimmingCourse ? 'Found' : 'Not found'}`);
    if (swimmingCourse) {
      console.log(`   Organization: ${swimmingCourse.organization}, Credits: ${swimmingCourse.total_credits}`);
    }

    const martialArtCourse = await Credit.findOne({ course_name: 'martial_art' });
    console.log(`✅ Martial art course: ${martialArtCourse ? 'Found' : 'Not found'}`);
    if (martialArtCourse) {
      console.log(`   Organization: ${martialArtCourse.organization}, Credits: ${martialArtCourse.total_credits}`);
    }

    console.log('\n🎉 Credit data verification complete!');

  } catch (error) {
    console.error('❌ Error verifying credit data:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the verification
console.log('🔍 Starting credit data verification...');
verifyCreditData();
