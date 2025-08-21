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
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, default: 'Course' }, // Made optional with default
    organization: { type: String, default: 'Organization' }, // Made optional with default
    discipline: { type: String, default: 'Discipline' }, // Made optional with default
    theoryHours: { type: Number, default: 0 },
    practicalHours: { type: Number, default: 0 },
    theoryCredits: { type: Number, default: 0 },
    practicalCredits: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 }, // Made optional with default
    creditsEarned: { type: Number, required: true },
    noOfDays: { type: Number, default: 0 },
    completionDate: { type: Date, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'course_history' }, // Reference to original course
    // Add PDF information fields
    pdfPath: { type: String, required: false },
    pdfFileName: { type: String, required: false }
  }],
}, { timestamps: true });

BprndCertificationClaimSchema.index({ studentId: 1, umbrellaKey: 1, qualification: 1, status: 1 });

module.exports = mongoose.model('bprnd_certification_claims', BprndCertificationClaimSchema);
