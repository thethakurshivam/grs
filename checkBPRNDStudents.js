const mongoose = require('mongoose');
const CreditCalculation = require('./sitaics_project-main/model3/bprndstudents');
require('dotenv').config();

async function checkBPRNDStudents() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all BPRND students
    const students = await CreditCalculation.find({}).limit(5);
    console.log(`\nFound ${students.length} BPRND students (showing first 5):`);
    
    students.forEach((student, index) => {
      console.log(`\n--- Student ${index + 1} ---`);
      console.log('Email:', student.email);
      console.log('Name:', student.Name);
      console.log('Has Password:', !!student.password);
      console.log('Password Length:', student.password ? student.password.length : 0);
      console.log('Designation:', student.Designation);
      console.log('State:', student.State);
      console.log('Umbrella:', student.Umbrella);
    });

    // Check if any student has a password
    const studentsWithPassword = await CreditCalculation.countDocuments({ password: { $exists: true, $ne: null, $ne: '' } });
    console.log(`\nStudents with passwords: ${studentsWithPassword}`);
    
    // Check total count
    const totalStudents = await CreditCalculation.countDocuments({});
    console.log(`Total BPRND students: ${totalStudents}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

checkBPRNDStudents();
