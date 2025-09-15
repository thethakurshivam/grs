const mongoose = require('mongoose');

const BprndCertificateSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CreditCalculation', required: true },
  umbrellaKey: { type: String, required: true },
  qualification: { type: String, enum: ['certificate', 'diploma', 'pg diploma'], required: true },
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'bprnd_certification_claims', required: true },
  certificateNo: { type: String },
  pdfUrl: { type: String },
  customId: { type: String, unique: true }, // Custom ID field
}, { timestamps: { createdAt: 'issuedAt', updatedAt: 'updatedAt' } });

BprndCertificateSchema.index({ studentId: 1, umbrellaKey: 1, qualification: 1 });

// Add custom _id generation middleware
BprndCertificateSchema.pre('save', async function(next) {
  if (this.isNew) { // Only run for new documents
    try {
      // Generate custom ID: rru_UMBRELLA_SEQUENTIAL_NUMBER
      
      // Clean the umbrella key (replace spaces with underscores, remove special chars)
      const cleanUmbrella = this.umbrellaKey
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .toUpperCase();
      
      console.log(`🧹 Cleaned umbrella: "${this.umbrellaKey}" → "${cleanUmbrella}"`);
      
      // Find the last certificate in the same umbrella to get the next sequence number
      const lastCertificate = await this.constructor.findOne(
        { umbrellaKey: this.umbrellaKey },
        {},
        { sort: { 'customId': -1 } } // Sort by customId descending to get the latest
      );
      
      let nextSequenceNumber = 1; // Default to 1 if no previous certificates exist
      
      if (lastCertificate && lastCertificate.customId) {
        console.log(`🔍 Found last certificate in ${this.umbrellaKey}:`, {
          customId: lastCertificate.customId,
          customIdType: typeof lastCertificate.customId
        });
        
        // Check if the last certificate has a custom ID format (starts with 'rru_')
        if (typeof lastCertificate.customId === 'string' && lastCertificate.customId.startsWith('rru_')) {
          // Extract the sequence number from the last certificate's custom ID
          const idParts = lastCertificate.customId.split('_');
          console.log(`🔍 ID parts:`, idParts);
          
          if (idParts.length >= 3) {
            const lastNumber = parseInt(idParts[idParts.length - 1]);
            if (!isNaN(lastNumber)) {
              nextSequenceNumber = lastNumber + 1;
              console.log(`📈 Extracted sequence number: ${lastNumber}, next will be: ${nextSequenceNumber}`);
            } else {
              console.log(`⚠️ Could not parse sequence number from: ${idParts[idParts.length - 1]}`);
            }
          } else {
            console.log(`⚠️ ID parts length insufficient: ${idParts.length} (expected >= 3)`);
          }
        } else {
          // If the last certificate doesn't have a custom ID, start with 1
          nextSequenceNumber = 1;
          console.log(`🔄 No custom ID found, starting sequence at: ${nextSequenceNumber}`);
        }
      } else {
        console.log(`🆕 No previous certificates found for ${this.umbrellaKey}, starting at: ${nextSequenceNumber}`);
      }
      
      // Generate the custom ID
      this.customId = `rru_${cleanUmbrella}_${nextSequenceNumber}`;
      
      console.log(`🆔 Generated certificate custom ID: ${this.customId} for umbrella: ${this.umbrellaKey}`);
      
    } catch (error) {
      console.error('❌ Custom certificate ID generation error:', error);
      // Fallback to MongoDB's default _id if custom generation fails
    }
  }
  next();
});

module.exports = mongoose.model('bprnd_certificates', BprndCertificateSchema);
