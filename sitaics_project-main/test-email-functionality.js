const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🧪 Testing Email Functionality for BPRND POC API');
console.log('================================================');

// Check environment variables
console.log('\n📧 Environment Variables Check:');
console.log('  EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'NOT SET (will use gmail)');
console.log('  EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET (will use default)');
console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET (will use default)');

// Create transporter with same configuration as API
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'trinayan.1303@gmail.com',
    pass: process.env.EMAIL_PASS || 'sfnw ucmk zunl zmra',
  },
});

// Test email configuration
console.log('\n🔧 Testing Email Transporter Configuration...');

transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email transporter verification failed:', error);
    console.log('\n💡 Troubleshooting Tips:');
    console.log('  1. Check if EMAIL_USER and EMAIL_PASS are set in .env.poc');
    console.log('  2. Verify the Gmail app password is correct');
    console.log('  3. Ensure 2FA is enabled on the Gmail account');
    console.log('  4. Check if Gmail allows "less secure app access"');
    return;
  }
  
  console.log('✅ Email transporter verified successfully');
  
  // Send test email
  console.log('\n📤 Sending Test Email...');
  
  const testMailOptions = {
    from: process.env.EMAIL_USER || 'trinayan.1303@gmail.com',
    to: process.env.EMAIL_USER || 'trinayan.1303@gmail.com', // Send to self for testing
    subject: '🧪 Test Email - BPRND POC API Email Functionality',
    html: `
      <h2>🧪 Test Email Success!</h2>
      <p>This is a test email to verify that the BPRND POC API email functionality is working correctly.</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Email Service:</strong> ${process.env.EMAIL_SERVICE || 'gmail'}</p>
      <p><strong>From:</strong> ${process.env.EMAIL_USER || 'trinayan.1303@gmail.com'}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        This email was sent automatically by the test script. 
        If you received this, the email functionality is working correctly.
      </p>
    `,
  };

  transporter.sendMail(testMailOptions, (error, info) => {
    if (error) {
      console.error('❌ Failed to send test email:', error);
      console.log('\n💡 Common Email Issues:');
      console.log('  1. Gmail app password expired or incorrect');
      console.log('  2. Gmail account security settings blocking the connection');
      console.log('  3. Network/firewall blocking SMTP connection');
      console.log('  4. Rate limiting from Gmail');
    } else {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
      console.log('📧 Response:', info.response);
      console.log('\n🎉 Email functionality is working correctly!');
      console.log('   The BPRND POC bulk import should now send welcome emails to students.');
    }
    
    // Close the transporter
    transporter.close();
  });
});
