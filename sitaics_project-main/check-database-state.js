const mongoose = require('mongoose');
const bprndStudents = require('./model3/bprndstudents');
const umbrella = require('./model3/umbrella');
const CourseHistory = require('./model3/course_history');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking Database State...\n');

    // 1. Check umbrella collection
    console.log('📋 1. Umbrella Collection:');
    const umbrellas = await umbrella.find({});
    console.log(`   Total umbrella documents: ${umbrellas.length}`);
    
    if (umbrellas.length === 0) {
      console.log('   ⚠️ No umbrella documents found! This will cause credit application to fail.');
    } else {
      umbrellas.forEach((umbrella, index) => {
        console.log(`   ${index + 1}. Name: "${umbrella.name}" -> Field Key: "${umbrella.name.replace(/\s+/g, '_')}"`);
      });
    }

    // 2. Check BPRND students
    console.log('\n📋 2. BPRND Students:');
    const students = await bprndStudents.find({}).limit(5);
    console.log(`   Total students: ${await bprndStudents.countDocuments()}`);
    
    if (students.length > 0) {
      students.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.Name} (${student.email})`);
        console.log(`      Total Credits: ${student.Total_Credits || 0}`);
        console.log(`      Umbrella: ${student.Umbrella || 'Not set'}`);
        
        // Check umbrella-specific credits if umbrellas exist
        if (umbrellas.length > 0) {
          umbrellas.forEach(umbrella => {
            const fieldKey = umbrella.name.replace(/\s+/g, '_');
            const credits = student[fieldKey] || 0;
            if (credits > 0) {
              console.log(`      ${umbrella.name}: ${credits} credits`);
            }
          });
        }
        console.log('');
      });
    }

    // 3. Check course history
    console.log('📋 3. Course History:');
    const courseHistory = await CourseHistory.find({}).limit(5);
    console.log(`   Total course history entries: ${await CourseHistory.countDocuments()}`);
    
    if (courseHistory.length > 0) {
      courseHistory.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.name} (${entry.discipline})`);
        console.log(`      Student: ${entry.studentId}`);
        console.log(`      Theory: ${entry.theoryHours}h = ${entry.theoryCredits} credits`);
        console.log(`      Practical: ${entry.practicalHours}h = ${entry.practicalCredits} credits`);
        console.log(`      Total: ${entry.totalHours}h = ${entry.creditsEarned} credits`);
        console.log(`      Count: ${entry.count}`);
        console.log(`      Created: ${entry.createdAt}`);
        console.log('');
      });
    }

    // 4. Check if there are any pending credits in the raw collection
    console.log('📋 4. Raw Pending Credits Collection:');
    const db = mongoose.connection.db;
    const pendingCreditsCollection = db.collection('pendingcredits');
    const rawPendingCredits = await pendingCreditsCollection.find({}).toArray();
    console.log(`   Raw pending credits count: ${rawPendingCredits.length}`);
    
    if (rawPendingCredits.length > 0) {
      rawPendingCredits.forEach((credit, index) => {
        console.log(`   ${index + 1}. ID: ${credit._id}`);
        console.log(`      Student ID: ${credit.studentId}`);
        console.log(`      Discipline: ${credit.discipline}`);
        console.log(`      Theory Hours: ${credit.theoryHours || 'N/A'}`);
        console.log(`      Practical Hours: ${credit.practicalHours || 'N/A'}`);
        console.log(`      Total Hours: ${credit.totalHours || 'N/A'}`);
        console.log(`      Admin Approved: ${credit.admin_approved}`);
        console.log(`      POC Approved: ${credit.bprnd_poc_approved}`);
        console.log(`      Status: ${credit.status}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error checking database state:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkDatabaseState();
