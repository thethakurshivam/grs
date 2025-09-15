const mongoose = require('mongoose');
const poc = require('./models2/poc');
const MOU = require('./models/MOU');
const Student = require('./models1/student');
const School = require('./models/school');

// MongoDB connection
mongoose
  .connect('mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const createPOCDummyData = async () => {
  try {
    console.log('Creating POC dummy data...');

    // Step 1: Create dummy schools
    const dummySchools = [
      {
        name: 'School of Technology',
        count: 150,
      },
      {
        name: 'School of Business',
        count: 120,
      },
      {
        name: 'School of Engineering',
        count: 200,
      },
    ];

    console.log('Creating Schools...');
    const createdSchools = [];
    for (const schoolData of dummySchools) {
      const school = new School(schoolData);
      await school.save();
      createdSchools.push(school);
      console.log(`Created School: ${school.name} (ID: ${school._id})`);
    }

    // Step 2: Create dummy MOUs with correct schema
    const dummyMOUs = [
      {
        ID: 'MOU001',
        school: createdSchools[0]._id,
        nameOfPartnerInstitution: 'TechCorp Inc.',
        strategicAreas: 'Technology Training, Research Collaboration',
        dateOfSigning: new Date('2024-01-15'),
        validity: '2027-01-15',
        affiliationDate: new Date('2024-01-15'),
      },
      {
        ID: 'MOU002',
        school: createdSchools[1]._id,
        nameOfPartnerInstitution: 'EduTech Solutions',
        strategicAreas: 'Online Learning, Student Exchange',
        dateOfSigning: new Date('2024-02-20'),
        validity: '2026-02-20',
        affiliationDate: new Date('2024-02-20'),
      },
      {
        ID: 'MOU003',
        school: createdSchools[2]._id,
        nameOfPartnerInstitution: 'Innovation Labs',
        strategicAreas: 'Innovation Projects, Startup Support',
        dateOfSigning: new Date('2024-03-10'),
        validity: '2028-03-10',
        affiliationDate: new Date('2024-03-10'),
      },
    ];

    console.log('Creating MOUs...');
    const createdMOUs = [];
    for (const mouData of dummyMOUs) {
      const mou = new MOU(mouData);
      await mou.save();
      createdMOUs.push(mou);
      console.log(
        `Created MOU: ${mou.ID} - ${mou.nameOfPartnerInstitution} (ID: ${mou._id})`
      );
    }

    // Step 3: Create dummy candidates (students) with correct schema
    const dummyCandidates = [
      {
        srNo: 1,
        batchNo: 'BATCH2024-01',
        rank: '1',
        serialNumberRRU: 'RRU001',
        enrollmentNumber: 'ENR001',
        fullName: 'John Doe',
        gender: 'Male',
        dateOfBirth: new Date('1995-03-15'),
        birthPlace: 'Mumbai',
        birthState: 'Maharashtra',
        country: 'India',
        aadharNo: '123456789012',
        mobileNumber: '9876543210',
        alternateNumber: '9876543211',
        email: 'john.doe@example.com',
        address: '123 Main Street, Mumbai, Maharashtra, India',
      },
      {
        srNo: 2,
        batchNo: 'BATCH2024-01',
        rank: '2',
        serialNumberRRU: 'RRU002',
        enrollmentNumber: 'ENR002',
        fullName: 'Jane Smith',
        gender: 'Female',
        dateOfBirth: new Date('1996-07-22'),
        birthPlace: 'Delhi',
        birthState: 'Delhi',
        country: 'India',
        aadharNo: '123456789013',
        mobileNumber: '9876543212',
        alternateNumber: '9876543213',
        email: 'jane.smith@example.com',
        address: '456 Park Avenue, Delhi, Delhi, India',
      },
      {
        srNo: 3,
        batchNo: 'BATCH2024-02',
        rank: '1',
        serialNumberRRU: 'RRU003',
        enrollmentNumber: 'ENR003',
        fullName: 'Mike Johnson',
        gender: 'Male',
        dateOfBirth: new Date('1994-11-08'),
        birthPlace: 'Bangalore',
        birthState: 'Karnataka',
        country: 'India',
        aadharNo: '123456789014',
        mobileNumber: '9876543214',
        alternateNumber: '9876543215',
        email: 'mike.johnson@example.com',
        address: '789 Tech Street, Bangalore, Karnataka, India',
      },
      {
        srNo: 4,
        batchNo: 'BATCH2024-02',
        rank: '2',
        serialNumberRRU: 'RRU004',
        enrollmentNumber: 'ENR004',
        fullName: 'Sarah Wilson',
        gender: 'Female',
        dateOfBirth: new Date('1997-01-30'),
        birthPlace: 'Chennai',
        birthState: 'Tamil Nadu',
        country: 'India',
        aadharNo: '123456789015',
        mobileNumber: '9876543216',
        alternateNumber: '9876543217',
        email: 'sarah.wilson@example.com',
        address: '321 Marina Road, Chennai, Tamil Nadu, India',
      },
      {
        srNo: 5,
        batchNo: 'BATCH2024-03',
        rank: '1',
        serialNumberRRU: 'RRU005',
        enrollmentNumber: 'ENR005',
        fullName: 'David Brown',
        gender: 'Male',
        dateOfBirth: new Date('1993-09-12'),
        birthPlace: 'Hyderabad',
        birthState: 'Telangana',
        country: 'India',
        aadharNo: '123456789016',
        mobileNumber: '9876543218',
        alternateNumber: '9876543219',
        email: 'david.brown@example.com',
        address: '654 Charminar Road, Hyderabad, Telangana, India',
      },
      {
        srNo: 6,
        batchNo: 'BATCH2024-03',
        rank: '2',
        serialNumberRRU: 'RRU006',
        enrollmentNumber: 'ENR006',
        fullName: 'Emily Davis',
        gender: 'Female',
        dateOfBirth: new Date('1998-05-18'),
        birthPlace: 'Pune',
        birthState: 'Maharashtra',
        country: 'India',
        aadharNo: '123456789017',
        mobileNumber: '9876543220',
        alternateNumber: '9876543221',
        email: 'emily.davis@example.com',
        address: '987 Hinjewadi Road, Pune, Maharashtra, India',
      },
    ];

    console.log('Creating Students...');
    for (const candidateData of dummyCandidates) {
      const studentData = {
        sr_no: candidateData.srNo,
        batch_no: candidateData.batchNo,
        rank: candidateData.rank,
        serial_number: candidateData.serialNumberRRU,
        enrollment_number: candidateData.enrollmentNumber,
        full_name: candidateData.fullName,
        gender: candidateData.gender.toLowerCase().charAt(0),
        dob: candidateData.dateOfBirth,
        birth_place: candidateData.birthPlace,
        birth_state: candidateData.birthState,
        country: candidateData.country.toLowerCase(),
        aadhar_no: candidateData.aadharNo,
        mobile_no: candidateData.mobileNumber,
        alternate_number: candidateData.alternateNumber,
        email: candidateData.email,
        password: 'student123', // You should hash this in production
        address: candidateData.address,
        mou_id: createdMOUs[0]._id.toString(), // Assigning to first MOU, adjust as needed
        credits: 0,
        available_credit: 0,
        used_credit: 0,
      };
      const student = new Student(studentData);
      await student.save();
      console.log(
        `Created Student: ${student.full_name} (Email: ${student.email})`
      );
    }

    // Step 4: Update the existing POC user with the MOU IDs
    const existingPOC = await poc.findOne({ email: 'poc@demo.com' });
    if (existingPOC) {
      existingPOC.mous = createdMOUs.map((mou) => mou._id);
      await existingPOC.save();
      console.log(`Updated POC user with ${createdMOUs.length} MOUs`);
      console.log('POC User Details:');
      console.log('  Name:', existingPOC.name);
      console.log('  Email:', existingPOC.email);
      console.log('  Organization:', existingPOC.organization);
      console.log('  MOUs:', existingPOC.mous);
    } else {
      console.log('POC user not found!');
    }

    console.log('\n✅ POC dummy data created successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Created ${createdSchools.length} Schools`);
    console.log(`   - Created ${createdMOUs.length} MOUs`);
    console.log(`   - Created ${dummyCandidates.length} Candidates`);
    console.log(`   - Updated POC user with MOU associations`);
    console.log('\n🎯 Demo Credentials:');
    console.log('   Email: poc@demo.com');
    console.log('   Password: poc123');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating POC dummy data:', error);
    mongoose.connection.close();
  }
};

createPOCDummyData();
