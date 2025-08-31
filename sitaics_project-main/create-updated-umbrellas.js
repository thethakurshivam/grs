const mongoose = require('mongoose');
const umbrella = require('./model3/umbrella');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createUpdatedUmbrellas() {
  try {
    console.log('🔍 Creating Updated Umbrella Documents...\n');

    // Clear existing umbrellas first
    await umbrella.deleteMany({});
    console.log('🧹 Cleared existing umbrella documents.');

    // Current umbrella data from actual database (sitaics)
    const updatedUmbrellas = [
      { name: 'Tourism Police' },
      { name: 'Women in Security and Police' },
      { name: 'Traffic Management and Road Safety' },
      { name: 'Border Management' },
      { name: 'Disaster Risk Reduction' },
      { name: 'OSI Model' },
      { name: 'Social Media Security' },
      { name: 'Cyber Threat Intelligence' },
      { name: 'Cyber Security' },
      { name: 'Cyber Law' },
      { name: 'Forensics Psychology' },
      { name: 'Gender Sensitisation' },
      { name: 'Behavioral Sciences' }
    ];

    console.log('📋 Creating updated umbrella documents:');
    updatedUmbrellas.forEach(umbrellaData => {
      console.log(`   - ${umbrellaData.name}`);
    });

    // Insert all umbrellas
    const result = await umbrella.insertMany(updatedUmbrellas);
    
    console.log(`\n✅ Successfully created ${result.length} umbrella documents!`);
    
    // Verify creation
    const createdUmbrellas = await umbrella.find({}).sort({ name: 1 });
    console.log('\n📋 Created umbrellas and their field keys:');
    createdUmbrellas.forEach((umbrella, index) => {
      const fieldKey = umbrella.name.replace(/\s+/g, '_');
      console.log(`   ${index + 1}. "${umbrella.name}" -> Field Key: "${fieldKey}"`);
    });

    console.log('\n🔗 These field keys should match the schema in bprndstudents.js');

  } catch (error) {
    console.error('❌ Error creating updated umbrellas:', error);
  } finally {
    mongoose.connection.close();
  }
}

createUpdatedUmbrellas();
