const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function testCourseHistoryAPI() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    
    // Test the same query that the API uses
    const studentId = '68a06aecb24bd983a3e92d4f';
    const umbrella = 'Criminology';
    
    console.log(`🔍 Testing course history API query for student: ${studentId}, umbrella: ${umbrella}`);
    
    // Test 1: Query course_history collection (what we were checking before)
    const courseHistoryCollection = db.collection('course_history');
    const courseHistoryQuery = {
      studentId: studentId,
      discipline: { $regex: new RegExp(umbrella, 'i') }
    };
    
    console.log('\n📚 Testing course_history collection:');
    console.log(`   Query: ${JSON.stringify(courseHistoryQuery)}`);
    
    const courseHistoryResults = await courseHistoryCollection.find(courseHistoryQuery).toArray();
    console.log(`   Results: ${courseHistoryResults.length} documents`);
    
    if (courseHistoryResults.length > 0) {
      courseHistoryResults.forEach((doc, index) => {
        console.log(`     ${index + 1}. ${doc.name} - ${doc.discipline} - ${doc.creditsEarned} credits`);
      });
    }
    
    // Test 2: Query coursehistories collection (what the model actually uses)
    const courseHistoriesCollection = db.collection('coursehistories');
    const courseHistoriesQuery = {
      studentId: studentId,
      discipline: { $regex: new RegExp(umbrella, 'i') }
    };
    
    console.log('\n📚 Testing coursehistories collection:');
    console.log(`   Query: ${JSON.stringify(courseHistoriesQuery)}`);
    
    const courseHistoriesResults = await courseHistoriesCollection.find(courseHistoriesQuery).toArray();
    console.log(`   Results: ${courseHistoriesResults.length} documents`);
    
    if (courseHistoriesResults.length > 0) {
      courseHistoriesResults.forEach((doc, index) => {
        console.log(`     ${index + 1}. ${doc.name || doc.courseName || 'N/A'} - ${doc.discipline || doc.umbrellaKey || 'N/A'} - ${doc.creditsEarned || doc.credits || 'N/A'} credits`);
      });
    }
    
    // Test 3: Check what the CourseHistory model would actually return
    console.log('\n🔍 What the CourseHistory model would return:');
    console.log(`   Model name: 'CourseHistory'`);
    console.log(`   Collection name: 'coursehistories' (MongoDB auto-pluralizes)`);
    console.log(`   Query: CourseHistory.find({ studentId: '${studentId}', discipline: /${umbrella}/i })`);
    
    // Test 4: Check if there are any documents with different field names
    console.log('\n🔍 Checking for documents with different field structures:');
    
    const sampleCourseHistory = await courseHistoryCollection.findOne({});
    if (sampleCourseHistory) {
      console.log('   course_history sample fields:', Object.keys(sampleCourseHistory).filter(k => k !== '_id'));
    }
    
    const sampleCourseHistories = await courseHistoriesCollection.findOne({});
    if (sampleCourseHistories) {
      console.log('   coursehistories sample fields:', Object.keys(sampleCourseHistories).filter(k => k !== '_id'));
    }
    
    // Test 5: Check which collection has data for any student
    console.log('\n📊 Collection data comparison:');
    const courseHistoryTotal = await courseHistoryCollection.countDocuments();
    const courseHistoriesTotal = await courseHistoriesCollection.countDocuments();
    
    console.log(`   course_history total documents: ${courseHistoryTotal}`);
    console.log(`   coursehistories total documents: ${courseHistoriesTotal}`);
    
    if (courseHistoryTotal > courseHistoriesTotal) {
      console.log('   💡 course_history appears to be the main collection');
    } else if (courseHistoriesTotal > courseHistoryTotal) {
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

testCourseHistoryAPI();
