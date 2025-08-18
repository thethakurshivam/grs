const mongoose = require('mongoose');

const ApprovalSchema = new mongoose.Schema({
  by: { type: String }, // name or id of approver (optional)
  at: { type: Date },
  decision: { type: String, enum: ['approved', 'declined'] },
}, { _id: false });

const BprndCertificationClaimSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CreditCalculation', required: true },
  umbrellaKey: { type: String, required: true }, // e.g., Cyber_Security
  qualification: { type: String, enum: ['certificate', 'diploma', 'pg diploma'], required: true },
  requiredCredits: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'poc_approved', 'admin_approved', 'approved', 'declined'], default: 'pending' },
  
  // POC approval fields
  poc_approved: { type: Boolean, default: false },
  poc_approved_at: { type: Date },
  poc_approved_by: { type: String },
  
  // Admin approval fields  
  admin_approved: { type: Boolean, default: false },
  admin_approved_at: { type: Date },
  admin_approved_by: { type: String },
  
  // Legacy approval fields (keeping for backward compatibility)
  adminApproval: { type: ApprovalSchema, default: {} },
  pocApproval: { type: ApprovalSchema, default: {} },
  
  // Additional fields
  notes: { type: String },
  declined_reason: { type: String },
  declined_at: { type: Date },
  finalized_at: { type: Date },
  
  courses: [{
    courseName: { type: String, required: true },
    organization: { type: String, required: true },
    hoursEarned: { type: Number, required: true },
    creditsEarned: { type: Number, required: true },
    completionDate: { type: Date, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'course_history' } // Reference to original course
  }],
}, { timestamps: true });

BprndCertificationClaimSchema.index({ studentId: 1, umbrellaKey: 1, qualification: 1, status: 1 });

module.exports = mongoose.model('bprnd_certification_claims', BprndCertificationClaimSchema);
