const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function debugStudentId() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    const claimsCollection = db.collection('bprnd_certification_claims');
    
    // Find all claims and check student ID format
    const claims = await claimsCollection.find({}).toArray();
    
    console.log(`📊 Found ${claims.length} total claims`);
    
    // Look for claims that might match our student
    claims.forEach((claim, index) => {
      if (claim.studentId && claim.studentId.toString().includes('68a06aecb24bd983a3e92d4f')) {
        console.log(`\n🔍 Potential match in claim ${index + 1}:`);
        console.log(`   ID: ${claim._id}`);
        console.log(`   Student ID: ${claim.studentId}`);
        console.log(`   Student ID type: ${typeof claim.studentId}`);
        console.log(`   Student ID string: ${claim.studentId.toString()}`);
        console.log(`   Umbrella: ${claim.umbrellaKey}`);
        console.log(`   Status: ${claim.status}`);
      }
    });
    
    // Also check for claims with similar student IDs
    const similarClaims = claims.filter(claim => 
      claim.studentId && 
      claim.studentId.toString().startsWith('68a06aecb24bd983a3e92d4f')
    );
    
    console.log(`\n📋 Found ${similarClaims.length} claims with similar student ID pattern`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

debugStudentId();
