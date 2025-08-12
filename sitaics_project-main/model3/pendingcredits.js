const mongoose = require('mongoose');

const pendingCreditsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
      required: true,
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