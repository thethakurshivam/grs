const fetch = require('node-fetch');

async function testFieldsApi() {
  try {
    // Replace with a valid token from your browser's localStorage
    const token = 'YOUR_AUTH_TOKEN_HERE';
    
    console.log('Testing /api/fields endpoint with token...');
    
    const response = await fetch('http://localhost:3000/api/fields', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testFieldsApi();