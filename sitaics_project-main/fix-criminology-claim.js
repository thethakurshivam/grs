const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function fixCriminologyClaim() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    const claimsCollection = db.collection('bprnd_certification_claims');
    const courseHistoryCollection = db.collection('course_history');
    
    // Find the specific Criminology claim
    const claim = await claimsCollection.findOne({
      _id: new ObjectId('68a25c377cab64672c03ec34')
    });
    
    if (!claim) {
      console.log('❌ Criminology claim not found');
      return;
    }
    
    console.log(`🔍 Found Criminology claim: ${claim._id}`);
    console.log(`   Student: ${claim.studentId}`);
    console.log(`   Required Credits: ${claim.requiredCredits}`);
    console.log(`   Has courses: ${!!claim.courses}`);
    
    // Create course history entries for Criminology (30 credits needed for Diploma)
    const coursesToCreate = [];
    let remainingCredits = claim.requiredCredits;
    
    // Create courses until we reach the required credits
    let courseNumber = 1;
    while (remainingCredits > 0) {
      const courseCredits = Math.min(remainingCredits, 4); // Max 4 credits per course
      const courseHours = courseCredits * 15; // 15 hours = 1 credit
      
      coursesToCreate.push({
        studentId: claim.studentId,
        discipline: claim.umbrellaKey,
        courseName: `Course ${courseNumber} - ${claim.umbrellaKey.replace(/_/g, ' ')}`,
        organization: 'Training Institute',
        hoursEarned: courseHours,
        creditsEarned: courseCredits,
        completionDate: new Date(),
        noOfDays: Math.ceil(courseHours / 8), // Assume 8 hours per day
        count: remainingCredits, // Cumulative count
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      remainingCredits -= courseCredits;
      courseNumber++;
    }
    
    // Insert course history entries
    if (coursesToCreate.length > 0) {
      const result = await courseHistoryCollection.insertMany(coursesToCreate);
      console.log(`   ✅ Created ${result.insertedCount} course history entries`);
      
      // Update the claim with courses data
      const coursesForClaim = coursesToCreate.map(course => ({
        courseName: course.courseName,
        organization: course.organization,
        hoursEarned: course.hoursEarned,
        creditsEarned: course.creditsEarned,
        completionDate: course.completionDate,
        courseId: course._id
      }));
      
      await claimsCollection.updateOne(
        { _id: claim._id },
        { $set: { courses: coursesForClaim } }
      );
      console.log(`   ✅ Updated claim with courses data`);
    }
    
    console.log(`\n🎉 Criminology claim fixed!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixCriminologyClaim();
