const mongoose = require('mongoose');

const mouSchema = new mongoose.Schema({
  // Unique identifier for the MOU
  ID: {
    type: String,
    required: true,
    unique: true,
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

// Index for the unique ID field
mouSchema.index({ ID: 1 });

// Create and export the model
const MOU = mongoose.model('MOU', mouSchema);

module.exports = MOU;