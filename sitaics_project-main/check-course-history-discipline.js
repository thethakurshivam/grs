const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function checkCourseHistoryDiscipline() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    const courseHistoryCollection = db.collection('course_history');
    
    console.log('🔍 Checking discipline values in course_history collection...');
    
    // Get all unique discipline values
    const disciplines = await courseHistoryCollection.distinct('discipline');
    console.log(`\n📚 Found ${disciplines.length} unique discipline values:`);
    disciplines.forEach(discipline => {
      console.log(`   - "${discipline}"`);
    });
    
    // Check a few sample documents
    const sampleDocs = await courseHistoryCollection.find({}).limit(5).toArray();
    console.log(`\n📋 Sample course history documents:`);
    sampleDocs.forEach((doc, index) => {
      console.log(`   Document ${index + 1}:`);
      console.log(`     Student ID: ${doc.studentId}`);
      console.log(`     Name: ${doc.name}`);
      console.log(`     Discipline: "${doc.discipline}"`);
      console.log(`     Credits: ${doc.creditsEarned}`);
    });
    
    // Check if there are any documents with discipline matching umbrella keys
    const umbrellaKeys = ['Cyber_Security', 'Criminology', 'Defence', 'Forensics', 'Military_Law', 'Police_Administration'];
    console.log(`\n🔍 Checking for discipline matches with umbrella keys:`);
    
    umbrellaKeys.forEach(key => {
      const count = courseHistoryCollection.countDocuments({ discipline: key });
      console.log(`   ${key}: ${count} documents`);
    });
    
    // Check for discipline values that might be human-readable
    const humanReadableDisciplines = ['Cyber Security', 'Criminology', 'Defence', 'Forensics', 'Military Law', 'Police Administration'];
    console.log(`\n🔍 Checking for discipline matches with human-readable names:`);
    
    for (const discipline of humanReadableDisciplines) {
      const count = await courseHistoryCollection.countDocuments({ discipline: discipline });
      console.log(`   "${discipline}": ${count} documents`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkCourseHistoryDiscipline();
