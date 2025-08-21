const mongoose = require('mongoose');
const PendingCredits = require('./model3/pendingcredits');
const bprndStudents = require('./model3/bprndstudents');
const umbrella = require('./model3/umbrella');
const CourseHistory = require('./model3/course_history');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugPendingCredits() {
  try {
    console.log('🔍 Debugging Pending Credits Flow...\n');

    // 1. Check all pending credits
    console.log('📋 1. All Pending Credits:');
    const allPending = await PendingCredits.find({}).populate('studentId', 'Name email');
    console.log(`   Total pending credits: ${allPending.length}`);
    
    allPending.forEach((credit, index) => {
      console.log(`   ${index + 1}. ID: ${credit._id}`);
      console.log(`      Student: ${credit.studentId?.Name || 'Unknown'} (${credit.studentId?.email || 'No email'})`);
      console.log(`      Discipline: ${credit.discipline}`);
      console.log(`      Theory Hours: ${credit.theoryHours || 'N/A'}`);
      console.log(`      Practical Hours: ${credit.practicalHours || 'N/A'}`);
      console.log(`      Total Hours: ${credit.totalHours || 'N/A'}`);
      console.log(`      Admin Approved: ${credit.admin_approved}`);
      console.log(`      POC Approved: ${credit.bprnd_poc_approved}`);
      console.log(`      Status: ${credit.status}`);
      console.log(`      Created: ${credit.createdAt}`);
      console.log('');
    });

    // 2. Check pending credits that should be visible to admin (POC approved, admin not)
    console.log('📋 2. Pending Credits for Admin Approval:');
    const adminPending = await PendingCredits.find({
      bprnd_poc_approved: true,
      admin_approved: false
    }).populate('studentId', 'Name email');
    
    console.log(`   Total admin pending: ${adminPending.length}`);
    adminPending.forEach((credit, index) => {
      console.log(`   ${index + 1}. ID: ${credit._id}`);
      console.log(`      Student: ${credit.studentId?.Name || 'Unknown'}`);
      console.log(`      Discipline: ${credit.discipline}`);
      console.log(`      Theory Hours: ${credit.theoryHours || 'N/A'}`);
      console.log(`      Practical Hours: ${credit.practicalHours || 'N/A'}`);
      console.log(`      Total Hours: ${credit.totalHours || 'N/A'}`);
      console.log('');
    });

    // 3. Check fully approved pending credits (both POC and admin approved)
    console.log('📋 3. Fully Approved Pending Credits:');
    const fullyApproved = await PendingCredits.find({
      bprnd_poc_approved: true,
      admin_approved: true
    }).populate('studentId', 'Name email');
    
    console.log(`   Total fully approved: ${fullyApproved.length}`);
    fullyApproved.forEach((credit, index) => {
      console.log(`   ${index + 1}. ID: ${credit._id}`);
      console.log(`      Student: ${credit.studentId?.Name || 'Unknown'}`);
      console.log(`      Discipline: ${credit.discipline}`);
      console.log(`      Theory Hours: ${credit.theoryHours || 'N/A'}`);
      console.log(`      Practical Hours: ${credit.practicalHours || 'N/A'}`);
      console.log(`      Total Hours: ${credit.totalHours || 'N/A'}`);
      console.log('');
    });

    // 4. Check umbrella fields
    console.log('📋 4. Available Umbrella Fields:');
    const umbrellaFields = await umbrella.find({}).lean();
    console.log(`   Total umbrella fields: ${umbrellaFields.length}`);
    umbrellaFields.forEach((field, index) => {
      console.log(`   ${index + 1}. Name: "${field.name}" -> Field Key: "${field.name.replace(/\s+/g, '_')}"`);
    });

    // 5. Check a specific student's credits
    if (allPending.length > 0) {
      const sampleStudentId = allPending[0].studentId;
      console.log(`\n📋 5. Sample Student Credits (${sampleStudentId}):`);
      
      const student = await bprndStudents.findById(sampleStudentId);
      if (student) {
        console.log(`   Student: ${student.Name}`);
        console.log(`   Total Credits: ${student.Total_Credits || 0}`);
        
        // Check umbrella-specific credits
        umbrellaFields.forEach(field => {
          const fieldKey = field.name.replace(/\s+/g, '_');
          const credits = student[fieldKey] || 0;
          console.log(`   ${field.name}: ${credits} credits`);
        });
      }
    }

    // 6. Check course history
    if (allPending.length > 0) {
      const sampleStudentId = allPending[0].studentId;
      console.log(`\n📋 6. Sample Student Course History (${sampleStudentId}):`);
      
      const courseHistory = await CourseHistory.find({ studentId: sampleStudentId });
      console.log(`   Total course history entries: ${courseHistory.length}`);
      
      courseHistory.slice(0, 3).forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.name} (${entry.discipline})`);
        console.log(`      Theory: ${entry.theoryHours}h = ${entry.theoryCredits} credits`);
        console.log(`      Practical: ${entry.practicalHours}h = ${entry.practicalCredits} credits`);
        console.log(`      Total: ${entry.totalHours}h = ${entry.creditsEarned} credits`);
        console.log(`      Count: ${entry.count}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error debugging pending credits:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugPendingCredits();
