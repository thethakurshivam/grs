const mongoose = require('mongoose');
const poc = require('./models2/poc');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/university_db')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const createDemoPOC = async () => {
  try {
    // Check if demo POC already exists
    const existingPOC = await poc.findOne({ email: 'poc@demo.com' });
    
    if (existingPOC) {
      console.log('Demo POC already exists:', existingPOC.email);
      mongoose.connection.close();
      return;
    }

    // Create demo POC user
    const demoPOC = new poc({
      name: 'Demo POC User',
      email: 'poc@demo.com',
      password: 'poc123',
      mobileNumber: '+91 98765 43210',
      organization: 'Demo Organization',
      mous: [] // Empty array for now, can be populated with actual MOU IDs later
    });

    await demoPOC.save();
    console.log('Demo POC created successfully:', demoPOC.email);
    console.log('Demo POC ID:', demoPOC._id);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating demo POC:', error);
    mongoose.connection.close();
  }
};

createDemoPOC(); 