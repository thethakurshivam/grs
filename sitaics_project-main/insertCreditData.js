const mongoose = require('mongoose');
const Credit = require('./model3/credit');
require('dotenv').config();

async function insertCreditData() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define the 3 credit documents to insert
    const creditDocuments = [
      {
        course_name: 'firing',
        organization: 'nsg',
        total_credits: 10
      },
      {
        course_name: 'swimming',
        organization: 'navy',
        total_credits: 20
      },
      {
        course_name: 'martial_art',
        organization: 'crpf',
        total_credits: 15
      }
    ];

    console.log('📝 Inserting credit documents...');
    
    // Insert all documents
    const insertedCredits = await Credit.insertMany(creditDocuments);
    
    console.log('✅ Successfully inserted credit documents:');
    insertedCredits.forEach((credit, index) => {
      console.log(`${index + 1}. ${credit.course_name} (${credit.organization}) - ${credit.total_credits} credits`);
      console.log(`   ID: ${credit._id}`);
    });

    // Verify the insertion by counting total documents
    const totalCredits = await Credit.countDocuments();
    console.log(`\n📊 Total credit documents in database: ${totalCredits}`);

    // Display all credit documents
    console.log('\n📋 All credit documents in database:');
    const allCredits = await Credit.find({});
    allCredits.forEach((credit, index) => {
      console.log(`${index + 1}. Course: ${credit.course_name}`);
      console.log(`   Organization: ${credit.organization}`);
      console.log(`   Credits: ${credit.total_credits}`);
      console.log(`   ID: ${credit._id}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('❌ Error inserting credit data:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      console.log('💡 Some documents may already exist in the database');
    }
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the insertion
console.log('🚀 Starting credit data insertion...');
insertCreditData();
