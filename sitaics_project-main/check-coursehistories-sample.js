const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function checkCourseHistoriesSample() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    const courseHistoriesCollection = db.collection('coursehistories');
    
    console.log('🔍 Checking sample documents in coursehistories collection...');
    
    // Get a few sample documents
    const sampleDocs = await courseHistoriesCollection.find({}).limit(5).toArray();
    console.log(`\n📚 Found ${sampleDocs.length} sample documents`);
    
    sampleDocs.forEach((doc, index) => {
      console.log(`\n📋 Document ${index + 1}:`);
      console.log(`   ID: ${doc._id}`);
      console.log(`   Student ID: ${doc.studentId}`);
      console.log(`   Name: ${doc.name || 'N/A'}`);
      console.log(`   Organization: ${doc.organization || 'N/A'}`);
      console.log(`   Discipline: ${doc.discipline || 'N/A'}`);
      console.log(`   Total Hours: ${doc.totalHours || 'N/A'}`);
      console.log(`   Credits Earned: ${doc.creditsEarned || 'N/A'}`);
      console.log(`   No of Days: ${doc.noOfDays || 'N/A'}`);
      console.log(`   Count: ${doc.count || 'N/A'}`);
      console.log(`   Created: ${doc.createdAt || 'N/A'}`);
      console.log(`   Updated: ${doc.updatedAt || 'N/A'}`);
      
      // Show all available fields
      const fields = Object.keys(doc).filter(key => key !== '_id');
      console.log(`   All fields: ${fields.join(', ')}`);
    });
    
    // Check what disciplines exist
    const disciplines = await courseHistoriesCollection.distinct('discipline');
    console.log(`\n🔍 Available disciplines in coursehistories: ${disciplines.length}`);
    disciplines.forEach(discipline => {
      console.log(`   - "${discipline}"`);
    });
    
    // Check if there are any students with course history
    const studentsWithHistory = await courseHistoriesCollection.distinct('studentId');
    console.log(`\n👥 Students with course history: ${studentsWithHistory.length}`);
    if (studentsWithHistory.length > 0) {
      studentsWithHistory.slice(0, 5).forEach(studentId => {
        console.log(`   - ${studentId}`);
      });
      if (studentsWithHistory.length > 5) {
        console.log(`   ... and ${studentsWithHistory.length - 5} more`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkCourseHistoriesSample();
