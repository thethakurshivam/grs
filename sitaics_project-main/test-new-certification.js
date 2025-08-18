const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function testNewCertification() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    const courseHistoryCollection = db.collection('course_history');
    const claimsCollection = db.collection('bprnd_certification_claims');
    
    // Test student ID
    const studentId = '68a06aecb24bd983a3e92d4f';
    const umbrellaKey = 'Criminology';
    const qualification = 'diploma';
    const requiredCredits = 30;
    
    console.log(`🔍 Testing certification request for:`);
    console.log(`   Student ID: ${studentId}`);
    console.log(`   Umbrella: ${umbrellaKey}`);
    console.log(`   Qualification: ${qualification}`);
    console.log(`   Required Credits: ${requiredCredits}`);
    
    // Check if student has course history
    const courseHistory = await courseHistoryCollection.find({
      studentId: studentId,
      discipline: umbrellaKey
    }).sort({ createdAt: 1 }).toArray();
    
    console.log(`\n📚 Course history found: ${courseHistory.length} entries`);
    
    courseHistory.forEach((course, index) => {
      console.log(`   Course ${index + 1}: ${course.name} - ${course.creditsEarned} credits`);
    });
    
    // Simulate the course selection logic
    const contributingCourses = [];
    let accumulatedCredits = 0;
    
    for (const course of courseHistory) {
      if (accumulatedCredits >= requiredCredits) break;
      
      const courseCredits = course.creditsEarned || 0;
      if (accumulatedCredits + courseCredits <= requiredCredits) {
        // This course fully contributes to the certification
        contributingCourses.push({
          courseName: course.name,
          organization: course.organization,
          hoursEarned: course.hoursEarned,
          creditsEarned: course.creditsEarned,
          completionDate: course.completionDate,
          courseId: course._id
        });
        accumulatedCredits += courseCredits;
      } else {
        // This course partially contributes (if needed)
        const remainingCredits = requiredCredits - accumulatedCredits;
        if (remainingCredits > 0) {
          contributingCourses.push({
            courseName: course.name,
            organization: course.organization,
            hoursEarned: Math.ceil(remainingCredits * 15), // Convert back to hours
            creditsEarned: remainingCredits,
            completionDate: course.completionDate,
            courseId: course._id
          });
          accumulatedCredits = requiredCredits;
        }
        break;
      }
    }
    
    console.log(`\n🔍 Course selection result:`);
    console.log(`   Accumulated Credits: ${accumulatedCredits}/${requiredCredits}`);
    console.log(`   Contributing Courses: ${contributingCourses.length}`);
    
    contributingCourses.forEach((course, index) => {
      console.log(`   Course ${index + 1}: ${course.courseName} - ${course.creditsEarned} credits`);
    });
    
    // Check if this would create a valid claim
    if (accumulatedCredits >= requiredCredits) {
      console.log(`\n✅ Student is eligible for ${qualification} in ${umbrellaKey}`);
      console.log(`   Total credits available: ${accumulatedCredits}`);
      console.log(`   Required credits: ${requiredCredits}`);
      console.log(`   Courses will be included in claim`);
    } else {
      console.log(`\n❌ Student is NOT eligible for ${qualification} in ${umbrellaKey}`);
      console.log(`   Total credits available: ${accumulatedCredits}`);
      console.log(`   Required credits: ${requiredCredits}`);
      console.log(`   Missing: ${requiredCredits - accumulatedCredits} credits`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testNewCertification();
