const mongoose = require('mongoose');
const xlsx = require('xlsx');
const FormData = require('form-data');

// Debug bulk import course history creation
async function debugBulkImportCourseHistory() {
  try {
    console.log('🐛 Debugging bulk import course history creation...');

    // Create test Excel file
    const testData = [
      {
        'Name': 'Debug Test User',
        'Email': `debug.test.${Date.now()}@example.com`,
        'Designation': 'Debug Officer',
        'State': 'Debug State',
        'Organization': 'Debug Organization',
        'Training_Topic': 'Debug Training Topic',
        'Theory_Hours': 10,
        'Practical_Hours': 5,
        'Total_Hours': 15,
        'Theory_Credits': 3,
        'Practical_Credits': 2,
        'Total_Credits': 5
      }
    ];

    // Create workbook and worksheet
    const worksheet = xlsx.utils.json_to_sheet(testData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');

    // Write to buffer
    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Create form data
    const formData = new FormData();
    formData.append('umbrella', 'Cyber Security');
    formData.append('excelFile', excelBuffer, {
      filename: 'debug-test.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    console.log('📤 Sending bulk import request...');

    // Send request to API
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:3003/api/bprnd/students/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log('📥 Bulk import response:', JSON.stringify(result, null, 2));

    if (result.success && result.data && result.data.created && result.data.created.length > 0) {
      console.log('✅ Student created successfully');
      
      // Wait a moment for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Now check if course history was created
      console.log('🔍 Checking for course history entries...');
      
      // Connect to MongoDB to check directly
      await mongoose.connect('mongodb://localhost:27017/sitaics', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const db = mongoose.connection.db;
      
      // Check for course history entries with the training topic
      const courseHistoryEntries = await db.collection('coursehistories').find({
        name: 'Debug Training Topic'
      }).toArray();
      
      console.log('🔍 Found course history entries:', courseHistoryEntries.length);
      if (courseHistoryEntries.length > 0) {
        console.log('✅ Course history entries found:', JSON.stringify(courseHistoryEntries, null, 2));
      } else {
        console.log('❌ No course history entries found with training topic "Debug Training Topic"');
        
        // Check recent entries to see what's there
        const recentEntries = await db.collection('coursehistories').find({}).sort({_id: -1}).limit(3).toArray();
        console.log('🔍 Recent course history entries:', JSON.stringify(recentEntries, null, 2));
      }

      await mongoose.connection.close();
    } else {
      console.log('❌ Bulk import failed or no students created');
    }

  } catch (error) {
    console.error('❌ Debug test failed:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

// Run the debug test
debugBulkImportCourseHistory();
