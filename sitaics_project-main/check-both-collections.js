const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function checkBothCollections() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    
    // Check both collections
    const collections = await db.listCollections().toArray();
    const courseCollections = collections.filter(col => 
      col.name.includes('course') || col.name.includes('Course')
    );
    
    console.log('🔍 Found course-related collections:');
    courseCollections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Check course_history collection
    const courseHistoryCollection = db.collection('course_history');
    const courseHistoryCount = await courseHistoryCollection.countDocuments();
    console.log(`\n📚 course_history collection: ${courseHistoryCount} documents`);
    
    if (courseHistoryCount > 0) {
      const sampleCourseHistory = await courseHistoryCollection.find({}).limit(3).toArray();
      console.log('   Sample documents:');
      sampleCourseHistory.forEach((doc, index) => {
        console.log(`     ${index + 1}. Student: ${doc.studentId}, Discipline: "${doc.discipline}", Credits: ${doc.creditsEarned}`);
      });
    }
    
    // Check coursehistories collection
    const courseHistoriesCollection = db.collection('coursehistories');
    const courseHistoriesCount = await courseHistoriesCollection.countDocuments();
    console.log(`\n📚 coursehistories collection: ${courseHistoriesCount} documents`);
    
    if (courseHistoriesCount > 0) {
      const sampleCourseHistories = await courseHistoriesCollection.find({}).limit(3).toArray();
      console.log('   Sample documents:');
      sampleCourseHistories.forEach((doc, index) => {
        console.log(`     ${index + 1}. Student: ${doc.studentId}, Discipline: "${doc.discipline || doc.umbrellaKey || 'N/A'}", Credits: ${doc.creditsEarned || doc.credits || 'N/A'}`);
      });
    }
    
    // Check which collection the models are actually using
    console.log('\n🔍 Checking model references:');
    
    // Check if there are any documents with studentId 68a06aecb24bd983a3e92d4f in either collection
    const targetStudentId = '68a06aecb24bd983a3e92d4f';
    
    const studentInCourseHistory = await courseHistoryCollection.findOne({ studentId: targetStudentId });
    const studentInCourseHistories = await courseHistoriesCollection.findOne({ studentId: targetStudentId });
    
    console.log(`   Student ${targetStudentId} in course_history: ${studentInCourseHistory ? 'YES' : 'NO'}`);
    console.log(`   Student ${targetStudentId} in coursehistories: ${studentInCourseHistories ? 'YES' : 'NO'}`);
    
    if (studentInCourseHistory) {
      console.log(`     Found in course_history: ${studentInCourseHistory.discipline} - ${studentInCourseHistory.creditsEarned} credits`);
    }
    
    if (studentInCourseHistories) {
      console.log(`     Found in coursehistories: ${studentInCourseHistories.discipline || studentInCourseHistories.umbrellaKey || 'N/A'} - ${studentInCourseHistories.creditsEarned || studentInCourseHistories.credits || 'N/A'} credits`);
    }
    
    // Check which collection has more data
    console.log('\n📊 Collection comparison:');
    console.log(`   course_history: ${courseHistoryCount} documents`);
    console.log(`   coursehistories: ${courseHistoriesCount} documents`);
    
    if (courseHistoryCount > courseHistoriesCount) {
      console.log('   💡 course_history appears to be the main collection');
    } else if (courseHistoriesCount > courseHistoryCount) {
      console.log('   💡 coursehistories appears to be the main collection');
    } else {
      console.log('   💡 Both collections have the same number of documents');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkBothCollections();
