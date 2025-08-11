const fetch = require('node-fetch');

async function testBPRNDStudentAPI() {
  try {
    console.log('🔍 Testing BPRND Student Profile API...\n');
    
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3004/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check:', healthData.message);
    } else {
      console.log('❌ Health check failed');
      return;
    }
    
    // Test 2: Database connection
    console.log('\n2. Testing database connection...');
    const dbResponse = await fetch('http://localhost:3004/test-db');
    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      console.log('✅ Database connection:', dbData.message);
      console.log('📊 Students in database:', dbData.data.totalStudents);
      
      if (dbData.data.totalStudents === 0) {
        console.log('⚠️  No students found in database. Cannot test profile API.');
        return;
      }
    } else {
      console.log('❌ Database test failed');
      return;
    }
    
    // Test 3: Profile API with dummy ID (will fail but shows structure)
    console.log('\n3. Testing profile API structure...');
    const dummyId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
    const profileResponse = await fetch(`http://localhost:3004/student/${dummyId}`);
    const profileData = await profileResponse.json();
    
    if (profileResponse.status === 404) {
      console.log('✅ Profile API working (expected 404 for dummy ID)');
      console.log('📝 Response structure:', {
        success: profileData.success,
        message: profileData.message
      });
    } else if (profileResponse.ok) {
      console.log('✅ Profile API working - Student found!');
      console.log('👤 Student data:', {
        id: profileData.student._id,
        name: profileData.student.Name,
        email: profileData.student.email,
        designation: profileData.student.Designation,
        state: profileData.student.State,
        umbrella: profileData.student.Umbrella
      });
    } else {
      console.log('❌ Profile API error:', profileData.message);
    }
    
    // Test 4: Invalid ID format
    console.log('\n4. Testing invalid ID handling...');
    const invalidResponse = await fetch('http://localhost:3004/student/invalid-id');
    const invalidData = await invalidResponse.json();
    
    if (invalidResponse.status === 400) {
      console.log('✅ Invalid ID handling working');
      console.log('📝 Error message:', invalidData.message);
    } else {
      console.log('❌ Invalid ID handling failed');
    }
    
    console.log('\n🎉 API tests completed!');
    console.log('\n📋 API Endpoints Available:');
    console.log('   - GET /health - Health check');
    console.log('   - GET /test-db - Database test');
    console.log('   - POST /login - BPRND student login');
    console.log('   - GET /student/:id - Get student profile by ID');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure api4.js is running: PORT=3004 node api4.js');
  }
}

testBPRNDStudentAPI();
