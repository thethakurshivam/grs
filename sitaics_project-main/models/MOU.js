const mongoose = require('mongoose');

const mouSchema = new mongoose.Schema({
  // Unique identifier for the MOU
  ID: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // School field
  school: {
    type: String,
    required: true,
    trim: true
  },
  
  // Name of the partner institution
  nameOfPartnerInstitution: {
    type: String,
    required: true,
    trim: true
  },
  
  // Strategic area covered by the MOU
  strategicAreas: {
    type: String,
    required: true,
    trim: true
  },
  
  // Date of signing the MOU
  dateOfSigning: {
    type: Date,
    required: true
  },
  
  // Validity period of the MOU
  validity: {
    type: String,
    required: true,
    trim: true
  },
  
  // Affiliation date
  affiliationDate: {
    type: Date,
    required: true
  }
}, {
  collection: 'mous'
});

// Pre-save middleware to handle school count updates
mouSchema.pre('save', async function(next) {
  try {
    // Only run this middleware if school field is modified or this is a new document
    if (this.isModified('school') || this.isNew) {
      const School = mongoose.model('School');
      
      // Check if school already exists
      let school = await School.findOne({ name: this.school });
      
      if (school) {
        // School exists, don't increment count - just leave it as is
        // The count should represent the number of unique schools, not MOUs
      } else {
        // School doesn't exist, create new school with count 1
        const newSchool = new School({
          name: this.school,
          count: 1
        });
        await newSchool.save();
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Index for the unique ID field
mouSchema.index({ ID: 1 });

// Create and export the model
const MOU = mongoose.model('MOU', mouSchema);

module.exports = MOU;