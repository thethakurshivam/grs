const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const CreditCalculation = require('./model3/bprndstudents');
require('dotenv').config();

const uri = 'mongodb://localhost:27017/sitaics';

const createFreshBPRNDStudent = async () => {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Generate a secure password
    const plainPassword = 'BPRND@2024';
    
    // Encrypt the password using bcrypt with salt rounds 10
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log('🔐 Password encrypted successfully');

    // Create a fresh BPRND student
    const freshStudent = new CreditCalculation({
      Name: 'John Doe',
      Designation: 'Police Officer',
      State: 'Delhi',
      Training_Topic: 'Criminology',
      Per_session_minutes: 60,
      Theory_sessions: 8,
      Practical_sessions: 4,
      Theory_Hours: 8,
      Practical_Hours: 4,
      Total_Hours: 12,
      Theory_Credits: 4,
      Practical_Credits: 2,
      Total_Credits: 6,
      date_of_birth: new Date('1990-01-15'),
      email: 'john.doe.bprnd@test.com',
      password: hashedPassword, // Save the encrypted password
      Umbrella: 'Criminology',
      
      // Initialize umbrella credit fields
      Cyber_Security: 0,
      Criminology: 0,
      Military_Law: 0,
      Police_Administration: 0,
      Defence: 0,
      Forensics: 0,
      
      // Legacy fields
      Forensic_Science: 0,
      National_Security: 0,
      International_Security: 0,
      Counter_Terrorism: 0,
      Intelligence_Studies: 0,
      Emergency_Management: 0,
    });

    // Save the student
    await freshStudent.save();
    console.log('✅ Fresh BPRND student created successfully!');
    
    console.log('\n📋 Student Details:');
    console.log('Name:', freshStudent.Name);
    console.log('Email:', freshStudent.email);
    console.log('Designation:', freshStudent.Designation);
    console.log('State:', freshStudent.State);
    console.log('Umbrella:', freshStudent.Umbrella);
    console.log('Total Credits:', freshStudent.Total_Credits);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Email: john.doe.bprnd@test.com');
    console.log('Password: BPRND@2024');
    console.log('⚠️  IMPORTANT: Password is encrypted in database');
    
    console.log('\n🌐 Login URLs:');
    console.log('Frontend: http://localhost:8080/student/bprnd/login');
    console.log('API Test: http://localhost:3004/api/bprnd/login');
    
    console.log('\n📊 Student ID:', freshStudent._id);
    console.log('📅 Created at:', freshStudent.createdAt);
    
  } catch (error) {
    console.error('❌ Error creating BPRND student:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createFreshBPRNDStudent();
