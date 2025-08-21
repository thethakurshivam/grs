const fetch = require('node-fetch');

async function testCourseHistory() {
  try {
    console.log('🔍 Testing Course History API for Detailed Credit Information...\n');

    // Test the course history endpoint
    const studentId = '68a06e29b24bd983a3e92d55'; // aman's ID
    const umbrella = 'Defence';
    
    console.log(`📋 Testing /student/${studentId}/course-history/${umbrella} endpoint:`);
    
    const response = await fetch(`http://localhost:3004/student/${studentId}/course-history/${umbrella}`);
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log(`✅ Found ${data.data.courses.length} courses for ${umbrella}`);
      console.log('\n📊 Summary:');
      console.log(`   Total Courses: ${data.data.summary.totalCourses}`);
      console.log(`   Total Credits: ${data.data.summary.totalCredits}`);
      console.log(`   Total Theory Credits: ${data.data.summary.totalTheoryCredits || 'N/A'}`);
      console.log(`   Total Practical Credits: ${data.data.summary.totalPracticalCredits || 'N/A'}`);
      console.log(`   Total Hours: ${data.data.summary.totalHours}`);
      console.log(`   Total Days: ${data.data.summary.totalDays}`);
      
      if (data.data.courses.length > 0) {
        console.log('\n📋 Course Details:');
        data.data.courses.forEach((course, index) => {
          console.log(`   ${index + 1}. ${course.name}`);
          console.log(`      Organization: ${course.organization}`);
          console.log(`      Theory Hours: ${course.theoryHours || 'N/A'}h = ${(course.theoryCredits || 0).toFixed(2)} credits`);
          console.log(`      Practical Hours: ${course.practicalHours || 'N/A'}h = ${(course.practicalCredits || 0).toFixed(2)} credits`);
          console.log(`      Total Hours: ${course.totalHours}h`);
          console.log(`      Credits Earned: ${course.creditsEarned} credits`);
          console.log(`      Days: ${course.noOfDays}`);
          console.log(`      Completed: ${new Date(course.createdAt).toLocaleDateString()}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ Error fetching course history:', data);
    }

  } catch (error) {
    console.error('❌ Error testing course history:', error);
  }
}

testCourseHistory();
