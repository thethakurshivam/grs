const mongoose = require('mongoose');
const CourseHistory = require('./model3/course_history');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrateCourseHistory() {
  try {
    console.log('🔧 Migrating Course History Schema...\n');

    // Find all course history records that don't have certificateContributed field
    const coursesToUpdate = await CourseHistory.find({
      certificateContributed: { $exists: false }
    });

    console.log(`📊 Found ${coursesToUpdate.length} course history records to migrate\n`);

    if (coursesToUpdate.length === 0) {
      console.log('✅ No migration needed - all records already have certificateContributed field');
      return;
    }

    // Update all records to add certificateContributed: false
    const result = await CourseHistory.updateMany(
      { certificateContributed: { $exists: false } },
      { 
        $set: { 
          certificateContributed: false 
        } 
      }
    );

    console.log(`✅ Migration completed:`);
    console.log(`   Records updated: ${result.modifiedCount}`);
    console.log(`   Records matched: ${result.matchedCount}`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrateCourseHistory();
