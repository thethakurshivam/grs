const mongoose = require('mongoose');
const BprndClaim = require('./model3/bprnd_certification_claim');
const BprndCertificate = require('./model3/bprnd_certificate');

async function createCertificatesForStudent() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sitaics');
    console.log('Connected to MongoDB');

    const studentId = '68a06aecb24bd983a3e92d4f';
    
    // Find all admin-approved claims for this student
    const approvedClaims = await BprndClaim.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      status: 'admin_approved'
    });

    console.log(`Found ${approvedClaims.length} admin-approved claims for student ${studentId}`);

    for (const claim of approvedClaims) {
      // Check if certificate already exists for this claim
      const existingCertificate = await BprndCertificate.findOne({ claimId: claim._id });
      
      if (existingCertificate) {
        console.log(`✅ Certificate already exists for claim ${claim._id} (${claim.umbrellaKey} - ${claim.qualification})`);
        continue;
      }

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
        studentId: new mongoose.Types.ObjectId(studentId),
        umbrellaKey: claim.umbrellaKey,
        qualification: claim.qualification,
        claimId: claim._id,
        certificateNo: `rru_${claim.umbrellaKey}_${nextSequenceNumber}`,
        issuedAt: new Date()
      });

      await certificate.save();
      console.log(`✅ Created certificate for ${claim.umbrellaKey} - ${claim.qualification}`);
    }

    // Verify certificates were created
    const certificates = await BprndCertificate.find({ studentId: new mongoose.Types.ObjectId(studentId) });
    console.log(`\n📊 Total certificates for student ${studentId}: ${certificates.length}`);
    
    certificates.forEach(cert => {
      console.log(`  - ${cert.umbrellaKey}: ${cert.qualification} (${cert.certificateNo})`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Certificates created successfully!');

  } catch (error) {
    console.error('Error creating certificates:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

createCertificatesForStudent();
