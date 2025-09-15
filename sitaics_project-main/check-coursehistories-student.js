const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function checkCourseHistoriesStudent() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    const courseHistoriesCollection = db.collection('coursehistories');
    
    const studentId = '68a06aecb24bd983a3e92d4f';
    
    console.log(`🔍 Checking coursehistories collection for student: ${studentId}`);
    
    // Find all course history entries for this student
    const courseHistories = await courseHistoriesCollection.find({
      studentId: studentId
    }).toArray();
    
    console.log(`📚 Found ${courseHistories.length} course history entries`);
    
    if (courseHistories.length > 0) {
      courseHistories.forEach((course, index) => {
        console.log(`\n📋 Course ${index + 1}:`);
        console.log(`   ID: ${course._id}`);
        console.log(`   Name: ${course.name || course.courseName || 'N/A'}`);
        console.log(`   Organization: ${course.organization || 'N/A'}`);
        console.log(`   Discipline: ${course.discipline || course.umbrellaKey || 'N/A'}`);
        console.log(`   Hours: ${course.totalHours || course.hoursEarned || 'N/A'}`);
        console.log(`   Credits: ${course.creditsEarned || course.credits || 'N/A'}`);
        console.log(`   Completion Date: ${course.completionDate || course.createdAt || 'N/A'}`);
        console.log(`   Created: ${course.createdAt}`);
      });
    } else {
      console.log('   ❌ No course history entries found');
    }
    
    // Check what disciplines exist in coursehistories for this student
    const disciplines = await courseHistoriesCollection.distinct('discipline', { studentId: studentId });
    console.log(`\n🔍 Disciplines for this student: ${disciplines.length}`);
    disciplines.forEach(discipline => {
      console.log(`   - "${discipline}"`);
    });
    
    // Check if there are any documents with different field names
    const sampleDoc = await courseHistoriesCollection.findOne({ studentId: studentId });
    if (sampleDoc) {
      console.log(`\n📋 Sample document fields:`);
      Object.keys(sampleDoc).forEach(key => {
        if (key !== '_id') {
          console.log(`   ${key}: ${sampleDoc[key]}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkCourseHistoriesStudent();
