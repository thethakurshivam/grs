const mongoose = require('mongoose');
const bprnd_certification_claim = require('./model3/bprnd_certification_claim');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixClaimsData() {
  try {
    console.log('🔧 Fixing BPRND Certification Claims Data...\n');

    // Fix claims with status 'admin_approved' but admin_approved field is undefined/false
    const result = await bprnd_certification_claim.updateMany(
      { 
        status: 'admin_approved',
        $or: [
          { admin_approved: { $exists: false } },
          { admin_approved: false },
          { admin_approved: null }
        ]
      },
      { 
        $set: { 
          admin_approved: true,
          admin_approved_at: new Date(),
          admin_approved_by: 'system-fix'
        }
      }
    );

    console.log(`✅ Fixed ${result.modifiedCount} claims with inconsistent admin_approved field\n`);

    // Check the current state after fix
    const allClaims = await bprnd_certification_claim.find({}).lean();
    
    const pocClaims = allClaims.filter(claim => 
      !claim.poc_approved && !claim.admin_approved
    );
    console.log(`👁️ POC should now see: ${pocClaims.length} claims`);

    const adminClaims = allClaims.filter(claim => 
      claim.poc_approved && !claim.admin_approved
    );
    console.log(`👁️ Admin should now see: ${adminClaims.length} claims`);

    const approvedClaims = allClaims.filter(claim => 
      claim.poc_approved && claim.admin_approved && claim.status === 'approved'
    );
    console.log(`✅ Approved claims: ${approvedClaims.length}`);

    console.log('\n🎉 Claims data fixed!');

  } catch (error) {
    console.error('❌ Error fixing claims data:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixClaimsData();
