const fetch = require('node-fetch');

async function testAdminClaims() {
  try {
    console.log('🔍 Testing Admin BPRND Claims Endpoint...\n');

    // Test the admin claims endpoint
    console.log('📋 Testing GET /api/bprnd/claims endpoint:');
    
    const response = await fetch('http://localhost:3002/api/bprnd/claims', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token-placeholder' // This will fail auth but we can see the response structure
      }
    });

    const data = await response.json();
    
    console.log(`📡 Response Status: ${response.status}`);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (data.success && data.data && data.data.length > 0) {
      console.log(`\n✅ Found ${data.data.length} claims`);
      
      data.data.forEach((claim, index) => {
        console.log(`\n📋 Claim ${index + 1}:`);
        console.log(`   ID: ${claim._id}`);
        console.log(`   Student: ${claim.studentId}`);
        console.log(`   Umbrella: ${claim.umbrellaKey}`);
        console.log(`   Qualification: ${claim.qualification}`);
        console.log(`   Required Credits: ${claim.requiredCredits}`);
        console.log(`   Status: ${claim.status}`);
        
        if (claim.courses && claim.courses.length > 0) {
          console.log(`   📚 Contributing Courses: ${claim.courses.length}`);
          claim.courses.forEach((course, courseIndex) => {
            console.log(`      ${courseIndex + 1}. ${course.name}`);
            console.log(`         Organization: ${course.organization}`);
            console.log(`         Theory: ${course.theoryHours || 'N/A'}h = ${(course.theoryCredits || 0).toFixed(2)} cr`);
            console.log(`         Practical: ${course.practicalHours || 'N/A'}h = ${(course.practicalCredits || 0).toFixed(2)} cr`);
            console.log(`         Total: ${course.totalHours || 'N/A'}h = ${course.creditsEarned} cr`);
            console.log(`         Days: ${course.noOfDays || 'N/A'}`);
            console.log(`         Completed: ${course.completionDate ? new Date(course.completionDate).toLocaleDateString() : 'N/A'}`);
          });
        } else {
          console.log('   ⚠️ No course details available');
        }
      });
    } else {
      console.log('❌ No claims found or API error:', data);
    }

  } catch (error) {
    console.error('❌ Error testing admin claims:', error);
  }
}

testAdminClaims();
