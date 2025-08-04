const fetch = require('node-fetch');

async function testPreviousCourses() {
  try {
    // First, login as a student to get a token
    console.log('🔐 Logging in as student...');
    const loginResponse = await fetch('http://localhost:3000/api/student/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'student@test.com',
        password: 'student123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      console.error('❌ Student login failed:', loginData.error);
      return;
    }

    const token = loginData.token;
    console.log('✅ Student login successful, token received');

    // Test data for previous courses
    const previousCoursesData = {
      previous_courses_certification: [
        {
          organization_name: "Coursera",
          course_name: "Machine Learning Specialization",
          certificate_pdf: "coursera_ml_certificate.pdf"
        },
        {
          organization_name: "edX",
          course_name: "Introduction to Computer Science",
          certificate_pdf: "edx_cs_certificate.pdf"
        },
        {
          organization_name: "Udemy",
          course_name: "Web Development Bootcamp",
          certificate_pdf: "udemy_webdev_certificate.pdf"
        }
      ]
    };

    // Now test the previous courses API
    console.log('📚 Testing previous courses API...');
    const previousCoursesResponse = await fetch('http://localhost:3000/api/students/previous-courses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(previousCoursesData)
    });

    const previousCoursesResult = await previousCoursesResponse.json();
    console.log('Previous courses response:', JSON.stringify(previousCoursesResult, null, 2));

    if (previousCoursesResult.success) {
      console.log(`✅ Successfully saved ${previousCoursesResult.data.previousCoursesCount} previous courses`);
      console.log('📋 Sample courses saved:');
      previousCoursesData.previous_courses_certification.forEach((course, index) => {
        console.log(`${index + 1}. ${course.course_name} - ${course.organization_name}`);
      });
    } else {
      console.error('❌ Failed to save previous courses:', previousCoursesResult.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPreviousCourses(); 