const mongoose = require('mongoose');
const PendingCredits = require('./model3/pendingcredits');
const umbrella = require('./model3/umbrella');
const CourseHistory = require('./model3/course_history');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testCreditApplication() {
  try {
    console.log('🔍 Testing Credit Application Process...\n');

    // Find approved pending credits that need credit application
    const approvedPendingCredits = await PendingCredits.find({
      bprnd_poc_approved: true,
      admin_approved: true,
      status: 'approved'
    });

    console.log(`📋 Found ${approvedPendingCredits.length} approved pending credits that need credit application`);

    for (const pendingCredit of approvedPendingCredits) {
      console.log(`\n🔍 Processing pending credit: ${pendingCredit._id}`);
      console.log(`   Student: ${pendingCredit.studentId}`);
      console.log(`   Discipline: ${pendingCredit.discipline}`);
      console.log(`   Theory Hours: ${pendingCredit.theoryHours || 'N/A'}`);
      console.log(`   Practical Hours: ${pendingCredit.practicalHours || 'N/A'}`);
      console.log(`   Total Hours: ${pendingCredit.totalHours || 'N/A'}`);

              // Calculate credits using new formula: theory (15 hours = 1 credit) + practical (30 hours = 1 credit)
        const theoryHours = Number(pendingCredit.theoryHours || 0);
        const practicalHours = Number(pendingCredit.practicalHours || 0);
        const newCredits = (theoryHours / 15) + (practicalHours / 30);
      
      // Calculate individual credits for detailed logging
      const theoryCredits = theoryHours / 15;
      const practicalCredits = practicalHours / 30;
      
      console.log(`📊 Credit calculation: Theory ${theoryHours}h (${theoryCredits.toFixed(2)} credits) + Practical ${practicalHours}h (${practicalCredits.toFixed(2)} credits) = ${newCredits} total credits`);

      if (newCredits > 0) {
        // Find student in credit_calculations collection and update credits
        const db = mongoose.connection.db;
        const creditCalculationsCollection = db.collection('credit_calculations');
        
        const student = await creditCalculationsCollection.findOne({ _id: pendingCredit.studentId });
        if (student) {
          console.log(`🔍 Found student: ${student.Name} (${student.email})`);
          
          // Dynamically fetch umbrella fields from database
          const umbrellaFields = await umbrella.find({}).lean();
          if (!umbrellaFields || umbrellaFields.length === 0) {
            console.log('⚠️ No umbrella fields found in database');
            continue;
          } else {
            // Convert umbrella names to field keys (e.g., "Cyber Security" -> "Cyber_Security")
            const UMBRELLA_KEYS = umbrellaFields.map(u => u.name.replace(/\s+/g, '_'));
            
            console.log(`🔍 Available umbrella fields: ${UMBRELLA_KEYS.join(', ')}`);
            
            // Normalize discipline for matching
            const normalize = (s) => String(s || '')
              .toLowerCase()
              .replace(/[_-]+/g, ' ')
              .replace(/[^a-z\s]/g, '')
              .replace(/\s+/g, ' ')
              .trim();
            
            const normDiscipline = normalize(pendingCredit.discipline);
            console.log(`🔍 Normalized discipline: "${normDiscipline}"`);
            
            // Find matching umbrella field
            let fieldKey = UMBRELLA_KEYS.find(
              (k) => normalize(k.replace(/_/g, ' ')) === normDiscipline
            );
            
            if (!fieldKey) {
              // Try partial includes match
              fieldKey = UMBRELLA_KEYS.find(
                (k) => normalize(k.replace(/_/g, ' ')).includes(normDiscipline) ||
                       normDiscipline.includes(normalize(k.replace(/_/g, ' ')))
              );
            }
            
            if (!fieldKey && student.Umbrella) {
              // Fallback to student's umbrella selection
              const normStudentUmbrella = normalize(student.Umbrella);
              fieldKey = UMBRELLA_KEYS.find(
                (k) => normalize(k.replace(/_/g, ' ')) === normStudentUmbrella
              ) || UMBRELLA_KEYS.find(
                (k) => normalize(k.replace(/_/g, ' ')).includes(normStudentUmbrella)
              );
            }
            
            // Update student credits in credit_calculations collection
            if (fieldKey) {
              await creditCalculationsCollection.updateOne(
                { _id: pendingCredit.studentId },
                {
                  $inc: {
                    Total_Credits: newCredits,
                    [fieldKey]: newCredits,
                  },
                }
              );
              console.log(`✅ Credits applied: ${newCredits} credits added to student ${student.Name} in field: ${fieldKey}`);
            } else {
              await creditCalculationsCollection.updateOne(
                { _id: pendingCredit.studentId },
                { $inc: { Total_Credits: newCredits } }
              );
              console.log(`⚠️ No matching umbrella field found for discipline "${pendingCredit.discipline}", only Total_Credits updated`);
            }
          }
        } else {
          console.log(`❌ Student not found in credit_calculations collection: ${pendingCredit.studentId}`);
          continue;
        }
      }
      
      // Save course information to course_history
      try {
        // Find the last entry in course_history for this student and discipline
        const lastEntry = await CourseHistory.findOne({
          studentId: pendingCredit.studentId,
          discipline: pendingCredit.discipline
        }).sort({ createdAt: -1 });
        
        // Calculate the new count: last count + new credits earned
        const lastCount = lastEntry ? lastEntry.count : 0;
        const newCount = lastCount + newCredits;
        
        console.log(`🔍 Count calculation: Last count (${lastCount}) + New credits (${newCredits}) = New count (${newCount})`);
        
        const courseHistoryEntry = new CourseHistory({
          studentId: pendingCredit.studentId,
          name: pendingCredit.name,
          organization: pendingCredit.organization,
          discipline: pendingCredit.discipline,
          theoryHours: pendingCredit.theoryHours,
          practicalHours: pendingCredit.practicalHours,
          theoryCredits: theoryCredits,
          practicalCredits: practicalCredits,
          totalHours: pendingCredit.totalHours,
          noOfDays: pendingCredit.noOfDays,
          creditsEarned: newCredits,
          count: newCount
        });
        
        await courseHistoryEntry.save();
        console.log(`✅ Course history saved for student ${pendingCredit.studentId}: ${pendingCredit.name}`);
        console.log(`   📊 Theory: ${theoryHours}h = ${theoryCredits.toFixed(2)} credits`);
        console.log(`   📊 Practical: ${practicalHours}h = ${practicalCredits.toFixed(2)} credits`);
        console.log(`   📊 Total: ${newCredits.toFixed(2)} credits | Cumulative count: ${newCount}`);
      } catch (historyError) {
        console.error('Error saving to course history:', historyError);
      }
      
      // Delete the pending credit record after successful credit application
      await PendingCredits.findByIdAndDelete(pendingCredit._id);
      console.log(`✅ Pending credit record ${pendingCredit._id} deleted after successful credit application`);
    }

    console.log('\n🎉 Credit application process completed!');

  } catch (error) {
    console.error('❌ Error testing credit application:', error);
  } finally {
    mongoose.connection.close();
  }
}

testCreditApplication();
