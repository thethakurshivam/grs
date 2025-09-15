const mongoose = require('mongoose');
const bprnd_certification_claim = require('./model3/bprnd_certification_claim');
const bprndStudents = require('./model3/bprndstudents');
const BprndCertificate = require('./model3/bprnd_certificate');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixCertificateCreation() {
  try {
    console.log('🔧 Fixing Certificate Creation...\n');

    // Find the specific claim
    const claim = await bprnd_certification_claim.findOne({ 
      studentId: '68a06e29b24bd983a3e92d55', 
      umbrellaKey: 'Criminology',
      status: 'approved'
    });

    if (!claim) {
      console.log('❌ No approved claim found');
      return;
    }

    console.log(`📋 Processing claim: ${claim._id}`);
    console.log(`   Umbrella: ${claim.umbrellaKey}`);
    console.log(`   Qualification: ${claim.qualification}`);
    console.log(`   Required Credits: ${claim.requiredCredits}`);

    // Check if certificate already exists
    const existingCertificate = await BprndCertificate.findOne({ claimId: claim._id });
    if (existingCertificate) {
      console.log('✅ Certificate already exists');
      return;
    }

    // Get student details
    const student = await bprndStudents.findById(claim.studentId);
    if (!student) {
      console.log('❌ Student not found');
      return;
    }

    console.log(`👤 Student: ${student.Name}`);
    console.log(`   Current ${claim.umbrellaKey} credits: ${student[claim.umbrellaKey]}`);
    console.log(`   Current Total credits: ${student.Total_Credits}`);

    const umbrellaField = claim.umbrellaKey;
    const requiredCredits = claim.requiredCredits || 0;
    const currentCredits = Number(student[umbrellaField] || 0);
    const currentTotalCredits = Number(student.Total_Credits || 0);

    if (currentCredits < requiredCredits) {
      console.log(`❌ Insufficient credits. Required: ${requiredCredits}, Available: ${currentCredits}`);
      return;
    }

    // Deduct credits
    student[umbrellaField] = Math.max(0, currentCredits - requiredCredits);
    student.Total_Credits = Math.max(0, currentTotalCredits - requiredCredits);
    await student.save();

    console.log(`💰 Credits deducted:`);
    console.log(`   ${claim.umbrellaKey}: ${currentCredits} → ${student[umbrellaField]}`);
    console.log(`   Total: ${currentTotalCredits} → ${student.Total_Credits}`);

    // Find the last certificate for this umbrella to get the next sequence number
    const lastCertificate = await BprndCertificate.findOne(
      { umbrellaKey: claim.umbrellaKey }, 
      {}, 
      { sort: { 'certificateNo': -1 } }
    );
    
    let nextSequenceNumber = 1;
    if (lastCertificate && lastCertificate.certificateNo) {
      const idParts = lastCertificate.certificateNo.split('_');
      if (idParts.length >= 3) {
        const lastNumber = parseInt(idParts[2]);
        if (!isNaN(lastNumber)) {
          nextSequenceNumber = lastNumber + 1;
        }
      }
    }

    // Create certificate
    const certificate = new BprndCertificate({
      studentId: claim.studentId,
      umbrellaKey: claim.umbrellaKey,
      qualification: claim.qualification,
      claimId: claim._id,
      certificateNo: `rru_${claim.umbrellaKey}_${nextSequenceNumber}`,
      issuedAt: new Date()
    });
    await certificate.save();

    console.log(`🎓 Certificate created:`);
    console.log(`   Certificate No: ${certificate.certificateNo}`);
    console.log(`   Qualification: ${certificate.qualification}`);
    console.log(`   Issued: ${certificate.issuedAt}`);

    console.log('\n🎉 Certificate creation and credit deduction completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixCertificateCreation();
