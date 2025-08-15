const mongoose = require('mongoose');
const POCBPRND = require('./model3/pocbprnd');
require('dotenv').config();

const uri = 'mongodb://localhost:27017/sitaics';

const createDummyBPRNDPOC = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const dummyPOC = new POCBPRND({
      name: 'Test BPRND POC',
      email: 'bprndpoc@test.com',
      password: 'Test@123',
      mobileNumber: '9876543210',
      organization: 'Test BPRND Organization',
      mous: [], // This will be populated later when MOUs are created
    });

    await dummyPOC.save();
    console.log('BPRND POC created successfully');
    console.log('Login Credentials:');
    console.log('Email: bprndpoc@test.com');
    console.log('Password: Test@123');
  } catch (error) {
    console.error('Error creating BPRND POC:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createDummyBPRNDPOC();
