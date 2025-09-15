const mongoose = require('mongoose');
const poc = require('./models2/poc');
const MOU = require('./models/MOU');

// MongoDB connection to sitaics database
mongoose.connect('mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to sitaics MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const createPOCUser = async () => {
  try {
    console.log('Creating POC user in sitaics database...');

    // Check if POC user already exists
    const existingPOC = await poc.findOne({ email: 'poc@demo.com' });
    if (existingPOC) {
      console.log('POC user already exists:');
      console.log('  Email:', existingPOC.email);
      console.log('  Name:', existingPOC.name);
      console.log('  MOUs:', existingPOC.mous.length);
      return;
    }

    // Get existing MOUs
    const mous = await MOU.find({});
    console.log('Found', mous.length, 'existing MOUs');

    // Create POC user
    const pocUser = new poc({
      name: 'Demo POC User',
      email: 'poc@demo.com',
      password: 'poc123',
      mobileNumber: '+91 98765 43210',
      organization: 'Demo Organization',
      mous: mous.map(mou => mou._id)
    });

    await pocUser.save();
    console.log('Created POC user successfully:');
    console.log('  Email:', pocUser.email);
    console.log('  Name:', pocUser.name);
    console.log('  Organization:', pocUser.organization);
    console.log('  MOUs:', pocUser.mous.length);

    console.log('\n🎯 Demo Credentials:');
    console.log('   Email: poc@demo.com');
    console.log('   Password: poc123');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating POC user:', error);
    mongoose.connection.close();
  }
};

createPOCUser(); 