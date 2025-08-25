const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Import the models
const BprndCertificate = require('./model3/bprnd_certificate');
const CreditCalculation = require('./model3/bprndstudents');

async function testCertificateIDGeneration() {
  try {
    console.log('🧪 Testing Certificate Custom ID Generation...\n');
    
    // First, let's create a test student to reference
    console.log('👤 Creating test student for certificate reference...');
    const testStudent = new CreditCalculation({
      Name: 'Test Student',
      Designation: 'Police Officer',
      State: 'Delhi',
      Training_Topic: 'Cyber Security',
      Per_session_minutes: 60,
      Theory_sessions: 10,
      Practical_sessions: 5,
      Theory_Hours: 10,
      Practical_Hours: 5,
      Total_Hours: 15,
      Theory_Credits: 10,
      Practical_Credits: 5,
      Total_Credits: 15,
      date_of_birth: new Date('1990-01-01'),
      email: 'test.student@example.com',
      Umbrella: 'Cyber Security',
      Cyber_Security: 25.5,
      Criminology: 0,
      Military_Law: 0,
      Police_Administration: 0,
      Defence: 0,
      Forensics: 0
    });
    
    const savedStudent = await testStudent.save();
    console.log('✅ Test student created with ID:', savedStudent._id);
    console.log('');
    
    // Test 1: Create first certificate in Cyber Security
    console.log('📝 Test 1: Creating first certificate in Cyber Security...');
    const certificate1 = new BprndCertificate({
      studentId: savedStudent._id,
      umbrellaKey: 'Cyber Security',
      qualification: 'certificate',
      claimId: new mongoose.Types.ObjectId(), // Mock claim ID
      certificateNo: 'CERT001',
      pdfUrl: '/uploads/cert1.pdf'
    });
    
    const savedCert1 = await certificate1.save();
    console.log('✅ Certificate 1 saved successfully!');
    console.log('🆔 MongoDB _id:', savedCert1._id);
    console.log('🆔 Custom ID:', savedCert1.customId);
    console.log('🌂 Umbrella:', savedCert1.umbrellaKey);
    console.log('📅 Issued at:', savedCert1.issuedAt);
    console.log('');
    
    // Test 2: Create second certificate in Cyber Security
    console.log('📝 Test 2: Creating second certificate in Cyber Security...');
    const certificate2 = new BprndCertificate({
      studentId: savedStudent._id,
      umbrellaKey: 'Cyber Security',
      qualification: 'diploma',
      claimId: new mongoose.Types.ObjectId(), // Mock claim ID
      certificateNo: 'DIPL001',
      pdfUrl: '/uploads/cert2.pdf'
    });
    
    const savedCert2 = await certificate2.save();
    console.log('✅ Certificate 2 saved successfully!');
    console.log('🆔 MongoDB _id:', savedCert2._id);
    console.log('🆔 Custom ID:', savedCert2.customId);
    console.log('🌂 Umbrella:', savedCert2.umbrellaKey);
    console.log('📅 Issued at:', savedCert2.issuedAt);
    console.log('');
    
    // Test 3: Create third certificate in Cyber Security
    console.log('📝 Test 3: Creating third certificate in Cyber Security...');
    const certificate3 = new BprndCertificate({
      studentId: savedStudent._id,
      umbrellaKey: 'Cyber Security',
      qualification: 'pg diploma',
      claimId: new mongoose.Types.ObjectId(), // Mock claim ID
      certificateNo: 'PGDIP001',
      pdfUrl: '/uploads/cert3.pdf'
    });
    
    const savedCert3 = await certificate3.save();
    console.log('✅ Certificate 3 saved successfully!');
    console.log('🆔 MongoDB _id:', savedCert3._id);
    console.log('🆔 Custom ID:', savedCert3.customId);
    console.log('🌂 Umbrella:', savedCert3.umbrellaKey);
    console.log('📅 Issued at:', savedCert3.issuedAt);
    console.log('');
    
    // Test 4: Create first certificate in Criminology
    console.log('📝 Test 4: Creating first certificate in Criminology...');
    const certificate4 = new BprndCertificate({
      studentId: savedStudent._id,
      umbrellaKey: 'Criminology',
      qualification: 'certificate',
      claimId: new mongoose.Types.ObjectId(), // Mock claim ID
      certificateNo: 'CERT002',
      pdfUrl: '/uploads/cert4.pdf'
    });
    
    const savedCert4 = await certificate4.save();
    console.log('✅ Certificate 4 saved successfully!');
    console.log('🆔 MongoDB _id:', savedCert4._id);
    console.log('🆔 Custom ID:', savedCert4.customId);
    console.log('🌂 Umbrella:', savedCert4.umbrellaKey);
    console.log('📅 Issued at:', savedCert4.issuedAt);
    console.log('');
    
    // Test 5: Create second certificate in Criminology
    console.log('📝 Test 5: Creating second certificate in Criminology...');
    const certificate5 = new BprndCertificate({
      studentId: savedStudent._id,
      umbrellaKey: 'Criminology',
      qualification: 'diploma',
      claimId: new mongoose.Types.ObjectId(), // Mock claim ID
      certificateNo: 'DIPL002',
      pdfUrl: '/uploads/cert5.pdf'
    });
    
    const savedCert5 = await certificate5.save();
    console.log('✅ Certificate 5 saved successfully!');
    console.log('🆔 MongoDB _id:', savedCert5._id);
    console.log('🆔 Custom ID:', savedCert5.customId);
    console.log('🌂 Umbrella:', savedCert5.umbrellaKey);
    console.log('📅 Issued at:', savedCert5.issuedAt);
    console.log('');
    
    // Test 6: Create first certificate in Military Law
    console.log('📝 Test 6: Creating first certificate in Military Law...');
    const certificate6 = new BprndCertificate({
      studentId: savedStudent._id,
      umbrellaKey: 'Military Law',
      qualification: 'certificate',
      claimId: new mongoose.Types.ObjectId(), // Mock claim ID
      certificateNo: 'CERT003',
      pdfUrl: '/uploads/cert6.pdf'
    });
    
    const savedCert6 = await certificate6.save();
    console.log('✅ Certificate 6 saved successfully!');
    console.log('🆔 MongoDB _id:', savedCert6._id);
    console.log('🆔 Custom ID:', savedCert6.customId);
    console.log('🌂 Umbrella:', savedCert6.umbrellaKey);
    console.log('📅 Issued at:', savedCert6.issuedAt);
    console.log('');
    
    // Test 7: Create certificate with special characters in umbrella
    console.log('📝 Test 7: Creating certificate with special characters in umbrella...');
    const certificate7 = new BprndCertificate({
      studentId: savedStudent._id,
      umbrellaKey: 'Police Administration & Management!@#',
      qualification: 'certificate',
      claimId: new mongoose.Types.ObjectId(), // Mock claim ID
      certificateNo: 'CERT004',
      pdfUrl: '/uploads/cert7.pdf'
    });
    
    const savedCert7 = await certificate7.save();
    console.log('✅ Certificate 7 saved successfully!');
    console.log('🆔 MongoDB _id:', savedCert7._id);
    console.log('🆔 Custom ID:', savedCert7.customId);
    console.log('🌂 Umbrella:', savedCert7.umbrellaKey);
    console.log('📅 Issued at:', savedCert7.issuedAt);
    console.log('');
    
    // Display all generated IDs
    console.log('📊 Summary of Generated Certificate IDs:');
    console.log('==========================================');
    console.log(`1. Cyber Security Certificate:`);
    console.log(`   MongoDB _id: ${savedCert1._id}`);
    console.log(`   Custom ID: ${savedCert1.customId}`);
    console.log(`2. Cyber Security Diploma:`);
    console.log(`   MongoDB _id: ${savedCert2._id}`);
    console.log(`   Custom ID: ${savedCert2.customId}`);
    console.log(`3. Cyber Security PG Diploma:`);
    console.log(`   MongoDB _id: ${savedCert3._id}`);
    console.log(`   Custom ID: ${savedCert3.customId}`);
    console.log(`4. Criminology Certificate:`);
    console.log(`   MongoDB _id: ${savedCert4._id}`);
    console.log(`   Custom ID: ${savedCert4.customId}`);
    console.log(`5. Criminology Diploma:`);
    console.log(`   MongoDB _id: ${savedCert5._id}`);
    console.log(`   Custom ID: ${savedCert5.customId}`);
    console.log(`6. Military Law Certificate:`);
    console.log(`   MongoDB _id: ${savedCert6._id}`);
    console.log(`   Custom ID: ${savedCert6.customId}`);
    console.log(`7. Police Administration Certificate:`);
    console.log(`   MongoDB _id: ${savedCert7._id}`);
    console.log(`   Custom ID: ${savedCert7.customId}`);
    console.log('');
    
    // Test 8: Verify ID format and sequence
    console.log('🔍 ID Format and Sequence Verification:');
    console.log('========================================');
    
    const allCertificates = [
      { cert: savedCert1, desc: 'Cyber Security Certificate' },
      { cert: savedCert2, desc: 'Cyber Security Diploma' },
      { cert: savedCert3, desc: 'Cyber Security PG Diploma' },
      { cert: savedCert4, desc: 'Criminology Certificate' },
      { cert: savedCert5, desc: 'Criminology Diploma' },
      { cert: savedCert6, desc: 'Military Law Certificate' },
      { cert: savedCert7, desc: 'Police Administration Certificate' }
    ];
    
    // Group by umbrella and verify sequence
    const umbrellaGroups = {};
    allCertificates.forEach(certInfo => {
      const umbrella = certInfo.cert.umbrellaKey;
      if (!umbrellaGroups[umbrella]) {
        umbrellaGroups[umbrella] = [];
      }
      umbrellaGroups[umbrella].push(certInfo);
    });
    
    Object.keys(umbrellaGroups).forEach(umbrella => {
      console.log(`\n🌂 Umbrella: ${umbrella}`);
      console.log('─'.repeat(umbrella.length + 10));
      
      umbrellaGroups[umbrella].forEach((certInfo, index) => {
        const mongoId = certInfo.cert._id;
        const customId = certInfo.cert.customId;
        
        console.log(`${index + 1}. ${certInfo.desc}`);
        console.log(`   MongoDB _id: ${mongoId}`);
        console.log(`   Custom ID: ${customId}`);
        
        // Check if it has a custom ID
        if (customId && typeof customId === 'string' && customId.startsWith('rru_')) {
          const parts = customId.split('_');
          console.log(`   Prefix: ${parts[0]}`);
          console.log(`   Umbrella: ${parts[1]}`);
          console.log(`   Sequence: ${parts[2]}`);
          
          // Validate format
          const isValidFormat = parts.length === 3 && 
                               parts[0] === 'rru' &&
                               !isNaN(parseInt(parts[2]));
          
          console.log(`   ✅ Custom ID format valid: ${isValidFormat}`);
        } else {
          console.log(`   ❌ No custom ID generated (using legacy format)`);
        }
      });
    });
    
    console.log('\n🎉 Certificate custom ID generation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testCertificateIDGeneration();
