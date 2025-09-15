const mongoose = require('mongoose');
const bprnd_certification_claim = require('./model3/bprnd_certification_claim');
const bprndStudents = require('./model3/bprndstudents');
const BprndCertificate = require('./model3/bprnd_certificate');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testApprovalFlow() {
  try {
    console.log('🔍 Testing BPRND Certification Approval Flow...\n');

    // 1. Check what claims POC can see (pending claims)
    console.log('📋 Step 1: Claims POC can see (pending):');
    const pocClaims = await bprnd_certification_claim.find({
      poc_approved: { $ne: true },
      admin_approved: { $ne: true }
    }).lean();
    console.log(`   Found ${pocClaims.length} claims for POC approval`);
    pocClaims.forEach(claim => {
      console.log(`   - Claim ID: ${claim._id}`);
      console.log(`     Student: ${claim.studentId}`);
      console.log(`     Umbrella: ${claim.umbrellaKey}`);
      console.log(`     Status: ${claim.status}`);
      console.log(`     POC Approved: ${claim.poc_approved}`);
      console.log(`     Admin Approved: ${claim.admin_approved}\n`);
    });

    // 2. Check what claims Admin can see (POC approved, admin not approved)
    console.log('📋 Step 2: Claims Admin can see (POC approved):');
    const adminClaims = await bprnd_certification_claim.find({
      poc_approved: true,
      admin_approved: { $ne: true }
    }).lean();
    console.log(`   Found ${adminClaims.length} claims for Admin approval`);
    adminClaims.forEach(claim => {
      console.log(`   - Claim ID: ${claim._id}`);
      console.log(`     Student: ${claim.studentId}`);
      console.log(`     Umbrella: ${claim.umbrellaKey}`);
      console.log(`     Status: ${claim.status}`);
      console.log(`     POC Approved: ${claim.poc_approved}`);
      console.log(`     Admin Approved: ${claim.admin_approved}\n`);
    });

    // 3. Check approved claims (both POC and Admin approved)
    console.log('📋 Step 3: Approved claims (both POC and Admin):');
    const approvedClaims = await bprnd_certification_claim.find({
      poc_approved: true,
      admin_approved: true,
      status: 'approved'
    }).lean();
    console.log(`   Found ${approvedClaims.length} approved claims`);
    approvedClaims.forEach(claim => {
      console.log(`   - Claim ID: ${claim._id}`);
      console.log(`     Student: ${claim.studentId}`);
      console.log(`     Umbrella: ${claim.umbrellaKey}`);
      console.log(`     Status: ${claim.status}`);
      console.log(`     Finalized: ${claim.finalized_at}\n`);
    });

    // 4. Check certificates created
    console.log('📋 Step 4: Certificates created:');
    const certificates = await BprndCertificate.find({}).lean();
    console.log(`   Found ${certificates.length} certificates`);
    certificates.forEach(cert => {
      console.log(`   - Certificate ID: ${cert._id}`);
      console.log(`     Student: ${cert.studentId}`);
      console.log(`     Umbrella: ${cert.umbrellaKey}`);
      console.log(`     Qualification: ${cert.qualification}`);
      console.log(`     Certificate No: ${cert.certificateNo}`);
      console.log(`     Issued: ${cert.issuedAt}\n`);
    });

    console.log('✅ Approval flow test completed!');

  } catch (error) {
    console.error('❌ Error testing approval flow:', error);
  } finally {
    mongoose.connection.close();
  }
}

testApprovalFlow();
