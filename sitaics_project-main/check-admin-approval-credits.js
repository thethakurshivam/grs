const mongoose = require('mongoose');

// Check how admin approval affects student umbrella credits
async function checkAdminApprovalCredits() {
  try {
    console.log('🔍 Checking admin approval credit assignment...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/sitaics', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Step 1: Check existing pending credits
    console.log('\n📋 Step 1: Checking pending credits status...');
    
    const allPendingCredits = await db.collection('pendingcredits').find({}).toArray();
    console.log(`📊 Total pending credits in database: ${allPendingCredits.length}`);
    
    const pocApproved = await db.collection('pendingcredits').find({
      bprnd_poc_approved: true,
      admin_approved: false
    }).toArray();
    console.log(`📊 POC approved, waiting for admin: ${pocApproved.length}`);
    
    const adminApproved = await db.collection('pendingcredits').find({
      bprnd_poc_approved: true,
      admin_approved: true
    }).toArray();
    console.log(`📊 Fully approved (both POC and admin): ${adminApproved.length}`);
    
    if (pocApproved.length > 0) {
      console.log('\n📋 Pending credits ready for admin approval:');
      pocApproved.slice(0, 3).forEach((pc, i) => {
        console.log(`  ${i+1}. Course: ${pc.courseName || 'N/A'}`);
        console.log(`     Discipline: ${pc.discipline || 'N/A'}`);
        console.log(`     Student ID: ${pc.studentId}`);
        console.log(`     Theory Hours: ${pc.theoryHours || 0}, Practical Hours: ${pc.practicalHours || 0}`);
        console.log(`     Expected Credits: Theory=${(pc.theoryHours || 0)/15}, Practical=${(pc.practicalHours || 0)/30}, Total=${((pc.theoryHours || 0)/15) + ((pc.practicalHours || 0)/30)}`);
        console.log(`     Status: ${pc.status || 'N/A'}`);
        console.log(`     ID: ${pc._id}`);
        console.log('');
      });
      
      console.log('💡 To test admin approval:');
      console.log('1. Note the student ID and current credits for one of the above');
      console.log('2. Use admin portal or API to approve the pending credit');
      console.log('3. Check if credits are added to specific umbrella field');
    }
    
    if (adminApproved.length > 0) {
      console.log('\n📋 Recently approved credits (showing first 3):');
      adminApproved.slice(0, 3).forEach((pc, i) => {
        console.log(`  ${i+1}. Course: ${pc.courseName || 'N/A'}`);
        console.log(`     Discipline: ${pc.discipline || 'N/A'}`);
        console.log(`     Student ID: ${pc.studentId}`);
        console.log(`     Theory Hours: ${pc.theoryHours || 0}, Practical Hours: ${pc.practicalHours || 0}`);
        console.log(`     Expected Credits: ${((pc.theoryHours || 0)/15) + ((pc.practicalHours || 0)/30)}`);
        console.log('');
      });
      
      // Let's check the student records for these approved credits
      console.log('\n🔍 Step 2: Checking student records for approved credits...');
      
      for (let i = 0; i < Math.min(3, adminApproved.length); i++) {
        const pc = adminApproved[i];
        const student = await db.collection('credit_calculations').findOne({ _id: pc.studentId });
        
        if (student) {
          console.log(`\n👤 Student: ${student.Name} (${student.email})`);
          console.log(`📊 Umbrella: ${student.Umbrella}`);
          console.log(`📊 Total Credits: ${student.Total_Credits}`);
          
          // Show umbrella-specific credits
          const umbrellaFields = [
            'Tourism_Police', 'Women_in_Security_and_Police', 'Traffic_Management_and_Road_Safety',
            'Border_Management', 'Disaster_Risk_Reduction', 'OSI_Model', 'Social_Media_Security',
            'Cyber_Threat_Intelligence', 'Cyber_Security', 'Cyber_Law', 'Forensics_Psychology',
            'Gender_Sensitisation', 'Behavioral_Sciences'
          ];
          
          console.log('📊 Umbrella-specific credits:');
          umbrellaFields.forEach(field => {
            if (student[field] !== undefined && student[field] > 0) {
              console.log(`   ${field}: ${student[field]}`);
            }
          });
          
          // Check if the discipline matches any umbrella field
          const expectedField = pc.discipline ? pc.discipline.replace(/\s+/g, '_') : null;
          if (expectedField && student[expectedField] !== undefined) {
            console.log(`🎯 Expected field "${expectedField}": ${student[expectedField]}`);
          } else {
            console.log(`⚠️ Could not find expected field for discipline: ${pc.discipline}`);
          }
          
        } else {
          console.log(`❌ Student not found for ID: ${pc.studentId}`);
        }
      }
    }
    
    // Step 3: Show summary
    console.log('\n📊 Summary:');
    console.log(`- Total pending credits: ${allPendingCredits.length}`);
    console.log(`- Ready for admin approval: ${pocApproved.length}`);
    console.log(`- Fully approved: ${adminApproved.length}`);
    
    if (pocApproved.length > 0) {
      console.log('\n🎯 Action needed: Admin approval for pending credits');
      console.log('📝 Check if approved credits are added to correct umbrella fields');
    } else if (adminApproved.length > 0) {
      console.log('\n✅ Recent approvals found - credits should be in umbrella fields');
    } else {
      console.log('\n💡 No pending credits found to test admin approval');
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Check completed');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

// Run the check
checkAdminApprovalCredits();
