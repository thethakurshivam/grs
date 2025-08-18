const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function checkStudentCourseHistoryAll() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    const courseHistoryCollection = db.collection('course_history');
    const bprndStudentsCollection = db.collection('bprndstudents');
    
    // Check the student with missing courses (68a06aecb24bd983a3e92d4f)
    const studentId = '68a06aecb24bd983a3e92d4f';
    
    console.log(`\n🔍 Checking ALL course history for student: ${studentId}`);
    
    // Check course_history collection for ALL disciplines
    const courseHistory = await courseHistoryCollection.find({ studentId: studentId }).toArray();
    console.log(`📚 Total course history entries: ${courseHistory.length}`);
    
    if (courseHistory.length > 0) {
      courseHistory.forEach((entry, index) => {
        console.log(`\n   Entry ${index + 1}:`);
        console.log(`     Discipline: ${entry.discipline}`);
        console.log(`     Course Name: ${entry.name}`);
        console.log(`     Credits: ${entry.creditsEarned}`);
        console.log(`     Hours: ${entry.hoursEarned}`);
        console.log(`     Completion Date: ${entry.completionDate}`);
      });
    } else {
      console.log('   ❌ No course history entries found');
    }
    
    // Check bprndstudents collection for credit bank
    const student = await bprndStudentsCollection.findOne({ studentId: studentId });
    if (student) {
      console.log(`\n💰 Student credit bank:`);
      console.log(`   Cyber_Security: ${student.Cyber_Security || 0}`);
      console.log(`   Criminology: ${student.Criminology || 0}`);
      console.log(`   Defence: ${student.Defence || 0}`);
      console.log(`   Forensics: ${student.Forensics || 0}`);
      console.log(`   Military_Law: ${student.Military_Law || 0}`);
      console.log(`   Police_Administration: ${student.Police_Administration || 0}`);
      console.log(`   Total_Credits: ${student.Total_Credits || 0}`);
    } else {
      console.log('❌ Student not found in bprndstudents collection');
    }
    
    // Check what disciplines exist in course_history for this student
    const disciplines = [...new Set(courseHistory.map(entry => entry.discipline))];
    console.log(`\n📋 Disciplines with course history: ${disciplines.join(', ') || 'None'}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkStudentCourseHistoryAll();
