const mongoose = require('mongoose');
const CourseHistory = require('./model3/course_history');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function recalculateAllCounts() {
  try {
    console.log('🔧 Recalculating Cumulative Counts for All Course History Records...\n');

    // Get all unique student-discipline combinations
    const studentDisciplines = await CourseHistory.aggregate([
      {
        $group: {
          _id: {
            studentId: '$studentId',
            discipline: '$discipline'
          }
        }
      }
    ]);

    console.log(`📊 Found ${studentDisciplines.length} student-discipline combinations to process\n`);

    let processedCount = 0;
    let errorCount = 0;

    for (const { _id } of studentDisciplines) {
      try {
        // Get all courses for this student-discipline combination, sorted by creation date
        const courses = await CourseHistory.find({
          studentId: _id.studentId,
          discipline: _id.discipline
        }).sort({ createdAt: 1 });

        let cumulativeCount = 0;
        
        // Recalculate count for each course
        for (const course of courses) {
          if (course.certificateContributed) {
            // For contributed courses, count only the remaining credits
            const remainingCredits = course.creditsEarned - (course.contributedToCertificate?.creditsContributed || 0);
            cumulativeCount += remainingCredits;
          } else {
            // For non-contributed courses, count all credits
            cumulativeCount += course.creditsEarned;
          }
          
          course.count = cumulativeCount;
          await course.save();
        }

        processedCount++;
        console.log(`✅ Processed student ${_id.studentId} - discipline ${_id.discipline} (${courses.length} courses)`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing student ${_id.studentId} - discipline ${_id.discipline}:`, error.message);
      }
    }

    console.log('\n🎉 Recalculation completed!');
    console.log(`   Successfully processed: ${processedCount} combinations`);
    console.log(`   Errors: ${errorCount} combinations`);

  } catch (error) {
    console.error('❌ Error during recalculation:', error);
  } finally {
    mongoose.connection.close();
  }
}

recalculateAllCounts();
