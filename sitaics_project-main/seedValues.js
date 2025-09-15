const mongoose = require('mongoose');
const Value = require('./model3/value');
require('dotenv').config();

async function seed() {
  const uri = 'mongodb://localhost:27017/sitaics';
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    console.log('Using URI:', uri);

    const docs = [
      { credit: 20, qualification: 'certificate' },
      { credit: 30, qualification: 'diploma' },
      { credit: 40, qualification: 'p g diploma' },
    ];

    // Ensure collection exists
    try {
      await Value.createCollection();
      console.log('Ensured collection: values');
    } catch (_) {}

    // Upsert all docs in bulk
    await Value.bulkWrite(docs.map((doc) => ({
      updateOne: {
        filter: { credit: doc.credit },
        update: { $set: doc },
        upsert: true,
      },
    })));

    const count = await Value.countDocuments();
    console.log(`Seeded values. Total documents: ${count}`);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

seed();


