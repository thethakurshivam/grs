const mongoose = require('mongoose');
const bprnd_certification_claim = require('./model3/bprnd_certification_claim');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkClaims() {
  try {
    console.log('🔍 Checking BPRND Certification Claims in Database...\n');

    // Get all claims
    const allClaims = await bprnd_certification_claim.find({}).lean();
    console.log(`📊 Total claims in database: ${allClaims.length}\n`);

    if (allClaims.length === 0) {
      console.log('❌ No certification claims found in database!');
      console.log('💡 Students need to claim certificates first.');
      return;
    }

    // Check claims by status
    allClaims.forEach((claim, index) => {
      console.log(`📋 Claim ${index + 1}:`);
      console.log(`   ID: ${claim._id}`);
      console.log(`   Student: ${claim.studentId}`);
      console.log(`   Umbrella: ${claim.umbrellaKey}`);
      console.log(`   Qualification: ${claim.qualification}`);
      console.log(`   Status: ${claim.status}`);
      console.log(`   POC Approved: ${claim.poc_approved}`);
      console.log(`   Admin Approved: ${claim.admin_approved}`);
      console.log(`   Created: ${claim.createdAt}`);
      console.log(`   Courses: ${claim.courses ? claim.courses.length : 0}`);
      console.log('');
    });

    // Check what POC should see
    const pocClaims = allClaims.filter(claim => 
      !claim.poc_approved && !claim.admin_approved
    );
    console.log(`👁️ POC should see: ${pocClaims.length} claims`);

    // Check what Admin should see
    const adminClaims = allClaims.filter(claim => 
      claim.poc_approved && !claim.admin_approved
    );
    console.log(`👁️ Admin should see: ${adminClaims.length} claims`);

    // Check approved claims
    const approvedClaims = allClaims.filter(claim => 
      claim.poc_approved && claim.admin_approved && claim.status === 'approved'
    );
    console.log(`✅ Approved claims: ${approvedClaims.length}`);

  } catch (error) {
    console.error('❌ Error checking claims:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkClaims();
