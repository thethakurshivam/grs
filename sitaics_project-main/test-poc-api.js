const fetch = require('node-fetch');

async function testPOCAPI() {
  try {
    console.log('🔍 Testing POC API for Detailed Credit Information...\n');

    // Test the main POC pending credits endpoint
    console.log('📋 Testing /api/bprnd/pending-credits endpoint:');
    const response1 = await fetch('http://localhost:3003/api/bprnd/pending-credits');
    const data1 = await response1.json();
    
    if (data1.success && data1.data && data1.data.length > 0) {
      console.log(`✅ Found ${data1.data.length} pending credits`);
      const sampleCredit = data1.data[0];
      console.log('📊 Sample credit data:');
      console.log(`   ID: ${sampleCredit.id}`);
      console.log(`   Student: ${sampleCredit.name}`);
      console.log(`   Discipline: ${sampleCredit.discipline}`);
      console.log(`   Theory Hours: ${sampleCredit.theoryHours || 'N/A'}`);
      console.log(`   Practical Hours: ${sampleCredit.practicalHours || 'N/A'}`);
      console.log(`   Theory Credits: ${sampleCredit.theoryCredits || 'N/A'}`);
      console.log(`   Practical Credits: ${sampleCredit.practicalCredits || 'N/A'}`);
      console.log(`   Total Hours: ${sampleCredit.totalHours || 'N/A'}`);
      console.log(`   Calculated Credits: ${sampleCredit.calculatedCredits || 'N/A'}`);
    } else {
      console.log('⚠️ No pending credits found or API error');
      console.log('Response:', data1);
    }

    // Test the student-specific endpoint if there are any pending credits
    if (data1.success && data1.data && data1.data.length > 0) {
      const studentId = data1.data[0].studentId;
      console.log(`\n📋 Testing /api/bprnd/pending-credits/student/${studentId} endpoint:`);
      
      const response2 = await fetch(`http://localhost:3003/api/bprnd/pending-credits/student/${studentId}`);
      const data2 = await response2.json();
      
      if (data2.success && data2.data && data2.data.length > 0) {
        console.log(`✅ Found ${data2.data.length} pending credits for student`);
        const sampleCredit = data2.data[0];
        console.log('📊 Sample credit data from student endpoint:');
        console.log(`   ID: ${sampleCredit.id}`);
        console.log(`   Student: ${sampleCredit.name}`);
        console.log(`   Discipline: ${sampleCredit.discipline}`);
        console.log(`   Theory Hours: ${sampleCredit.theoryHours || 'N/A'}`);
        console.log(`   Practical Hours: ${sampleCredit.practicalHours || 'N/A'}`);
        console.log(`   Theory Credits: ${sampleCredit.theoryCredits || 'N/A'}`);
        console.log(`   Practical Credits: ${sampleCredit.practicalCredits || 'N/A'}`);
        console.log(`   Total Hours: ${sampleCredit.totalHours || 'N/A'}`);
        console.log(`   Calculated Credits: ${sampleCredit.calculatedCredits || 'N/A'}`);
      } else {
        console.log('⚠️ No pending credits found for student or API error');
        console.log('Response:', data2);
      }
    }

    // Test the count endpoint
    console.log('\n📋 Testing /api/bprnd/pending-credits/count endpoint:');
    const response3 = await fetch('http://localhost:3003/api/bprnd/pending-credits/count');
    const data3 = await response3.json();
    
    if (data3.success) {
      console.log(`✅ Pending credits count: ${data3.data.pendingCount}`);
    } else {
      console.log('❌ Error getting count:', data3);
    }

  } catch (error) {
    console.error('❌ Error testing POC API:', error);
  }
}

testPOCAPI();
