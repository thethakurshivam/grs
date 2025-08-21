const mongoose = require('mongoose');
const BprndClaim = require('./model3/bprnd_certification_claim');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestClaim() {
  try {
    console.log('🔍 Creating Test Claim with Course Details...\n');

    // Create a test claim that the POC can see
    const testClaim = new BprndClaim({
      studentId: '68a06e29b24bd983a3e92d55', // aman's ID
      umbrellaKey: 'Criminology',
      qualification: 'diploma',
      requiredCredits: 30,
      status: 'pending',
      poc_approved: false,
      admin_approved: false,
      courses: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Advanced Criminology Course',
          organization: 'BPRND Institute',
          discipline: 'Criminology',
          theoryHours: 180,
          practicalHours: 120,
          theoryCredits: 6.0,
          practicalCredits: 8.0,
          totalHours: 300,
          creditsEarned: 14.0,
          noOfDays: 25,
          completionDate: new Date('2025-08-15'),
          courseId: new mongoose.Types.ObjectId()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Forensic Psychology Training',
          organization: 'Criminal Justice Academy',
          discipline: 'Criminology',
          theoryHours: 150,
          practicalHours: 90,
          theoryCredits: 5.0,
          practicalCredits: 6.0,
          totalHours: 240,
          creditsEarned: 11.0,
          noOfDays: 20,
          completionDate: new Date('2025-08-10'),
          courseId: new mongoose.Types.ObjectId()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Criminal Law Fundamentals',
          organization: 'Legal Studies Center',
          discipline: 'Criminology',
          theoryHours: 120,
          practicalHours: 60,
          theoryCredits: 4.0,
          practicalCredits: 4.0,
          totalHours: 180,
          creditsEarned: 8.0,
          noOfDays: 15,
          completionDate: new Date('2025-08-05'),
          courseId: new mongoose.Types.ObjectId()
        }
      ]
    });

    const savedClaim = await testClaim.save();
    console.log('✅ Test claim created successfully!');
    console.log(`Claim ID: ${savedClaim._id}`);
    console.log(`Umbrella: ${savedClaim.umbrellaKey}`);
    console.log(`Qualification: ${savedClaim.qualification}`);
    console.log(`Required Credits: ${savedClaim.requiredCredits}`);
    console.log(`Status: ${savedClaim.status}`);
    console.log(`Courses: ${savedClaim.courses.length}`);
    
    console.log('\n📋 Course Details:');
    savedClaim.courses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.name}`);
      console.log(`      Organization: ${course.organization}`);
      console.log(`      Theory: ${course.theoryHours}h = ${course.theoryCredits} cr`);
      console.log(`      Practical: ${course.practicalHours}h = ${course.practicalCredits} cr`);
      console.log(`      Total: ${course.totalHours}h = ${course.creditsEarned} cr`);
      console.log(`      Days: ${course.noOfDays}`);
      console.log(`      Completed: ${course.completionDate.toLocaleDateString()}`);
    });

    console.log('\n🎯 This claim should now be visible to the POC for approval!');

  } catch (error) {
    console.error('❌ Error creating test claim:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestClaim();
