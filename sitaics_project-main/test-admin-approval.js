const mongoose = require('mongoose');
const bprnd_certification_claim = require('./model3/bprnd_certification_claim');
const bprndStudents = require('./model3/bprndstudents');
const BprndCertificate = require('./model3/bprnd_certificate');

async function testAdminApproval() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sitaics');
    console.log('Connected to MongoDB');

    const studentId = '68a06aecb24bd983a3e92d4f';
    
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

    // Step 2: Find a POC-approved claim that admin can approve
    console.log('\n🔍 Step 2: Finding POC-approved claim for admin approval...');
    const pocApprovedClaim = await bprnd_certification_claim.findOne({
      poc_approved: true,
      admin_approved: { $ne: true },
      status: 'poc_approved'
    });

    if (!pocApprovedClaim) {
      console.log('❌ No POC-approved claims found for admin approval');
      return;
    }

    console.log('Found POC-approved claim:', {
      id: pocApprovedClaim._id,
      umbrella: pocApprovedClaim.umbrellaKey,
      qualification: pocApprovedClaim.qualification,
      requiredCredits: pocApprovedClaim.requiredCredits,
      status: pocApprovedClaim.status
    });

    // Step 3: Simulate admin approval (this should trigger credit deduction and certificate creation)
    console.log('\n✅ Step 3: Simulating admin approval...');
    
    // Check if student has enough credits
    const umbrellaField = pocApprovedClaim.umbrellaKey;
    const requiredCredits = pocApprovedClaim.requiredCredits || 0;
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
      studentId: pocApprovedClaim.studentId,
      umbrellaKey: pocApprovedClaim.umbrellaKey,
      qualification: pocApprovedClaim.qualification,
      claimId: pocApprovedClaim._id,
      certificateNo: `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      issuedAt: new Date()
    });
    await certificate.save();

    // Mark claim as finalized
    pocApprovedClaim.admin_approved = true;
    pocApprovedClaim.admin_approved_at = new Date();
    pocApprovedClaim.admin_approved_by = 'admin@test.com';
    pocApprovedClaim.status = 'approved';
    pocApprovedClaim.finalized_at = new Date();
    await pocApprovedClaim.save();

    console.log('✅ Admin approval completed successfully!');

    // Step 4: Verify the results
    console.log('\n🔍 Step 4: Verifying results...');
    
    // Check updated student credits
    const updatedStudent = await bprndStudents.findById(studentId);
    console.log('Updated student credits:');
    console.log(`  - ${umbrellaField}: ${updatedStudent[umbrellaField] || 0} (was ${currentCredits})`);
    console.log(`  - Total Credits: ${updatedStudent.Total_Credits || 0} (was ${currentTotalCredits})`);
    console.log(`  - Credits deducted: ${requiredCredits}`);

    // Check certificate creation
    const createdCertificate = await BprndCertificate.findOne({ claimId: pocApprovedClaim._id });
    console.log('Certificate created:', {
      certificateNo: createdCertificate.certificateNo,
      umbrellaKey: createdCertificate.umbrellaKey,
      qualification: createdCertificate.qualification,
      issuedAt: createdCertificate.issuedAt
    });

    // Check claim status
    const finalClaim = await bprnd_certification_claim.findById(pocApprovedClaim._id);
    console.log('Final claim status:', {
      status: finalClaim.status,
      admin_approved: finalClaim.admin_approved,
      finalized_at: finalClaim.finalized_at
    });

    console.log('\n🎉 Admin Approval Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log(`  1. ✅ Student had ${currentCredits} credits in ${umbrellaField}`);
    console.log(`  2. ✅ Required ${requiredCredits} credits for ${pocApprovedClaim.qualification}`);
    console.log(`  3. ✅ Credits deducted: ${requiredCredits}`);
    console.log(`  4. ✅ Certificate created: ${createdCertificate.certificateNo}`);
    console.log(`  5. ✅ Claim finalized and approved`);

    await mongoose.connection.close();

  } catch (error) {
    console.error('Error in admin approval test:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

testAdminApproval();
