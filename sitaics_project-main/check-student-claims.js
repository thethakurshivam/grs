const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function checkStudentClaims() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    const claimsCollection = db.collection('bprnd_certification_claims');
    
    // Find all claims for the specific student
    const claims = await claimsCollection.find({
      studentId: '68a06aecb24bd983a3e92d4f'
    }).toArray();
    
    console.log(`📊 Found ${claims.length} claims for student 68a06aecb24bd983a3e92d4f`);
    
    claims.forEach((claim, index) => {
      console.log(`\n📋 Claim ${index + 1}:`);
      console.log(`   ID: ${claim._id}`);
      console.log(`   Umbrella: ${claim.umbrellaKey}`);
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

checkStudentClaims();
