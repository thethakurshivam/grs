const mongoose = require('mongoose');

const previousCourseSchema = new mongoose.Schema({
  organization_name: {
    type: String,
    trim: true
  },
  course_name: {
    type: String,
    trim: true
  },
  certificate_pdf: {
    type: String // storing file path or file identifier
  }
}, {
  _id: false
});

const studentSchema = new mongoose.Schema({
  sr_no: {
    type: Number
  },
  batch_no: {
    type: String,
    trim: true
  },
  rank: {
    type: String,
    trim: true
  },
  serial_number: {
    type: String,
    trim: true
  },
  enrollment_number: {
    type: String,
    trim: true
  },
  full_name: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    trim: true
  },
  dob: {
    type: Date
  },
  birth_place: {
    type: String,
    trim: true
  },
  birth_state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  aadhar_no: {
    type: String,
    trim: true
  },
  mobile_no: {
    type: String,
    trim: true
  },
  alternate_number: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    trim: true
  },
  mou_id: {
    type: String,
    required: true,
    trim: true,
    ref: 'MOU'
  },
  course_id: [{
    type: String,
    trim: true,
    ref: 'Course'
  }],
  previous_courses_certification: [previousCourseSchema], // array of previous course objects
  credits: {
    type: Number,
    default: 0
  },
  available_credit: {
    type: Number,
    default: 0
  },
  used_credit: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);