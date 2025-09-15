const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function checkPendingCreditsStudent() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    const pendingCreditsCollection = db.collection('pendingcredits');
    
    // Check the specific student
    const studentId = '68a06aecb24bd983a3e92d4f';
    
    console.log(`🔍 Checking pending credits for student: ${studentId}`);
    
    // Find all pending credits for this student
    const pendingCredits = await pendingCreditsCollection.find({
      studentId: studentId
    }).toArray();
    
    console.log(`📊 Found ${pendingCredits.length} pending credit requests`);
    
    if (pendingCredits.length > 0) {
      pendingCredits.forEach((credit, index) => {
        console.log(`\n📋 Pending Credit ${index + 1}:`);
        console.log(`   ID: ${credit._id}`);
        console.log(`   Name: ${credit.name}`);
        console.log(`   Organization: ${credit.organization}`);
        console.log(`   Discipline: ${credit.discipline}`);
        console.log(`   Total Hours: ${credit.totalHours}`);
        console.log(`   Admin Approved: ${credit.admin_approved}`);
        console.log(`   POC Approved: ${credit.bprnd_poc_approved}`);
        console.log(`   Status: ${credit.status}`);
        console.log(`   Created: ${credit.createdAt}`);
      });
    } else {
      console.log('   ❌ No pending credit requests found');
    }
    
    // Check if there are any pending credits that could be processed
    const processableCredits = pendingCredits.filter(credit => 
      credit.admin_approved && credit.bprnd_poc_approved
    );
    
    console.log(`\n🔍 Processable credits (both approved): ${processableCredits.length}`);
    
    if (processableCredits.length > 0) {
      console.log('   These credits should be processed to create course history!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkPendingCreditsStudent();
