const mongoose = require('mongoose');
const bprnd_certification_claim = require('./model3/bprnd_certification_claim');

async function migrateClaimsToNewStructure() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sitaics');
    console.log('Connected to MongoDB');

    // Find all existing claims
    const claims = await bprnd_certification_claim.find({});
    console.log(`Found ${claims.length} claims to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const claim of claims) {
      // Check if already migrated
      if (claim.poc_approved !== undefined || claim.admin_approved !== undefined) {
        console.log(`⏭️  Claim ${claim._id} already migrated, skipping`);
        skippedCount++;
        continue;
      }

      // Migrate based on existing approval structure
      let poc_approved = false;
      let admin_approved = false;
      let poc_approved_at = null;
      let admin_approved_at = null;
      let poc_approved_by = null;
      let admin_approved_by = null;

      // Check POC approval
      if (claim.pocApproval && claim.pocApproval.decision === 'approved') {
        poc_approved = true;
        poc_approved_at = claim.pocApproval.at;
        poc_approved_by = claim.pocApproval.by;
      }

      // Check Admin approval
      if (claim.adminApproval && claim.adminApproval.decision === 'approved') {
        admin_approved = true;
        admin_approved_at = claim.adminApproval.at;
        admin_approved_by = claim.adminApproval.by;
      }

      // Update the claim with new fields
      await bprnd_certification_claim.findByIdAndUpdate(claim._id, {
        $set: {
          poc_approved,
          poc_approved_at,
          poc_approved_by,
          admin_approved,
          admin_approved_at,
          admin_approved_by
        }
      });

      console.log(`✅ Migrated claim ${claim._id}: POC=${poc_approved}, Admin=${admin_approved}`);
      migratedCount++;
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`  - Total claims: ${claims.length}`);
    console.log(`  - Migrated: ${migratedCount}`);
    console.log(`  - Skipped (already migrated): ${skippedCount}`);

    // Verify migration by checking a few claims
    console.log(`\n🔍 Verification - Sample claims:`);
    const sampleClaims = await bprnd_certification_claim.find({}).limit(3);
    sampleClaims.forEach((claim, index) => {
      console.log(`  Claim ${index + 1}:`);
      console.log(`    - POC approved: ${claim.poc_approved} (${claim.poc_approved_by || 'N/A'})`);
      console.log(`    - Admin approved: ${claim.admin_approved} (${claim.admin_approved_by || 'N/A'})`);
      console.log(`    - Status: ${claim.status}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('Error during migration:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

migrateClaimsToNewStructure();
