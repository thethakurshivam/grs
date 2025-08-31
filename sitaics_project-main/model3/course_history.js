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
    theoryCredits: {
      type: Number,
      required: true,
      min: [0, 'Theory credits cannot be negative'],
    },
    practicalCredits: {
      type: Number,
      required: true,
      min: [0, 'Practical credits cannot be negative'],
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
    },
    certificateContributed: {
      type: Boolean,
      default: false
    },
    contributedToCertificate: {
      certificateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BprndCertificate'
      },
      certificateNo: String,
      qualification: String,
      contributedAt: Date,
      creditsContributed: Number,
      isRemainingCredits: { type: Boolean, default: false },
      originalCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseHistory' }
    },
    // Add PDF information fields
    pdfPath: {
      type: String,
      required: false
    },
    pdfFileName: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true,
  }
);

const CourseHistory = mongoose.model('CourseHistory', courseHistorySchema, 'coursehistories');

module.exports = CourseHistory;
