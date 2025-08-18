const mongoose = require('mongoose');

const courseHistorySchema = new mongoose.Schema(
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
    creditsEarned: {
      type: Number,
      required: true,
      min: [0, 'Credits earned cannot be negative'],
    },
    count: {
      type: Number,
      required: true,
      min: [0, 'Count cannot be negative'],
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

const CourseHistory = mongoose.model('CourseHistory', courseHistorySchema);

module.exports = CourseHistory;
