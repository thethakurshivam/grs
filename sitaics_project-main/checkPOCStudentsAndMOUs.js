const mongoose = require('mongoose');
const poc = require('./models2/poc');
const Student = require('./models1/student');
const MOU = require('./models/MOU');
require('dotenv').config();

async function checkPOCStudentsAndMOUs() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics'
    );
    console.log('Connected to MongoDB');

    // Find POC with ID
    const pocID = '689253dc0e42186a81dea794';
    const pocUser = await poc.findById(pocID);

    if (!pocUser) {
      console.log('POC not found');
      return;
    }

    console.log('\n=== POC Details ===');
    console.log('Name:', pocUser.name);
    console.log('Email:', pocUser.email);
    console.log('Organization:', pocUser.organization);
    console.log('MOU IDs in POC:', pocUser.mous);

    // Get MOUs separately
    const mous = await MOU.find({
      _id: { $in: pocUser.mous },
    });

    console.log('\n=== MOUs ===');
    console.log('MOU Count:', mous.length);
    console.log('MOU Details:');
    mous.forEach((mou) => {
      console.log(`- ID: ${mou._id}`);
      console.log(`  Institution: ${mou.nameOfPartnerInstitution}`);
      console.log('---');
    });

    // Find students with these MOUs
    const mouIds = mous.map((mou) => mou._id);
    const students = await Student.find({
      mou_id: { $in: mouIds },
    });

    console.log('\n=== Students ===');
    console.log('Student Count:', students.length);

    if (students.length > 0) {
      console.log('\nStudent Details:');
      students.forEach((student) => {
        console.log(`- Student Document Structure:`);
        console.log(JSON.stringify(student.toObject(), null, 2));
        console.log('---');
      });
    } else {
      console.log('No students found with these MOU IDs');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkPOCStudentsAndMOUs();
