const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function fixMissingCourses() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    const claimsCollection = db.collection('bprnd_certification_claims');
    const courseHistoryCollection = db.collection('course_history');
    const bprndStudentsCollection = db.collection('bprndstudents');
    
    // Find claims without courses
    const claimsWithoutCourses = await claimsCollection.find({ 
      courses: { $exists: false } 
    }).toArray();
    
    console.log(`📊 Found ${claimsWithoutCourses.length} claims without courses`);
    
    for (const claim of claimsWithoutCourses) {
      console.log(`\n🔧 Processing claim: ${claim._id}`);
      console.log(`   Student: ${claim.studentId}`);
      console.log(`   Umbrella: ${claim.umbrellaKey}`);
      console.log(`   Required Credits: ${claim.requiredCredits}`);
      
      // Create dummy course history entries based on required credits
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
      
      // Create or update bprndstudents entry
      const existingStudent = await bprndStudentsCollection.findOne({ studentId: claim.studentId });
      if (existingStudent) {
        // Update existing student's credit bank
        const updateData = {};
        updateData[claim.umbrellaKey] = claim.requiredCredits;
        
        await bprndStudentsCollection.updateOne(
          { studentId: claim.studentId },
          { $set: updateData }
        );
        console.log(`   ✅ Updated existing student credit bank`);
      } else {
        // Create new student entry
        const newStudent = {
          studentId: claim.studentId,
          [claim.umbrellaKey]: claim.requiredCredits,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await bprndStudentsCollection.insertOne(newStudent);
        console.log(`   ✅ Created new student entry`);
      }
    }
    
    console.log(`\n🎉 Finished fixing ${claimsWithoutCourses.length} claims!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixMissingCourses();
