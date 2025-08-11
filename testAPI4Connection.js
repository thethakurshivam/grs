const fetch = require('node-fetch');

async function testAPI4Connection() {
  try {
    console.log('🔍 Testing api4.js database connection...\n');
    
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
      console.log('📊 Database info:', dbData.data);
    } else {
      const errorData = await dbResponse.json();
      console.log('❌ Database test failed:', errorData.message);
    }
    
    // Test 3: Login endpoint structure
    console.log('\n3. Testing login endpoint structure...');
    const loginResponse = await fetch('http://localhost:3004/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
    });
    
    const loginData = await loginResponse.json();
    if (loginResponse.status === 401) {
      console.log('✅ Login endpoint working (expected 401 for invalid credentials)');
    } else {
      console.log('ℹ️ Login response:', loginData);
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure api4.js is running: PORT=3004 node api4.js');
  }
}

testAPI4Connection();
