const mongoose = require('mongoose');
require('dotenv').config();

// Import the Field model
const Field = require('./models/fields');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create fields data
const createFields = async () => {
  try {
    console.log('🚀 Starting to create fields...');

    // Define the fields to create
    const fieldsToCreate = [
      { name: 'Defence and Strategic Studies', count: 0 },
      { name: 'Cyber Security', count: 0 },
      { name: 'Criminology', count: 0 },
      { name: 'Criminal and Military Law', count: 0 },
      { name: 'Police', count: 0 }
    ];

    const createdFields = [];
    const existingFields = [];

    for (const fieldData of fieldsToCreate) {
      // Check if field already exists
      let field = await Field.findOne({ name: fieldData.name });
      if (!field) {
        field = new Field(fieldData);
        await field.save();
        createdFields.push(field);
        console.log(`✅ Created field: ${fieldData.name}`);
      } else {
        existingFields.push(field);
        console.log(`⚠️ Field already exists: ${fieldData.name}`);
      }
    }

    console.log('\n🎉 Fields creation completed!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${createdFields.length} new fields`);
    console.log(`- Found ${existingFields.length} existing fields`);
    
    if (createdFields.length > 0) {
      console.log('\n✅ Newly Created Fields:');
      createdFields.forEach(field => {
        console.log(`  - ${field.name} (Count: ${field.count})`);
      });
    }
    
    if (existingFields.length > 0) {
      console.log('\n⚠️ Existing Fields:');
      existingFields.forEach(field => {
        console.log(`  - ${field.name} (Count: ${field.count})`);
      });
    }

    // Show all fields in database
    const allFields = await Field.find({});
    console.log('\n📋 All Fields in Database:');
    allFields.forEach(field => {
      console.log(`  - ${field.name} (Count: ${field.count})`);
    });

  } catch (error) {
    console.error('❌ Error creating fields:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the script
createFields(); 