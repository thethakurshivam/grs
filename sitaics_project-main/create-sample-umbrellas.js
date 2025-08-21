const mongoose = require('mongoose');
const umbrella = require('./model3/umbrella');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createSampleUmbrellas() {
  try {
    console.log('🔍 Creating Sample Umbrella Documents...\n');

    // Check if umbrellas already exist
    const existingCount = await umbrella.countDocuments();
    if (existingCount > 0) {
      console.log(`✅ ${existingCount} umbrella documents already exist. Skipping creation.`);
      return;
    }

    // Sample umbrella data
    const sampleUmbrellas = [
      { name: 'Cyber Security' },
      { name: 'Criminology' },
      { name: 'Defence' },
      { name: 'Forensics' },
      { name: 'Military Law' },
      { name: 'Police Administration' }
    ];

    console.log('📋 Creating umbrella documents:');
    sampleUmbrellas.forEach(umbrellaData => {
      console.log(`   - ${umbrellaData.name}`);
    });

    // Insert all umbrellas
    const result = await umbrella.insertMany(sampleUmbrellas);
    
    console.log(`\n✅ Successfully created ${result.length} umbrella documents!`);
    
    // Verify creation
    const createdUmbrellas = await umbrella.find({});
    console.log('\n📋 Created umbrellas:');
    createdUmbrellas.forEach((umbrella, index) => {
      console.log(`   ${index + 1}. "${umbrella.name}" -> Field Key: "${umbrella.name.replace(/\s+/g, '_')}"`);
    });

  } catch (error) {
    console.error('❌ Error creating sample umbrellas:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSampleUmbrellas();
