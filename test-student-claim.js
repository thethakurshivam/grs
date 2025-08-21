const mongoose = require('mongoose');
const bprnd_certification_claim = require('./model3/bprnd_certification_claim');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testStudentClaim() {
  try {
    console.log('🔍 Testing Student Claim Status...\n');

    // Get the most recent claim
    const latestClaim = await bprnd_certification_claim.findOne({}).sort({ createdAt: -1 }).lean();
    
    if (!latestClaim) {
      console.log('❌ No claims found in database');
      return;
    }

    console.log('📋 Latest Claim Details:');
    console.log(`   ID: ${latestClaim._id}`);
    console.log(`   Student: ${latestClaim.studentId}`);
    console.log(`   Umbrella: ${latestClaim.umbrellaKey}`);
    console.log(`   Qualification: ${latestClaim.qualification}`);
    console.log(`   Status: ${latestClaim.status}`);
    console.log(`   POC Approved: ${latestClaim.poc_approved}`);
    console.log(`   Admin Approved: ${latestClaim.admin_approved}`);
    console.log(`   Created: ${latestClaim.createdAt}`);
    console.log(`   Updated: ${latestClaim.updatedAt}`);
    console.log('');

    // Test the approval logic
    console.log('🔍 Testing Approval Logic:');
    const bothApproved = latestClaim.admin_approved === true && latestClaim.poc_approved === true;
    console.log(`   Both approved (new system): ${bothApproved}`);
    
    const oldBothApproved = latestClaim.adminApproval?.decision === 'approved' && latestClaim.pocApproval?.decision === 'approved';
    console.log(`   Both approved (old system): ${oldBothApproved}`);
    
    console.log(`   Should be finalized: ${bothApproved}`);
    console.log('');

    // Check what the student should see
    console.log('👁️ Student Portal Status:');
    if (bothApproved && latestClaim.status === 'approved') {
      console.log('   ✅ Should show as APPROVED');
    } else if (bothApproved && latestClaim.status !== 'approved') {
      console.log('   ⚠️ Both approved but status not updated - needs finalization');
    } else if (latestClaim.poc_approved && !latestClaim.admin_approved) {
      console.log('   🔄 Should show as PENDING (waiting for admin)');
    } else if (!latestClaim.poc_approved) {
      console.log('   🔄 Should show as PENDING (waiting for POC)');
    }

  } catch (error) {
    console.error('❌ Error testing student claim:', error);
  } finally {
    mongoose.connection.close();
  }
}

testStudentClaim();
