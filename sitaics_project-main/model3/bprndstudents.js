const mongoose = require('mongoose');

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

    // Umbrella credit fields default to 0
    Cyber_Security: { type: Number, default: 0 },
    Criminology: { type: Number, default: 0 },
    Military_Law: { type: Number, default: 0 },
    Police_Administration: { type: Number, default: 0 },
    Forensic_Science: { type: Number, default: 0 },
    National_Security: { type: Number, default: 0 },
    International_Security: { type: Number, default: 0 },
    Counter_Terrorism: { type: Number, default: 0 },
    Intelligence_Studies: { type: Number, default: 0 },
    Emergency_Management: { type: Number, default: 0 },
  },
  { collection: 'credit_calculations' }
);

module.exports = mongoose.model('CreditCalculation', creditCalculationSchema);
