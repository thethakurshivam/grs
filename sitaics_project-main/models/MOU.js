const mongoose = require('mongoose');

const mouSchema = new mongoose.Schema({
  // Unique identifier for the MOU
  ID: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // School field - reference to School collection
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
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

// Pre-save middleware to validate school reference
mouSchema.pre('save', async function(next) {
  try {
    // Only run this middleware if school field is modified or this is a new document
    if (this.isModified('school') || this.isNew) {
      const School = mongoose.model('School');
      
      // Check if the referenced school exists
      const school = await School.findById(this.school);
      
      if (!school) {
        return next(new Error(`School with ID ${this.school} does not exist`));
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