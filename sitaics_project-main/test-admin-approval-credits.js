const mongoose = require('mongoose');
const PendingCredits = require('./model3/pendingcredits');

// Test admin approval credit assignment to specific umbrella fields
async function testAdminApprovalCredits() {
  try {
    console.log('🧪 Testing admin approval credit assignment...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/sitaics', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Step 1: Check if there are any pending credits available for testing
    console.log('\n🔍 Step 1: Checking for pending credits...');
    const pendingCredits = await PendingCredits.find({
      bprnd_poc_approved: true,
      admin_approved: false
    }).limit(3);
    
    console.log(`📊 Found ${pendingCredits.length} pending credits ready for admin approval`);
    
    if (pendingCredits.length === 0) {
      console.log('📝 No pending credits found. Creating a test pending credit...');
      
      // Create a test student first
      const testStudent = {
        Name: `Admin Test Student ${Date.now()}`,
        email: `admin.test.${Date.now()}@example.com`,
        password: 'password123',
        Designation: 'Test Officer',
        State: 'Test State',
        Organization: 'Test Organization',
        Umbrella: 'Border Management',
        Training_Topic: 'Test Admin Approval Training',
        Per_session_minutes: 0,
        Theory_sessions: 0,
        Practical_sessions: 0,
        Theory_Hours: 60,  // Should give 2 theory credits (60/30)
        Practical_Hours: 30, // Should give 2 practical credits (30/15)
        Total_Hours: 90,
        Theory_Credits: 2,
        Practical_Credits: 2,
        Total_Credits: 4,
        date_of_birth: new Date('1990-01-01'),
        // Initialize all umbrella fields to 0
        Tourism_Police: 0,
        Women_in_Security_and_Police: 0,
        Traffic_Management_and_Road_Safety: 0,
        Border_Management: 0,
        Disaster_Risk_Reduction: 0,
        OSI_Model: 0,
        Social_Media_Security: 0,
        Cyber_Threat_Intelligence: 0,
        Cyber_Security: 0,
        Cyber_Law: 0,
        Forensics_Psychology: 0,
        Gender_Sensitisation: 0,
        Behavioral_Sciences: 0,
      };
      
      const insertResult = await db.collection('credit_calculations').insertOne(testStudent);
      const studentId = insertResult.insertedId;
      console.log(`✅ Test student created with ID: ${studentId}`);
      
      // Create a pending credit for this student
      const testPendingCredit = new PendingCredits({
        studentId: studentId,
        courseName: 'Test Admin Approval Course',
        organization: 'Test Organization',
        discipline: 'Border Management', // This should map to Border_Management field
        theoryHours: 60,
        practicalHours: 30,
        totalHours: 90,
        noOfDays: 5,
        count: 0,
        bprnd_poc_approved: true,
        admin_approved: false,
        status: 'poc_approved'
      });
      
      await testPendingCredit.save();
      console.log(`✅ Test pending credit created: ${testPendingCredit._id}`);
      
      // Step 2: Check student's current credits
      console.log('\n🔍 Step 2: Checking student\'s current credits...');
      const student = await db.collection('credit_calculations').findOne({ _id: studentId });
      console.log('📊 Current student credits:');
      console.log(`  - Total_Credits: ${student.Total_Credits}`);
      console.log(`  - Border_Management: ${student.Border_Management}`);
      console.log(`  - Tourism_Police: ${student.Tourism_Police}`);
      console.log(`  - Cyber_Security: ${student.Cyber_Security}`);
      
      // Step 3: Simulate admin approval via API call
      console.log('\n🔍 Step 3: Simulating admin approval...');
      const fetch = require('node-fetch');
      
      // First, we need to get an admin token (you'll need to implement this based on your auth)
      // For now, let's make the API call without token to see what happens
      const approvalResponse = await fetch(`http://localhost:3003/api/pending-credits/${testPendingCredit._id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Note: In real scenario, you'd add Authorization: Bearer <token>
        }
      });
      
      const approvalResult = await approvalResponse.json();
      console.log('📥 Approval API response:', approvalResult);
      
      if (approvalResponse.ok) {
        // Step 4: Check updated student credits
        console.log('\n🔍 Step 4: Checking updated student credits...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for async operations
        
        const updatedStudent = await db.collection('credit_calculations').findOne({ _id: studentId });
        console.log('📊 Updated student credits:');
        console.log(`  - Total_Credits: ${updatedStudent.Total_Credits} (was ${student.Total_Credits})`);
        console.log(`  - Border_Management: ${updatedStudent.Border_Management} (was ${student.Border_Management})`);
        console.log(`  - Tourism_Police: ${updatedStudent.Tourism_Police} (was ${student.Tourism_Police})`);
        console.log(`  - Cyber_Security: ${updatedStudent.Cyber_Security} (was ${student.Cyber_Security})`);
        
        // Calculate expected credits: Theory (60/15=4) + Practical (30/30=1) = 5 total
        const expectedCredits = (60/15) + (30/30); // Should be 5 (4 theory + 1 practical)
        const creditIncrease = updatedStudent.Total_Credits - student.Total_Credits;
        const borderMgmtIncrease = updatedStudent.Border_Management - student.Border_Management;
        
        console.log('\n📊 Analysis:');
        console.log(`  - Expected credits to be added: ${expectedCredits}`);
        console.log(`  - Actual Total_Credits increase: ${creditIncrease}`);
        console.log(`  - Border_Management field increase: ${borderMgmtIncrease}`);
        
        if (creditIncrease === expectedCredits && borderMgmtIncrease === expectedCredits) {
          console.log('✅ SUCCESS: Credits correctly assigned to both Total_Credits and Border_Management!');
        } else {
          console.log('❌ ISSUE: Credits not assigned correctly');
          console.log(`   Expected both increases to be ${expectedCredits}`);
          console.log(`   Got Total_Credits increase: ${creditIncrease}, Border_Management increase: ${borderMgmtIncrease}`);
        }
        
        // Check course history creation
        console.log('\n🔍 Step 5: Checking course history creation...');
        const CourseHistory = require('./model3/course_history');
        const courseHistory = await CourseHistory.findOne({
          studentId: studentId,
          discipline: 'Border Management'
        }).sort({ createdAt: -1 });
        
        if (courseHistory) {
          console.log('✅ Course history created:', {
            name: courseHistory.name,
            discipline: courseHistory.discipline,
            creditsEarned: courseHistory.creditsEarned,
            organization: courseHistory.organization
          });
        } else {
          console.log('❌ Course history NOT created');
        }
        
      } else {
        console.log('❌ API call failed:', approvalResult);
      }
      
      // Clean up test data
      console.log('\n🧹 Cleaning up test data...');
      await db.collection('credit_calculations').deleteOne({ _id: studentId });
      await PendingCredits.findByIdAndDelete(testPendingCredit._id);
      if (courseHistory) {
        await CourseHistory.findByIdAndDelete(courseHistory._id);
      }
      console.log('✅ Test data cleaned up');
      
    } else {
      console.log('\n📋 Available pending credits for testing:');
      pendingCredits.forEach((pc, i) => {
        console.log(`  ${i+1}. ${pc.courseName} (${pc.discipline}) - Student: ${pc.studentId}`);
        console.log(`     Theory: ${pc.theoryHours}h, Practical: ${pc.practicalHours}h`);
      });
      
      console.log('\n💡 To test admin approval:');
      console.log('1. Use the admin frontend to approve one of these pending credits');
      console.log('2. Check if credits are added to the specific umbrella field');
      console.log('3. Or use the API directly with proper authentication');
    }
    
    await mongoose.connection.close();
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

// Run the test
testAdminApprovalCredits();
