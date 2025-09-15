const mongoose = require('mongoose');
const PendingCredits = require('./model3/pendingcredits');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updatePendingCredits() {
  try {
    console.log('🔍 Updating existing pending credits with new fields...\n');

    // Find all pending credits that don't have theoryCredits or practicalCredits
    const pendingCredits = await PendingCredits.find({
      $or: [
        { theoryCredits: { $exists: false } },
        { practicalCredits: { $exists: false } }
      ]
    });

    console.log(`📋 Found ${pendingCredits.length} pending credits to update`);

    for (const credit of pendingCredits) {
      console.log(`\n🔍 Updating pending credit: ${credit._id}`);
      console.log(`   Student: ${credit.name}`);
      console.log(`   Discipline: ${credit.discipline}`);
      console.log(`   Theory Hours: ${credit.theoryHours}`);
      console.log(`   Practical Hours: ${credit.practicalHours}`);

      // Handle old records that might not have theoryHours/practicalHours
      if (credit.theoryHours === undefined || credit.practicalHours === undefined) {
        console.log(`   ⚠️ Old record - missing theory/practical hours, using totalHours: ${credit.totalHours}`);
        
        // For old records, assume all hours are theory hours (conservative approach)
        const theoryHours = credit.totalHours || 0;
        const practicalHours = 0;
        const theoryCredits = theoryHours / 15;
        const practicalCredits = 0;
        const calculatedCredits = theoryCredits;

        console.log(`   Calculated Theory Hours: ${theoryHours}`);
        console.log(`   Calculated Practical Hours: ${practicalHours}`);
        console.log(`   Calculated Theory Credits: ${theoryCredits.toFixed(2)}`);
        console.log(`   Calculated Practical Credits: ${practicalCredits.toFixed(2)}`);
        console.log(`   Calculated Total Credits: ${calculatedCredits.toFixed(2)}`);

        // Update the document with all fields
        await PendingCredits.findByIdAndUpdate(credit._id, {
          $set: {
            theoryHours: theoryHours,
            practicalHours: practicalHours,
            theoryCredits: theoryCredits,
            practicalCredits: practicalCredits,
            calculatedCredits: calculatedCredits
          }
        });
      } else {
        // Calculate the new fields for records with theory/practical hours
        // New formula: theory (15 hours = 1 credit) + practical (30 hours = 1 credit)
        const theoryCredits = credit.theoryHours / 15;
        const practicalCredits = credit.practicalHours / 30;
        const totalHours = credit.theoryHours + credit.practicalHours;
        const calculatedCredits = theoryCredits + practicalCredits;

        console.log(`   Calculated Theory Credits: ${theoryCredits.toFixed(2)}`);
        console.log(`   Calculated Practical Credits: ${practicalCredits.toFixed(2)}`);
        console.log(`   Calculated Total Hours: ${totalHours}`);
        console.log(`   Calculated Total Credits: ${calculatedCredits.toFixed(2)}`);

        // Update the document
        await PendingCredits.findByIdAndUpdate(credit._id, {
          $set: {
            theoryCredits: theoryCredits,
            practicalCredits: practicalCredits,
            totalHours: totalHours,
            calculatedCredits: calculatedCredits
          }
        });
      }

      console.log(`   ✅ Updated successfully`);
    }

    console.log('\n🎉 All pending credits updated successfully!');

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const updatedCredits = await PendingCredits.find({});
    console.log(`📋 Total pending credits: ${updatedCredits.length}`);
    
    updatedCredits.forEach((credit, index) => {
      console.log(`   ${index + 1}. ${credit.name} (${credit.discipline})`);
      console.log(`      Theory: ${credit.theoryHours}h = ${credit.theoryCredits?.toFixed(2) || 'N/A'} credits`);
      console.log(`      Practical: ${credit.practicalHours}h = ${credit.practicalCredits?.toFixed(2) || 'N/A'} credits`);
      console.log(`      Total: ${credit.totalHours}h = ${credit.calculatedCredits?.toFixed(2) || 'N/A'} credits`);
    });

  } catch (error) {
    console.error('❌ Error updating pending credits:', error);
  } finally {
    mongoose.connection.close();
  }
}

updatePendingCredits();
