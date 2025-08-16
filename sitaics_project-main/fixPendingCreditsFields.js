const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import the models
const PendingCredits = require('./model3/pendingcredits');

async function fixPendingCreditsFields() {
  try {
    console.log('🔧 Fixing Pending Credits Fields...\n');
    
    // Find all pending credits where bprnd_poc_approved is undefined
    const pendingCreditsToFix = await PendingCredits.find({
      $or: [
        { bprnd_poc_approved: { $exists: false } },
        { bprnd_poc_approved: undefined }
      ]
    });
    
    console.log(`📊 Found ${pendingCreditsToFix.length} pending credits that need fixing\n`);
    
    if (pendingCreditsToFix.length === 0) {
      console.log('✅ All pending credits already have proper fields!');
      return;
    }
    
    // Update all pending credits to have bprnd_poc_approved: false
    const updateResult = await PendingCredits.updateMany(
      {
        $or: [
          { bprnd_poc_approved: { $exists: false } },
          { bprnd_poc_approved: undefined }
        ]
      },
      {
        $set: {
          bprnd_poc_approved: false
        }
      }
    );
    
    console.log(`✅ Updated ${updateResult.modifiedCount} pending credits`);
    
    // Verify the fix
    const remainingUnfixed = await PendingCredits.find({
      $or: [
        { bprnd_poc_approved: { $exists: false } },
        { bprnd_poc_approved: undefined }
      ]
    });
    
    if (remainingUnfixed.length === 0) {
      console.log('✅ Verification: All pending credits now have proper fields!');
      
      // Show what admin and POC should now see
      const adminView = await PendingCredits.find({
        $or: [
          { admin_approved: false },
          { bprnd_poc_approved: false }
        ]
      });
      
      const pocView = await PendingCredits.find({
        admin_approved: true,
        bprnd_poc_approved: false
      });
      
      console.log(`\n📊 After Fix:`);
      console.log(`- Admin should see: ${adminView.length} pending credits`);
      console.log(`- BPRND POC should see: ${pocView.length} pending credits`);
      
    } else {
      console.log(`⚠️ Warning: ${remainingUnfixed.length} pending credits still need fixing`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing fields:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the fix
fixPendingCreditsFields();
