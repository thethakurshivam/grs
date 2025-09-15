const fetch = require('node-fetch');

// Replace with a valid token from your browser's localStorage
const token = 'YOUR_AUTH_TOKEN_HERE';

async function testFieldsApi() {
  try {
    const response = await fetch('http://localhost:3000/api/fields', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const status = response.status;
    console.log('Response status:', status);

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing fields API:', error);
  }
}

testFieldsApi();