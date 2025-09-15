const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function checkClaimsCourses() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    const claimsCollection = db.collection('bprnd_certification_claims');
    
    // Find all claims
    const claims = await claimsCollection.find({}).toArray();
    console.log(`📊 Found ${claims.length} total claims`);
    
    // Check each claim for courses field
    claims.forEach((claim, index) => {
      console.log(`\n📋 Claim ${index + 1}:`);
      console.log(`   ID: ${claim._id}`);
      console.log(`   Student ID: ${claim.studentId}`);
      console.log(`   Umbrella: ${claim.umbrellaKey}`);
      console.log(`   Status: ${claim.status}`);
      console.log(`   Has courses field: ${claim.hasOwnProperty('courses')}`);
      console.log(`   Courses array length: ${claim.courses ? claim.courses.length : 'N/A'}`);
      
      if (claim.courses && claim.courses.length > 0) {
        console.log(`   First course: ${JSON.stringify(claim.courses[0], null, 2)}`);
      }
    });
    
    // Count claims with and without courses
    const withCourses = claims.filter(c => c.courses && c.courses.length > 0).length;
    const withoutCourses = claims.length - withCourses;
    
    console.log(`\n📈 Summary:`);
    console.log(`   Claims with courses: ${withCourses}`);
    console.log(`   Claims without courses: ${withoutCourses}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkClaimsCourses();
