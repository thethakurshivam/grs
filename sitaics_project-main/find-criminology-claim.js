const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function findCriminologyClaim() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    const claimsCollection = db.collection('bprnd_certification_claims');
    
    // Find all Criminology claims
    const claims = await claimsCollection.find({
      umbrellaKey: 'Criminology'
    }).toArray();
    
    console.log(`📊 Found ${claims.length} Criminology claims`);
    
    claims.forEach((claim, index) => {
      console.log(`\n📋 Claim ${index + 1}:`);
      console.log(`   ID: ${claim._id}`);
      console.log(`   Student ID: ${claim.studentId}`);
      console.log(`   Status: ${claim.status}`);
      console.log(`   Required Credits: ${claim.requiredCredits}`);
      console.log(`   Has courses: ${!!claim.courses}`);
      console.log(`   Courses length: ${claim.courses ? claim.courses.length : 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

findCriminologyClaim();
