const mongoose = require('mongoose');

const valueSchema = new mongoose.Schema(
  {
    credit: {
      type: Number,
      required: true,
      unique: true,
      min: [0, 'Credit cannot be negative'],
    },
    qualification: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

const Value = mongoose.model('Value', valueSchema);

module.exports = Value;