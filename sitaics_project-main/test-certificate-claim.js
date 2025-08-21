const fetch = require('node-fetch');

async function testCertificateClaim() {
  try {
    console.log('🔍 Testing Certificate Claim Endpoint...\n');

    const studentId = '68a06e29b24bd983a3e92d55'; // aman's ID
    const requestBody = {
      umbrellaKey: 'Defence',
      qualification: 'certificate'
    };

    console.log(`📋 Testing POST /student/${studentId}/certifications/request`);
    console.log('Request Body:', requestBody);

    const response = await fetch(`http://localhost:3004/student/${studentId}/certifications/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    console.log(`\n📡 Response Status: ${response.status}`);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Certificate claim created successfully!');
      console.log(`Claim ID: ${data.data._id}`);
      console.log(`Status: ${data.data.status}`);
      console.log(`Required Credits: ${data.data.requiredCredits}`);
      console.log(`Contributing Courses: ${data.data.courses.length}`);
      
      if (data.data.courses.length > 0) {
        console.log('\n📋 Contributing Course Details:');
        data.data.courses.forEach((course, index) => {
          console.log(`   ${index + 1}. ${course.name}`);
          console.log(`      Organization: ${course.organization}`);
          console.log(`      Theory: ${course.theoryHours}h = ${course.theoryCredits} cr`);
          console.log(`      Practical: ${course.practicalHours}h = ${course.practicalCredits} cr`);
          console.log(`      Total: ${course.totalHours}h = ${course.creditsEarned} cr`);
        });
      }
    } else {
      console.log('\n❌ Certificate claim failed:');
      console.log(`Error: ${data.message}`);
    }

  } catch (error) {
    console.error('❌ Error testing certificate claim:', error);
  }
}

testCertificateClaim();
