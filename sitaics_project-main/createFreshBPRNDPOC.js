const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const POCBPRND = require('./model3/pocbprnd');
require('dotenv').config({ path: '.env.poc' });

const uri = 'mongodb://localhost:27017/sitaics';

const createFreshBPRNDPOC = async () => {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Generate a secure password
    const plainPassword = 'POC@2024';
    
    // Encrypt the password using bcrypt with salt rounds 12
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    console.log('🔐 Password encrypted successfully');

    // Create a fresh BPRND POC
    const freshPOC = new POCBPRND({
      name: 'Test BPRND POC',
      email: 'test.poc.bprnd@test.com',
      password: hashedPassword, // Save the encrypted password
      mobileNumber: '9876543210',
      organization: 'Test BPRND Organization',
      mous: [], // This will be populated later when MOUs are created
    });

    // Save the POC
    await freshPOC.save();
    console.log('✅ Fresh BPRND POC created successfully!');
    
    console.log('\n📋 POC Details:');
    console.log('Name:', freshPOC.name);
    console.log('Email:', freshPOC.email);
    console.log('Mobile:', freshPOC.mobileNumber);
    console.log('Organization:', freshPOC.organization);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Email: test.poc.bprnd@test.com');
    console.log('Password: POC@2024');
    console.log('⚠️  IMPORTANT: Password is encrypted in database');
    
    console.log('\n🌐 Login URLs:');
    console.log('Frontend: http://localhost:8080/poc/bprnd/login');
    console.log('API Test: http://localhost:3003/api/poc/login');
    
    console.log('\n📊 POC ID:', freshPOC._id);
    console.log('📅 Created at:', freshPOC.createdAt);
    
  } catch (error) {
    console.error('❌ Error creating BPRND POC:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createFreshBPRNDPOC();
