const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function checkAllPendingCredits() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    const pendingCreditsCollection = db.collection('pendingcredits');
    
    console.log('🔍 Checking all pending credits in the system...');
    
    // Get all pending credits
    const allPendingCredits = await pendingCreditsCollection.find({}).toArray();
    console.log(`\n📊 Total pending credits: ${allPendingCredits.length}`);
    
    if (allPendingCredits.length > 0) {
      // Group by status
      const byStatus = {};
      allPendingCredits.forEach(credit => {
        const status = credit.status || 'unknown';
        if (!byStatus[status]) byStatus[status] = [];
        byStatus[status].push(credit);
      });
      
      console.log('\n📋 Pending credits by status:');
      Object.entries(byStatus).forEach(([status, credits]) => {
        console.log(`   ${status}: ${credits.length} requests`);
      });
      
      // Show details for each status
      Object.entries(byStatus).forEach(([status, credits]) => {
        console.log(`\n🔍 ${status.toUpperCase()} requests:`);
        credits.forEach((credit, index) => {
          console.log(`   ${index + 1}. ${credit.name} - ${credit.discipline}`);
          console.log(`      Student ID: ${credit.studentId}`);
          console.log(`      Organization: ${credit.organization}`);
          console.log(`      Hours: ${credit.totalHours}`);
          console.log(`      Admin Approved: ${credit.admin_approved}`);
          console.log(`      POC Approved: ${credit.bprnd_poc_approved}`);
          console.log(`      Status: ${credit.status}`);
          console.log(`      Created: ${credit.createdAt}`);
        });
      });
      
      // Check for processable credits (both approved)
      const processableCredits = allPendingCredits.filter(credit => 
        credit.admin_approved && credit.bprnd_poc_approved
      );
      
      console.log(`\n🔍 Processable credits (both approved): ${processableCredits.length}`);
      if (processableCredits.length > 0) {
        console.log('   These should be processed to create course history!');
        processableCredits.forEach((credit, index) => {
          console.log(`   ${index + 1}. ${credit.name} - ${credit.discipline} (${credit.studentId})`);
        });
      }
      
    } else {
      console.log('   ❌ No pending credit requests found in the system');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkAllPendingCredits();
