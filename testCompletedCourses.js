const fetch = require('node-fetch');

async function testCompletedCourses() {
  try {
    // First, login to get a token
    console.log('🔐 Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.error);
      return;
    }

    const token = loginData.token;
    console.log('✅ Login successful, token received');

    // Now fetch completed courses
    console.log('📚 Fetching completed courses...');
    const coursesResponse = await fetch('http://localhost:3000/api/courses/completed', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const coursesData = await coursesResponse.json();
    console.log('Completed courses response:', JSON.stringify(coursesData, null, 2));

    if (coursesData.success) {
      console.log(`✅ Successfully fetched ${coursesData.count} completed courses`);
      console.log('📋 Courses:');
      coursesData.data.forEach((course, index) => {
        console.log(`${index + 1}. ${course.courseName} - ${course.organization}`);
      });
    } else {
      console.error('❌ Failed to fetch completed courses:', coursesData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompletedCourses(); 