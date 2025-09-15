const fetch = require('node-fetch');

async function testBPRNDLogin() {
  try {
    console.log('Testing BPRND Student Login API...');
    
    // Test health endpoint first
    const healthResponse = await fetch('http://localhost:3004/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check:', healthData);
    } else {
      console.log('❌ Health check failed');
      return;
    }
    
    // Test login endpoint with dummy data
    const loginResponse = await fetch('http://localhost:3004/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      }),
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginResponse.ok) {
      console.log('✅ Login endpoint is working');
      console.log('Student data structure:', Object.keys(loginData.student || {}));
    } else {
      console.log('ℹ️ Login failed (expected for dummy data):', loginData.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('Make sure api4.js is running on port 3004');
  }
}

testBPRNDLogin();
