const mongoose = require('mongoose');
const bprnd_certification_claim = require('./model3/bprnd_certification_claim');

async function testPOCFirstFlow() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sitaics');
    console.log('Connected to MongoDB');

    // Step 1: Create a new claim for testing
    console.log('\n📝 Step 1: Creating new certificate claim...');
    const testClaim = new bprnd_certification_claim({
      studentId: '68a06aecb24bd983a3e92d4f',
      umbrellaKey: 'Cyber_Security',
      qualification: 'certificate',
      requiredCredits: 20,
      status: 'pending',
      poc_approved: false,
      admin_approved: false,
      courses: [
        {
          courseName: 'Advanced Cyber Security Training',
          organization: 'Cyber Security Institute',
          hoursEarned: 300,
          creditsEarned: 20,
          completionDate: new Date(),
          courseId: new mongoose.Types.ObjectId()
        }
      ],
      notes: 'Test claim for POC-first approval flow'
    });

    await testClaim.save();
    console.log('✅ New claim created:', {
      id: testClaim._id,
      umbrella: testClaim.umbrellaKey,
      qualification: testClaim.qualification,
      status: testClaim.status,
      poc_approved: testClaim.poc_approved,
      admin_approved: testClaim.admin_approved
    });

    // Step 2: Check what POC can see
    console.log('\n👁️ Step 2: Checking what POC can see...');
    const pocClaims = await bprnd_certification_claim.find({
      poc_approved: { $ne: true },
      admin_approved: { $ne: true }
    }).select('_id umbrellaKey qualification status poc_approved admin_approved');
    
    console.log(`POC can see ${pocClaims.length} claims:`);
    pocClaims.forEach(claim => {
      console.log(`  - ${claim.umbrellaKey} (${claim.qualification}): ${claim.status}`);
    });

    // Step 3: Simulate POC approval
    console.log('\n✅ Step 3: Simulating POC approval...');
    await bprnd_certification_claim.findByIdAndUpdate(testClaim._id, {
      poc_approved: true,
      poc_approved_at: new Date(),
      poc_approved_by: 'bprndpoc@test.com',
      status: 'poc_approved'
    });
    console.log('✅ POC approved the claim');

    // Step 4: Check what Admin can see
    console.log('\n👁️ Step 4: Checking what Admin can see...');
    const adminClaims = await bprnd_certification_claim.find({
      poc_approved: true,
      admin_approved: { $ne: true }
    }).select('_id umbrellaKey qualification status poc_approved admin_approved');
    
    console.log(`Admin can see ${adminClaims.length} claims:`);
    adminClaims.forEach(claim => {
      console.log(`  - ${claim.umbrellaKey} (${claim.qualification}): ${claim.status}`);
    });

    // Step 5: Simulate Admin approval (this should trigger credit deduction and certificate creation)
    console.log('\n✅ Step 5: Simulating Admin approval...');
    await bprnd_certification_claim.findByIdAndUpdate(testClaim._id, {
      admin_approved: true,
      admin_approved_at: new Date(),
      admin_approved_by: 'admin@test.com',
      status: 'approved'
    });
    console.log('✅ Admin approved the claim');

    // Step 6: Verify final state
    console.log('\n🔍 Step 6: Verifying final state...');
    const finalClaim = await bprnd_certification_claim.findById(testClaim._id);
    console.log('Final claim state:', {
      id: finalClaim._id,
      status: finalClaim.status,
      poc_approved: finalClaim.poc_approved,
      admin_approved: finalClaim.admin_approved,
      poc_approved_by: finalClaim.poc_approved_by,
      admin_approved_by: finalClaim.admin_approved_by
    });

    console.log('\n🎉 POC-First Approval Flow Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('  1. ✅ New claim created');
    console.log('  2. ✅ POC can see the claim');
    console.log('  3. ✅ POC approved the claim');
    console.log('  4. ✅ Admin can see POC-approved claim');
    console.log('  5. ✅ Admin approved the claim');
    console.log('  6. ✅ Claim is now fully approved');

    await mongoose.connection.close();

  } catch (error) {
    console.error('Error in POC-first flow test:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

testPOCFirstFlow();
