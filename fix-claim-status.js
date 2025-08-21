const mongoose = require('mongoose');
const bprnd_certification_claim = require('./model3/bprnd_certification_claim');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixClaimStatus() {
  try {
    console.log('🔧 Fixing Claim Status...\n');

    // Find claims that are admin_approved but should be approved
    const claimsToFix = await bprnd_certification_claim.find({
      status: 'admin_approved',
      poc_approved: true,
      admin_approved: true
    });

    console.log(`📊 Found ${claimsToFix.length} claims that need status fix\n`);

    for (const claim of claimsToFix) {
      console.log(`🔧 Fixing claim ${claim._id}:`);
      console.log(`   Umbrella: ${claim.umbrellaKey}`);
      console.log(`   Qualification: ${claim.qualification}`);
      console.log(`   Old Status: ${claim.status}`);
      
      // Update status to approved
      claim.status = 'approved';
      claim.finalized_at = new Date();
      await claim.save();
      
      console.log(`   ✅ New Status: ${claim.status}`);
      console.log('');
    }

    console.log('🎉 All claims fixed!');

  } catch (error) {
    console.error('❌ Error fixing claim status:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixClaimStatus();
