const mongoose = require('mongoose');

const BprndCertificateSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CreditCalculation', required: true },
  umbrellaKey: { type: String, required: true },
  qualification: { type: String, enum: ['certificate', 'diploma', 'pg diploma'], required: true },
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'bprnd_certification_claims', required: true },
  certificateNo: { type: String },
  pdfUrl: { type: String },
}, { timestamps: { createdAt: 'issuedAt', updatedAt: 'updatedAt' } });

BprndCertificateSchema.index({ studentId: 1, umbrellaKey: 1, qualification: 1 });

module.exports = mongoose.model('bprnd_certificates', BprndCertificateSchema);
