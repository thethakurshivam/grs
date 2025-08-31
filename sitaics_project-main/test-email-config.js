const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🧪 Testing Email Configuration...\n');

// Configuration
console.log('📧 Email Settings:');
console.log('  SERVICE:', process.env.EMAIL_SERVICE || 'gmail');
console.log('  USER:', process.env.EMAIL_USER || 'trinayan.1303@gmail.com');
console.log('  PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
console.log('');

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'trinayan.1303@gmail.com',
    pass: process.env.EMAIL_PASS || 'OLD_PASSWORD_FALLBACK',
  },
});

async function testEmail() {
  try {
    console.log('🔍 Verifying transporter...');
    await transporter.verify();
    console.log('✅ Email transporter verification successful!');
    
    console.log('\n📤 Sending test email...');
    const testMailOptions = {
      from: process.env.EMAIL_USER || 'trinayan.1303@gmail.com',
      to: 'trinayan.1303@gmail.com', // Send to yourself for testing
      subject: 'BPRND Portal - Email Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email from the BPRND Portal bulk import system.</p>
        <p>If you receive this, the email configuration is working correctly!</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <p>Best regards,<br>BPRND Portal Team</p>
      `,
    };

    const result = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', result.messageId);
    console.log('📨 Response:', result.response);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    if (error.code) {
      console.error('🔐 Error Code:', error.code);
    }
    if (error.response) {
      console.error('📤 SMTP Response:', error.response);
    }
  }
}

testEmail().then(() => {
  console.log('\n🏁 Email test completed');
  process.exit(0);
});
