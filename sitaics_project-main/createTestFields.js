const mongoose = require('mongoose');
const Field = require('./models/fields');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics';

async function createTestFields() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing fields
    console.log('🧹 Clearing existing fields...');
    await Field.deleteMany({});

    // Create test fields
    const testFields = [
      {
        name: 'Computer Science',
        count: 0
      },
      {
        name: 'Engineering',
        count: 0
      },
      {
        name: 'Business',
        count: 0
      },
      {
        name: 'Healthcare',
        count: 0
      },
      {
        name: 'Education',
        count: 0
      }
    ];

    console.log('🌱 Creating test fields...');
    await Field.insertMany(testFields);

    // Verify fields were created
    const fields = await Field.find();
    console.log('✅ Created fields:', fields);

    console.log('✅ Test fields created successfully!');
  } catch (error) {
    console.error('❌ Error creating test fields:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the function
createTestFields();