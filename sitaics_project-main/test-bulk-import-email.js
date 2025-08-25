const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🧪 Testing Bulk Import Email Functionality');
console.log('==========================================');

// Check environment variables
console.log('\n📧 Environment Variables:');
console.log('  EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'NOT SET');
console.log('  EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');

// Create transporter with same configuration as API
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'trinayan.1303@gmail.com',
    pass: process.env.EMAIL_PASS || 'bemx xvtq pqdd gteh',
  },
});

// Test email configuration
console.log('\n🔧 Testing Email Transporter...');

transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email transporter verification failed:', error);
    return;
  }
  
  console.log('✅ Email transporter verified successfully');
  
  // Simulate bulk import process
  console.log('\n📤 Simulating Bulk Import Email Sending...');
  
  // Test data - simulate what would come from Excel
  const testStudents = [
    {
      Name: 'Test Student 1',
      Email: process.env.EMAIL_USER || 'trinayan.1303@gmail.com', // Send to self for testing
      Designation: 'Student',
      State: 'Test State',
      Organization: 'Test Org',
      Umbrella: 'Cyber Security'
    },
    {
      Name: 'Test Student 2', 
      Email: process.env.EMAIL_USER || 'trinayan.1303@gmail.com', // Send to self for testing
      Designation: 'Student',
      State: 'Test State',
      Organization: 'Test Org',
      Umbrella: 'Cyber Security'
    }
  ];
  
  let emailsSent = 0;
  let emailsFailed = 0;
  
  // Send welcome emails to each student (simulating bulk import)
  testStudents.forEach(async (student, index) => {
    try {
      console.log(`\n📧 Sending welcome email to ${student.Name} (${student.Email})...`);
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'trinayan.1303@gmail.com',
        to: student.Email,
        subject: '🧪 Test - RRU Portal Login Credentials',
        html: `
          <h2>🧪 Test Email - Welcome to RRU Portal!</h2>
          <p>Hello ${student.Name},</p>
          <p>This is a TEST email to verify the bulk import email functionality.</p>
          <p>Your account would be created with:</p>
          <ul>
            <li><strong>Name:</strong> ${student.Name}</li>
            <li><strong>Email:</strong> ${student.Email}</li>
            <li><strong>Designation:</strong> ${student.Designation}</li>
            <li><strong>State:</strong> ${student.State}</li>
            <li><strong>Organization:</strong> ${student.Organization}</li>
            <li><strong>Umbrella:</strong> ${student.Umbrella}</li>
          </ul>
          <p><strong>Note:</strong> This is a test email. No actual account was created.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Test timestamp: ${new Date().toLocaleString()}<br>
            Email configuration: ${process.env.EMAIL_SERVICE || 'gmail'}
          </p>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent successfully to ${student.Name}!`);
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Response: ${info.response}`);
      emailsSent++;
      
    } catch (emailError) {
      console.error(`❌ Failed to send welcome email to ${student.Name}:`, emailError);
      emailsFailed++;
    }
  });
  
  // Wait a moment for all emails to process
  setTimeout(() => {
    console.log('\n📋 Test Summary:');
    console.log('================');
    console.log(`✅ Emails sent successfully: ${emailsSent}`);
    console.log(`❌ Emails failed: ${emailsFailed}`);
    console.log(`📊 Total test students: ${testStudents.length}`);
    
    if (emailsSent === testStudents.length) {
      console.log('\n🎉 All test emails sent successfully!');
      console.log('   The bulk import email functionality is working correctly.');
    } else {
      console.log('\n⚠️ Some emails failed to send.');
      console.log('   Check the error messages above for troubleshooting.');
    }
    
    // Close the transporter
    transporter.close();
  }, 3000);
});
