const mongoose = require('mongoose');
const Umbrella = require('./model3/umbrella');
require('dotenv').config();

const umbrellaFields = [
  { name: 'Cyber Security' },
  { name: 'Military Law' },
  { name: 'Forensics' },
  { name: 'Criminology' },
  { name: 'Police Administration' },
  { name: 'Defence' },
];

async function createUmbrellaFields() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/sitaics');
    console.log('Connected to MongoDB');

    // Delete existing records to start fresh
    await Umbrella.deleteMany({});
    console.log('Cleared existing umbrella fields');

    // Insert the new fields
    const result = await Umbrella.insertMany(umbrellaFields);
    console.log('Successfully added umbrella fields:', result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
createUmbrellaFields();
