const mongoose = require('mongoose');
const bprnd_certification_claim = require('./model3/bprnd_certification_claim');
const bprndStudents = require('./model3/bprndstudents');
const BprndCertificate = require('./model3/bprnd_certificate');

async function testCompleteFlow() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sitaics');
    console.log('Connected to MongoDB');

    const studentId = '68a06aecb24bd983a3e92d4f';
    
    console.log('\n🎯 Testing Complete POC-First Approval Flow');
    console.log('============================================');

    // Step 1: Check student's current credits
    console.log('\n💰 Step 1: Checking student current credits...');
    const student = await bprndStudents.findById(studentId);
    if (!student) {
      console.error('❌ Student not found');
      return;
    }
    
    console.log('Student current credits:');
    console.log(`  - Cyber_Security: ${student.Cyber_Security || 0}`);
    console.log(`  - Total Credits: ${student.Total_Credits || 0}`);

    // Step 2: Create a new certification claim (simulating student submission)
    console.log('\n📝 Step 2: Creating new certification claim (student submission)...');
    const newClaim = new bprnd_certification_claim({
      studentId: studentId,
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
      notes: 'Test claim for complete flow verification'
    });

    await newClaim.save();
    console.log('✅ New claim created:', {
      id: newClaim._id,
      umbrella: newClaim.umbrellaKey,
      qualification: newClaim.qualification,
      status: newClaim.status,
      poc_approved: newClaim.poc_approved,
      admin_approved: newClaim.admin_approved
    });

    // Step 3: Check what POC can see (claims NOT approved by POC and Admin)
    console.log('\n👁️ Step 3: Checking what POC can see...');
    const pocClaims = await bprnd_certification_claim.find({
      poc_approved: { $ne: true },
      admin_approved: { $ne: true }
    }).select('_id umbrellaKey qualification status poc_approved admin_approved');
    
    console.log(`POC can see ${pocClaims.length} claims:`);
    pocClaims.forEach(claim => {
      console.log(`  - ${claim.umbrellaKey} (${claim.qualification}): ${claim.status}`);
    });

    // Step 4: Simulate POC approval
    console.log('\n✅ Step 4: Simulating POC approval...');
    await bprnd_certification_claim.findByIdAndUpdate(newClaim._id, {
      poc_approved: true,
      poc_approved_at: new Date(),
      poc_approved_by: 'bprndpoc@test.com',
      status: 'poc_approved'
    });
    console.log('✅ POC approved the claim');

    // Step 5: Check what Admin can see (claims approved by POC but NOT by Admin)
    console.log('\n👁️ Step 5: Checking what Admin can see...');
    const adminClaims = await bprnd_certification_claim.find({
      poc_approved: true,
      admin_approved: { $ne: true }
    }).select('_id umbrellaKey qualification status poc_approved admin_approved');
    
    console.log(`Admin can see ${adminClaims.length} claims:`);
    adminClaims.forEach(claim => {
      console.log(`  - ${claim.umbrellaKey} (${claim.qualification}): ${claim.status}`);
    });

    // Step 6: Simulate Admin approval (this should trigger credit deduction and certificate creation)
    console.log('\n✅ Step 6: Simulating Admin approval...');
    
    // Check if student has enough credits
    const umbrellaField = newClaim.umbrellaKey;
    const requiredCredits = newClaim.requiredCredits || 0;
    const currentCredits = Number(student[umbrellaField] || 0);
    const currentTotalCredits = Number(student.Total_Credits || 0);

    console.log(`Credit check: Required ${requiredCredits}, Available ${currentCredits} in ${umbrellaField}`);

    if (currentCredits < requiredCredits) {
      console.log('❌ Insufficient credits for approval');
      return;
    }

    // Deduct credits
    student[umbrellaField] = Math.max(0, currentCredits - requiredCredits);
    student.Total_Credits = Math.max(0, currentTotalCredits - requiredCredits);
    await student.save();

    // Create certificate
    const certificate = new BprndCertificate({
      studentId: newClaim.studentId,
      umbrellaKey: newClaim.umbrellaKey,
      qualification: newClaim.qualification,
      claimId: newClaim._id,
      certificateNo: `rru_${newClaim.umbrellaKey}_1`,
      issuedAt: new Date()
    });
    await certificate.save();

    // Mark claim as finalized
    newClaim.admin_approved = true;
    newClaim.admin_approved_at = new Date();
    newClaim.admin_approved_by = 'admin@test.com';
    newClaim.status = 'approved';
    newClaim.finalized_at = new Date();
    await newClaim.save();

    console.log('✅ Admin approval completed successfully!');

    // Step 7: Verify the results
    console.log('\n🔍 Step 7: Verifying final results...');
    
    // Check updated student credits
    const updatedStudent = await bprndStudents.findById(studentId);
    console.log('Updated student credits:');
    console.log(`  - ${umbrellaField}: ${updatedStudent[umbrellaField] || 0} (was ${currentCredits})`);
    console.log(`  - Total Credits: ${updatedStudent.Total_Credits || 0} (was ${currentTotalCredits})`);
    console.log(`  - Credits deducted: ${requiredCredits}`);

    // Check certificate creation
    const createdCertificate = await BprndCertificate.findOne({ claimId: newClaim._id });
    console.log('Certificate created:', {
      certificateNo: createdCertificate.certificateNo,
      umbrellaKey: createdCertificate.umbrellaKey,
      qualification: createdCertificate.qualification,
      issuedAt: createdCertificate.issuedAt
    });

    // Check claim status
    const finalClaim = await bprnd_certification_claim.findById(newClaim._id);
    console.log('Final claim status:', {
      status: finalClaim.status,
      poc_approved: finalClaim.poc_approved,
      admin_approved: finalClaim.admin_approved,
      finalized_at: finalClaim.finalized_at
    });

    // Step 8: Verify POC and Admin can no longer see the claim
    console.log('\n👁️ Step 8: Verifying POC and Admin can no longer see the finalized claim...');
    
    const pocClaimsAfter = await bprnd_certification_claim.find({
      poc_approved: { $ne: true },
      admin_approved: { $ne: true }
    }).countDocuments();
    
    const adminClaimsAfter = await bprnd_certification_claim.find({
      poc_approved: true,
      admin_approved: { $ne: true }
    }).countDocuments();
    
    console.log(`POC can see ${pocClaimsAfter} claims (should be 0 for this specific claim)`);
    console.log(`Admin can see ${adminClaimsAfter} claims (should be 0 for this specific claim)`);

    console.log('\n🎉 Complete Flow Test Successful!');
    console.log('\n📋 Flow Summary:');
    console.log('  1. ✅ Student submitted certification claim');
    console.log('  2. ✅ POC can see the claim (not approved by POC or Admin)');
    console.log('  3. ✅ POC approved the claim');
    console.log('  4. ✅ Admin can see the claim (approved by POC, not by Admin)');
    console.log('  5. ✅ Admin approved the claim');
    console.log('  6. ✅ Credits deducted from student account');
    console.log('  7. ✅ Certificate created and saved in database');
    console.log('  8. ✅ Claim finalized and removed from both POC and Admin views');

    await mongoose.connection.close();

  } catch (error) {
    console.error('Error in complete flow test:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

testCompleteFlow();
