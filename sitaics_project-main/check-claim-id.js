const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function checkClaimId() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    const claimsCollection = db.collection('bprnd_certification_claims');
    
    // Find the specific claim by student ID and umbrella
    const claim = await claimsCollection.findOne({
      studentId: '68a06aecb24bd983a3e92d4f',
      umbrellaKey: 'Criminology',
      status: 'pending'
    });
    
    if (claim) {
      console.log(`🔍 Found Criminology claim:`);
      console.log(`   ID: ${claim._id}`);
      console.log(`   ID type: ${typeof claim._id}`);
      console.log(`   ID string: ${claim._id.toString()}`);
      console.log(`   Student ID: ${claim.studentId}`);
      console.log(`   Status: ${claim.status}`);
      console.log(`   Required Credits: ${claim.requiredCredits}`);
      console.log(`   Has courses: ${!!claim.courses}`);
    } else {
      console.log('❌ Criminology claim not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkClaimId();
