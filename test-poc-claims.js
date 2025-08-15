#!/usr/bin/env node

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import the BprndClaim model
const BprndClaim = require('./sitaics_project-main/model3/bprnd_certification_claim');

async function testClaimFiltering() {
  try {
    console.log('Testing BPR&D Claim Filtering...\n');
    
    // Fetch all claims
    const allClaims = await BprndClaim.find({}).sort({ createdAt: -1 });
    console.log(`Total claims in database: ${allClaims.length}`);
    
    // Filter claims that POC should see (pending or admin_approved)
    const pocVisibleClaims = allClaims.filter(claim => 
      claim.status === 'pending' || claim.status === 'admin_approved'
    );
    console.log(`Claims POC should see: ${pocVisibleClaims.length}`);
    
    // Show breakdown by status
    const statusCounts = {};
    allClaims.forEach(claim => {
      statusCounts[claim.status] = (statusCounts[claim.status] || 0) + 1;
    });
    
    console.log('\nBreakdown by status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
    console.log('\nClaims POC should see:');
    pocVisibleClaims.forEach(claim => {
      console.log(`  ${claim._id}: ${claim.umbrellaKey} - ${claim.qualification} (${claim.status})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testClaimFiltering();
