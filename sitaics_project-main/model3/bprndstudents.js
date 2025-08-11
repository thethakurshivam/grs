const mongoose = require('mongoose');

const creditCalculationSchema = new mongoose.Schema({
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
  password: { type: String, required: false }
}, { collection: 'credit_calculations' });

module.exports = mongoose.model('CreditCalculation', creditCalculationSchema);