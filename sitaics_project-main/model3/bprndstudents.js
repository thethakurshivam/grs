const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const creditCalculationSchema = new mongoose.Schema(
  {
    Name: { type: String, required: true },
    Designation: { type: String, required: true },
    State: { type: String, required: true },
    Training_Topic: { type: String, required: true },
    Per_session_minutes: { type: Number, required: true },
    Theory_sessions: { type: Number, required: true },
    Practical_sessions: { type: Number, required: true },
    Theory_Hours: { type: Number, required: true },
    Practical_Hours: { type: Number, required: true },
    Total_Hours: { type: Number, required: true },
    Theory_Credits: { type: Number, required: true },
    Practical_Credits: { type: Number, required: true },
    Total_Credits: { type: Number, required: true },
    date_of_birth: { type: Date, required: true },
    email: { type: String, required: true },
    password: { type: String, required: false },
    Umbrella: { type: String, required: true },
    customId: { type: String, unique: true, sparse: true }, // Custom ID field

    // Umbrella credit fields default to 0
    Cyber_Security: { type: Number, default: 0 },
    Criminology: { type: Number, default: 0 },
    Military_Law: { type: Number, default: 0 },
    Police_Administration: { type: Number, default: 0 },
    Defence: { type: Number, default: 0 },
    Forensics: { type: Number, default: 0 },
    
    // Legacy fields (kept for backward compatibility)
    Forensic_Science: { type: Number, default: 0 },
    National_Security: { type: Number, default: 0 },
    International_Security: { type: Number, default: 0 },
    Counter_Terrorism: { type: Number, default: 0 },
    Intelligence_Studies: { type: Number, default: 0 },
    Emergency_Management: { type: Number, default: 0 },
  },
  { 
    collection: 'credit_calculations',
    timestamps: true // Adds createdAt and updatedAt fields
  }
);

// Add password comparison method
creditCalculationSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!this.password) {
      return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Add password hashing middleware
creditCalculationSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      console.error('Password hashing error:', error);
    }
  }
  next();
});

// Add custom ID generation middleware (using a separate field instead of _id)
creditCalculationSchema.pre('save', function(next) {
  if (this.isNew) { // Only run for new documents
    try {
      // Generate custom ID: rrubprndt_NAME_YYYYMMDD_HHMMSS
      const now = new Date();
      
      // Format date: YYYYMMDD
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;
      
      // Format time: HHMMSS
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timeStr = `${hours}${minutes}${seconds}`;
      
      // Clean student name (remove special characters, limit length)
      const cleanName = this.Name
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .toUpperCase()
        .substring(0, 20); // Limit to 20 characters
      
      // Generate the custom ID (but don't override _id)
      this.customId = `rrubprndt_${cleanName}_${dateStr}_${timeStr}`;
      
      console.log(`🆔 Generated custom ID: ${this.customId}`);
    } catch (error) {
      console.error('Custom ID generation error:', error);
      // Continue without custom ID if generation fails
    }
  }
  next();
});

module.exports = mongoose.model('CreditCalculation', creditCalculationSchema);
