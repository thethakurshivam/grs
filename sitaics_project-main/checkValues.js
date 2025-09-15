const mongoose = require('mongoose');
const Value = require('./model3/value');
require('dotenv').config();

async function run() {
  const uri =  'mongodb://localhost:27017/sitaics';
  try {
    await mongoose.connect(uri);
    const dbName = mongoose.connection.name;
    const count = await Value.countDocuments();
    const docs = await Value.find({}).limit(5).lean();
    console.log('Connected to DB:', dbName);
    console.log('Collection: values');
    console.log('Count:', count);
    console.log('Sample docs:', JSON.stringify(docs, null, 2));
  } catch (e) {
    console.error('Check error:', e?.message || e);
  } finally {
    await mongoose.disconnect();
  }
}

run();


