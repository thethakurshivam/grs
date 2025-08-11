// Import node-fetch correctly
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testLogin() {
  try {
    // Login to get a token
    const loginResponse = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123',
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (loginResponse.ok) {
      const token = loginData.token;
      console.log('Auth token:', token);

      // Test fields API with the token
      const fieldsResponse = await fetch('http://localhost:3000/api/fields', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const fieldsData = await fieldsResponse.json();
      console.log('Fields response:', fieldsData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
console.log('Running testLogin.js');

testLogin();