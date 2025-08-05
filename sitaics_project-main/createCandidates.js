const mongoose = require('mongoose');
const Candidate = require('./models/students');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/university_db')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const createCandidates = async () => {
  try {
    console.log('Creating candidates...');

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
        address: '123 Main Street, Mumbai, Maharashtra, India'
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
        address: '456 Park Avenue, Delhi, Delhi, India'
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
        address: '789 Tech Street, Bangalore, Karnataka, India'
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
        address: '321 Marina Road, Chennai, Tamil Nadu, India'
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
        address: '654 Charminar Road, Hyderabad, Telangana, India'
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
        address: '987 Hinjewadi Road, Pune, Maharashtra, India'
      }
    ];

    for (const candidateData of dummyCandidates) {
      const candidate = new Candidate(candidateData);
      await candidate.save();
      console.log(`Created Candidate: ${candidate.fullName} (Enrollment: ${candidate.enrollmentNumber})`);
    }

    console.log('\n✅ Candidates created successfully!');
    console.log(`📊 Total candidates created: ${dummyCandidates.length}`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating candidates:', error);
    mongoose.connection.close();
  }
};

createCandidates(); 