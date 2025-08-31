const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

// Create a simple test Excel-like CSV file (we'll upload it as Excel)
const testCSVContent = `Name,Email,Designation,State,Organization,Training_Topic,Theory_Hours,Practical_Hours,Total_Hours,Theory_Credits,Practical_Credits,Total_Credits
Test Student,test.student@example.com,Test Officer,Test State,Test Organization,Test Training,1,1,2,1,1,2`;

// Write test file
fs.writeFileSync('test-student.csv', testCSVContent);

async function testBulkImport() {
  try {
    console.log('🧪 Testing BPRND Bulk Import with Email...\n');
    
    // Create form data
    const form = new FormData();
    form.append('excelFile', fs.createReadStream('test-student.csv'), {
      filename: 'test-student.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    form.append('umbrella', 'Border Management');
    
    console.log('📤 Sending bulk import request...');
    const response = await fetch('http://localhost:3003/api/bprnd/students/upload', {
      method: 'POST',
      body: form,
      headers: {
        'Authorization': 'Bearer test-token', // You might need a valid token
      }
    });
    
    console.log('📡 Response Status:', response.status);
    
    const result = await response.json();
    console.log('📊 Response Data:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Bulk import successful!');
      console.log('📧 Check console logs for email sending status');
    } else {
      console.log('❌ Bulk import failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync('test-student.csv')) {
      fs.unlinkSync('test-student.csv');
    }
  }
}

testBulkImport().then(() => {
  console.log('\n🏁 Bulk import test completed');
  process.exit(0);
});
