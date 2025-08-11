const mongoose = require('mongoose');
const POCBPRND = require('./model3/pocbprnd');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const checkBPRNDPOCData = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const allPOCs = await POCBPRND.find({}).select('-password');
    console.log('\nTotal BPRND POCs found:', allPOCs.length);
    console.log('\nBPRND POCs data:');
    console.log(JSON.stringify(allPOCs, null, 2));
  } catch (error) {
    console.error('Error checking BPRND POC data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

checkBPRNDPOCData();
