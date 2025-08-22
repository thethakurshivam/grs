const mongoose = require('mongoose');

const certificateCourseMappingSchema = new mongoose.Schema({
  certificateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'bprnd_certificates', 
    required: true 
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CreditCalculation', 
    required: true 
  },
  umbrellaKey: { 
    type: String, 
    required: true 
  },
  qualification: { 
    type: String, 
    enum: ['certificate', 'diploma', 'pg diploma'], 
    required: true 
  },
  courses: [{
    courseId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'coursehistories', 
      required: true 
    },
    courseName: { 
      type: String, 
      required: true 
    },
    organization: { 
      type: String, 
      required: true 
    },
    theoryHours: { 
      type: Number, 
      required: true,
      min: 0 
    },
    practicalHours: { 
      type: Number, 
      required: true,
      min: 0 
    },
    totalCredits: { 
      type: Number, 
      required: true,
      min: 0 
    },
    creditsUsed: { 
      type: Number, 
      required: true,
      min: 0,
      validate: {
        validator: function(value) {
          return value <= this.totalCredits;
        },
        message: 'Credits used cannot exceed total credits'
      }
    },
    completionDate: { 
      type: Date, 
      required: true 
    },
    pdfPath: { 
      type: String 
    },
    pdfFileName: { 
      type: String 
    }
  }],
  totalCreditsRequired: { 
    type: Number, 
    required: true,
    min: 0 
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
certificateCourseMappingSchema.index({ certificateId: 1 });
certificateCourseMappingSchema.index({ studentId: 1 });
certificateCourseMappingSchema.index({ umbrellaKey: 1, qualification: 1 });
certificateCourseMappingSchema.index({ 'courses.courseId': 1 });

const CertificateCourseMapping = mongoose.model('CertificateCourseMapping', certificateCourseMappingSchema, 'certificate_course_mappings');

module.exports = CertificateCourseMapping;
