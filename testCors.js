// Import fetch using dynamic import for Node.js compatibility
let fetch;

// Initialize fetch before using it
async function initFetch() {
  const nodeFetch = await import('node-fetch');
  fetch = nodeFetch.default;
}


async function testCorsConfig() {
  // Initialize fetch first
  await initFetch();
  
  try {
    // Get a token first
    console.log('Testing login...');
    const loginResponse = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8081'
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    });

    console.log('Login response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('Login error:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('Got token:', token ? 'Yes' : 'No');

    // Test fields endpoint with CORS headers
    console.log('\nTesting /api/fields endpoint with CORS headers...');
    const fieldsResponse = await fetch('http://localhost:3000/api/fields', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Origin': 'http://localhost:8081'
      }
    });

    console.log('Fields response status:', fieldsResponse.status);
    console.log('Fields response headers:', fieldsResponse.headers.raw());
    
    const fieldsData = await fieldsResponse.json();
    console.log('Fields data:', JSON.stringify(fieldsData, null, 2));

  } catch (error) {
    console.error('Error testing CORS:', error);
  }
}

testCorsConfig();