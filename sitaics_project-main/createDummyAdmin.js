const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import the Admin model
const Admin = require('./models/admin');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academic_portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@test.com' });
    
    if (existingAdmin) {
      console.log('Admin with email admin@test.com already exists');
      console.log('Email: admin@test.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create new admin
    const newAdmin = new Admin({
      name: 'Test Admin',
      email: 'admin@test.com',
      phoneNumber: '1234567890',
      password: hashedPassword
    });

    await newAdmin.save();
    
    console.log('Admin created successfully!');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.connection.close();
  }
}); 