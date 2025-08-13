const mongoose = require('mongoose');

const ApprovalSchema = new mongoose.Schema({
  by: { type: String }, // name or id of approver (optional)
  at: { type: Date },
  decision: { type: String, enum: ['approved', 'declined'] },
}, { _id: false });

const BprndCertificationClaimSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'credit_calculations', required: true },
  umbrellaKey: { type: String, required: true }, // e.g., Cyber_Security
  qualification: { type: String, enum: ['certificate', 'diploma', 'pg diploma'], required: true },
  requiredCredits: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'admin_approved', 'poc_approved', 'approved', 'declined'], default: 'pending' },
  adminApproval: { type: ApprovalSchema, default: {} },
  pocApproval: { type: ApprovalSchema, default: {} },
  notes: { type: String },
}, { timestamps: true });

BprndCertificationClaimSchema.index({ studentId: 1, umbrellaKey: 1, qualification: 1, status: 1 });

module.exports = mongoose.model('bprnd_certification_claims', BprndCertificationClaimSchema);
