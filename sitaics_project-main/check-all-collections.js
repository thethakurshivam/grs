const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkAllCollections() {
  try {
    console.log('🔍 Checking All Database Collections...\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`📋 Total collections found: ${collections.length}\n`);
    
    for (const collection of collections) {
      console.log(`📁 Collection: ${collection.name}`);
      
      try {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   Documents: ${count}`);
        
        if (count > 0) {
          // Show a sample document
          const sample = await db.collection(collection.name).findOne({});
          console.log(`   Sample fields: ${Object.keys(sample || {}).join(', ')}`);
        }
        
        console.log('');
      } catch (error) {
        console.log(`   Error checking collection: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking collections:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAllCollections();
