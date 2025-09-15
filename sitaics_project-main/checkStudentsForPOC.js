const mongoose = require('mongoose');
const poc = require('./models2/poc');
const Student = require('./models1/student');
require('dotenv').config();

async function checkStudentsForPOC(pocId) {
  try {
    await mongoose.connect('mongodb://localhost:27017/sitaics');
    console.log('Connected to MongoDB');

    // Get POC and their MOUs
    const pocData = await poc.findById(pocId).populate('mous');
    if (!pocData) {
      console.log('POC not found');
      return;
    }

    console.log('\nPOC Details:');
    console.log('Name:', pocData.name);
    console.log('Organization:', pocData.organization);
    console.log(
      '\nMOUs:',
      pocData.mous.map((mou) => mou._id.toString())
    );

    // Get students for each MOU
    const mouIds = pocData.mous.map((mou) => mou._id.toString());
    console.log('\nSearching for students with these MOU IDs...');

    const students = await Student.find({
      mou_id: { $in: mouIds },
    });

    console.log('\nStudents found:', students.length);
    console.log('\nStudent Details:');
    students.forEach((student) => {
      console.log(`- Name: ${student.full_name}`);
      console.log(`  Email: ${student.email}`);
      console.log(`  MOU ID: ${student.mou_id}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Get POC ID from command line argument
const pocId = process.argv[2];
if (!pocId) {
  console.log('Please provide a POC ID as argument');
  process.exit(1);
}

checkStudentsForPOC(pocId);
