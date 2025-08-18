const mongoose = require('mongoose');
const bprnd_certification_claim = require('./model3/bprnd_certification_claim');

async function createTestClaim() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sitaics');
    console.log('Connected to MongoDB');

    // Create a test claim that POC can approve
    const testClaim = new bprnd_certification_claim({
      studentId: '68a06aecb24bd983a3e92d4f', // Use existing student
      umbrellaKey: 'Cyber_Security',
      qualification: 'certificate',
      requiredCredits: 20,
      status: 'pending',
      poc_approved: false,
      admin_approved: false,
      courses: [
        {
          courseName: 'Test Cyber Security Course',
          organization: 'Test Institute',
          hoursEarned: 300,
          creditsEarned: 20,
          completionDate: new Date(),
          courseId: new mongoose.Types.ObjectId()
        }
      ],
      notes: 'Test claim for POC-first approval flow'
    });

    await testClaim.save();
    console.log('✅ Test claim created successfully:', {
      id: testClaim._id,
      umbrella: testClaim.umbrellaKey,
      qualification: testClaim.qualification,
      status: testClaim.status,
      poc_approved: testClaim.poc_approved,
      admin_approved: testClaim.admin_approved
    });

    await mongoose.connection.close();
    console.log('\n🎯 Now POC can approve this claim, then Admin will see it!');

  } catch (error) {
    console.error('Error creating test claim:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

createTestClaim();
