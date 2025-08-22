const mongoose = require('mongoose');

const pendingCreditsSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreditCalculation',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
      required: true,
    },
    discipline: {
      type: String,
      
      required: true,
    },
    theoryHours: {
      type: Number,
      required: true,
      min: [0, 'Theory hours cannot be negative'],
    },
    practicalHours: {
      type: Number,
      required: true,
      min: [0, 'Practical hours cannot be negative'],
    },
    theoryCredits: {
      type: Number,
      required: false, // Calculated automatically
      min: [0, 'Theory credits cannot be negative'],
    },
    practicalCredits: {
      type: Number,
      required: false, // Calculated automatically
      min: [0, 'Practical credits cannot be negative'],
    },
    totalHours: {
      type: Number,
      required: false, // Calculated automatically
      min: [0, 'Total hours cannot be negative'],
    },
    calculatedCredits: {
      type: Number,
      required: false, // Calculated automatically
      min: [0, 'Calculated credits cannot be negative'],
    },
    noOfDays: {
      type: Number,
      required: true,
      min: [0, 'Number of days cannot be negative'],
    },
    pdf: {
      type: String, // Store file path
      required: true,
    },
    admin_approved: {
      type: Boolean,
      default: false,
    },
    bprnd_poc_approved: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'admin_approved', 'poc_approved', 'approved', 'declined'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate totalHours and credits
pendingCreditsSchema.pre('save', function(next) {
  // Calculate total hours
  this.totalHours = this.theoryHours + this.practicalHours;
  
  // Calculate individual credits
  this.theoryCredits = this.theoryHours / 30;
  this.practicalCredits = this.practicalHours / 15;
  
  // Calculate total credits: theory (30 hours = 1 credit) + practical (15 hours = 1 credit)
  this.calculatedCredits = this.theoryCredits + this.practicalCredits;
  
  next();
});

const PendingCredits = mongoose.model('PendingCredits', pendingCreditsSchema);

module.exports = PendingCredits;