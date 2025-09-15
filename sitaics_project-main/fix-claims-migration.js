const mongoose = require('mongoose');
const bprnd_certification_claim = require('./model3/bprnd_certification_claim');

async function fixClaimsMigration() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sitaics');
    console.log('Connected to MongoDB');

    // Find all claims that need fixing
    const claims = await bprnd_certification_claim.find({});
    console.log(`Found ${claims.length} claims to check`);

    let fixedCount = 0;
    let alreadyCorrectCount = 0;

    for (const claim of claims) {
      // Check if the new fields are correctly set
      let needsUpdate = false;
      let updateData = {};

      // Check POC approval
      if (claim.pocApproval && claim.pocApproval.decision === 'approved') {
        if (!claim.poc_approved) {
          updateData.poc_approved = true;
          updateData.poc_approved_at = claim.pocApproval.at;
          updateData.poc_approved_by = claim.pocApproval.by;
          needsUpdate = true;
        }
      }

      // Check Admin approval
      if (claim.adminApproval && claim.adminApproval.decision === 'approved') {
        if (!claim.admin_approved) {
          updateData.admin_approved = true;
          updateData.admin_approved_at = claim.adminApproval.at;
          updateData.admin_approved_by = claim.adminApproval.by;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await bprnd_certification_claim.findByIdAndUpdate(claim._id, {
          $set: updateData
        });
        console.log(`✅ Fixed claim ${claim._id}: ${JSON.stringify(updateData)}`);
        fixedCount++;
      } else {
        alreadyCorrectCount++;
      }
    }

    console.log(`\n📊 Fix Summary:`);
    console.log(`  - Total claims: ${claims.length}`);
    console.log(`  - Fixed: ${fixedCount}`);
    console.log(`  - Already correct: ${alreadyCorrectCount}`);

    // Verify the fix
    console.log(`\n🔍 Verification - Sample claims:`);
    const sampleClaims = await bprnd_certification_claim.find({}).limit(3);
    sampleClaims.forEach((claim, index) => {
      console.log(`  Claim ${index + 1} (${claim.umbrellaKey} - ${claim.qualification}):`);
      console.log(`    - POC approved: ${claim.poc_approved} (${claim.poc_approved_by || 'N/A'})`);
      console.log(`    - Admin approved: ${claim.admin_approved} (${claim.admin_approved_by || 'N/A'})`);
      console.log(`    - Status: ${claim.status}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Claims migration fixed successfully!');

  } catch (error) {
    console.error('Error fixing claims migration:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

fixClaimsMigration();
