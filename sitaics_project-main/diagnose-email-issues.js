const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🔍 Email Configuration Diagnostic Tool');
console.log('=====================================');

// Check all possible email configurations
console.log('\n📧 Current Configuration:');
console.log('  EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'NOT SET');
console.log('  EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');

// Test different Gmail configurations
const testConfigs = [
  {
    name: 'Current .env.poc config',
    config: {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'trinayan.1303@gmail.com',
        pass: process.env.EMAIL_PASS || 'sfnw ucmk zunl zmra'
      }
    }
  },
  {
    name: 'Alternative Gmail config (less secure)',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'trinayan.1303@gmail.com',
        pass: process.env.EMAIL_PASS || 'sfnw ucmk zunl zmra'
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'Gmail with OAuth2 (if available)',
    config: {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'trinayan.1303@gmail.com',
        pass: process.env.EMAIL_PASS || 'sfnw ucmk zunl zmra'
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  }
];

async function testConfig(configName, config) {
  console.log(`\n🧪 Testing: ${configName}`);
  console.log('  Config:', JSON.stringify(config, null, 2));
  
  try {
    const transporter = nodemailer.createTransport(config);
    
    // Test connection
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.log(`  ❌ Connection failed: ${error.message}`);
          if (error.code === 'EAUTH') {
            console.log('    🔐 Authentication failed - Check username/password');
          } else if (error.code === 'ECONNECTION') {
            console.log('    🌐 Connection failed - Check network/firewall');
          }
          reject(error);
        } else {
          console.log('  ✅ Connection successful!');
          resolve();
        }
      });
    });
    
    // If connection successful, try to send test email
    console.log('  📤 Attempting to send test email...');
    
    const testMailOptions = {
      from: config.auth.user,
      to: config.auth.user, // Send to self
      subject: '🧪 Test Email - Configuration Working',
      text: `This is a test email from ${configName} at ${new Date().toLocaleString()}`
    };
    
    const info = await transporter.sendMail(testMailOptions);
    console.log('  ✅ Test email sent successfully!');
    console.log('    Message ID:', info.messageId);
    
    transporter.close();
    return true;
    
  } catch (error) {
    console.log(`  ❌ Test failed: ${error.message}`);
    return false;
  }
}

async function runDiagnostics() {
  console.log('\n🚀 Running email configuration diagnostics...\n');
  
  let workingConfig = null;
  
  for (const config of testConfigs) {
    try {
      const success = await testConfig(config.name, config.config);
      if (success) {
        workingConfig = config;
        break;
      }
    } catch (error) {
      console.log(`  ❌ ${config.name} failed: ${error.message}`);
    }
  }
  
  console.log('\n📋 Diagnostic Summary:');
  console.log('=======================');
  
  if (workingConfig) {
    console.log('✅ Working configuration found:', workingConfig.name);
    console.log('🎉 Email functionality should work with this configuration');
  } else {
    console.log('❌ No working configuration found');
    console.log('\n💡 Troubleshooting Steps:');
    console.log('1. Generate a new Gmail App Password:');
    console.log('   - Go to Google Account Settings > Security');
    console.log('   - Enable 2-Step Verification if not already enabled');
    console.log('   - Generate App Password for "Mail"');
    console.log('   - Use the new 16-character password');
    console.log('\n2. Check Gmail account settings:');
    console.log('   - Ensure 2FA is enabled');
    console.log('   - Check if account is not suspended');
    console.log('   - Verify no security alerts');
    console.log('\n3. Update .env.poc with new credentials:');
    console.log('   EMAIL_PASS=your_new_app_password');
  }
  
  console.log('\n🔧 Next Steps:');
  if (workingConfig) {
    console.log('1. Use the working configuration in api3.js');
    console.log('2. Restart the BPRND POC API');
    console.log('3. Test bulk import email functionality');
  } else {
    console.log('1. Fix Gmail authentication issues');
    console.log('2. Update email credentials');
    console.log('3. Re-run this diagnostic');
  }
}

// Run diagnostics
runDiagnostics().catch(console.error);
