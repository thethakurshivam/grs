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
    organization: {
      type: String,
      required: true,
    },
    discipline: {
      type: String,
      required: true,
    },
    totalHours: {
      type: Number,
      required: true,
      min: [0, 'Total hours cannot be negative'],
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
  },
  {
    timestamps: true,
  }
);

const PendingCredits = mongoose.model('PendingCredits', pendingCreditsSchema);

module.exports = PendingCredits;