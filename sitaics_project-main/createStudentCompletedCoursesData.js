const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Student = require('./models1/student');
const Course = require('./models/courses');
const MOU = require('./models/MOU');
const School = require('./models/school');
const Field = require('./models/fields');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create dummy data
const createDummyData = async () => {
  try {
    console.log('🚀 Starting to create dummy data for student completed courses...');

    // First, create a dummy school if it doesn't exist
    let school = await School.findOne({ name: 'School of Computer Science' });
    if (!school) {
      school = new School({
        name: 'School of Computer Science',
        description: 'School for Computer Science programs'
      });
      await school.save();
      console.log('✅ Created dummy school');
    }

    // Create dummy fields if they don't exist
    const dummyFields = [
      { name: 'Cybersecurity', count: 0 },
      { name: 'AI/ML', count: 0 },
      { name: 'Data Science', count: 0 },
      { name: 'Big Data', count: 0 }
    ];

    const createdFields = [];
    for (const fieldData of dummyFields) {
      let field = await Field.findOne({ name: fieldData.name });
      if (!field) {
        field = new Field(fieldData);
        await field.save();
        console.log(`✅ Created field: ${fieldData.name}`);
      }
      createdFields.push(field);
    }

    // Create dummy MOUs if they don't exist
    const dummyMOUs = [
      {
        ID: 'MOU_COMP001',
        nameOfPartnerInstitution: 'TechCorp Solutions',
        strategicAreas: 'Cybersecurity, AI/ML',
        dateOfSigning: new Date('2024-01-15'),
        validity: '3 years',
        affiliationDate: new Date('2024-02-01'),
        school: school._id
      },
      {
        ID: 'MOU_COMP002',
        nameOfPartnerInstitution: 'DataFlow Analytics',
        strategicAreas: 'Data Science, Big Data',
        dateOfSigning: new Date('2024-03-10'),
        validity: '3 years',
        affiliationDate: new Date('2024-04-01'),
        school: school._id
      }
    ];

    const createdMOUs = [];
    for (const mouData of dummyMOUs) {
      let mou = await MOU.findOne({ ID: mouData.ID });
      if (!mou) {
        mou = new MOU(mouData);
        await mou.save();
        console.log(`✅ Created MOU: ${mouData.ID}`);
      }
      createdMOUs.push(mou);
    }

    // Create dummy completed courses
    const dummyCompletedCourses = [
      {
        ID: 'COURSE001',
        courseName: 'Advanced Cybersecurity',
        organization: 'TechCorp Solutions',
        duration: '6 months',
        indoorCredits: 15,
        outdoorCredits: 5,
        field: createdFields[0]._id, // Cybersecurity
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        completionStatus: 'completed',
        mou_id: createdMOUs[0]._id,
        subjects: [
          {
            noOfPeriods: 20,
            periodsMin: 45,
            totalMins: 900,
            totalHrs: 15,
            credits: 5
          },
          {
            noOfPeriods: 15,
            periodsMin: 60,
            totalMins: 900,
            totalHrs: 15,
            credits: 5
          }
        ]
      },
      {
        ID: 'COURSE002',
        courseName: 'Machine Learning Fundamentals',
        organization: 'TechCorp Solutions',
        duration: '4 months',
        indoorCredits: 12,
        outdoorCredits: 3,
        field: createdFields[1]._id, // AI/ML
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-05-31'),
        completionStatus: 'completed',
        mou_id: createdMOUs[0]._id,
        subjects: [
          {
            noOfPeriods: 18,
            periodsMin: 50,
            totalMins: 900,
            totalHrs: 15,
            credits: 5
          }
        ]
      },
      {
        ID: 'COURSE003',
        courseName: 'Data Analytics with Python',
        organization: 'DataFlow Analytics',
        duration: '5 months',
        indoorCredits: 18,
        outdoorCredits: 7,
        field: createdFields[2]._id, // Data Science
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-07-31'),
        completionStatus: 'completed',
        mou_id: createdMOUs[1]._id,
        subjects: [
          {
            noOfPeriods: 25,
            periodsMin: 40,
            totalMins: 1000,
            totalHrs: 16.67,
            credits: 6
          },
          {
            noOfPeriods: 10,
            periodsMin: 60,
            totalMins: 600,
            totalHrs: 10,
            credits: 4
          }
        ]
      },
      {
        ID: 'COURSE004',
        courseName: 'Big Data Processing',
        organization: 'DataFlow Analytics',
        duration: '3 months',
        indoorCredits: 10,
        outdoorCredits: 5,
        field: createdFields[3]._id, // Big Data
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-06-30'),
        completionStatus: 'completed',
        mou_id: createdMOUs[1]._id,
        subjects: [
          {
            noOfPeriods: 15,
            periodsMin: 60,
            totalMins: 900,
            totalHrs: 15,
            credits: 5
          }
        ]
      }
    ];

    const createdCourses = [];
    for (const courseData of dummyCompletedCourses) {
      let course = await Course.findOne({ ID: courseData.ID });
      if (!course) {
        course = new Course(courseData);
        await course.save();
        console.log(`✅ Created completed course: ${courseData.courseName}`);
      }
      createdCourses.push(course);
    }

    // Create dummy students with completed courses
    const dummyStudents = [
      {
        sr_no: 1,
        batch_no: 'BATCH2024-01',
        rank: '1',
        serial_number: 'RRU001',
        enrollment_number: 'ENR001',
        full_name: 'John Doe',
        gender: 'Male',
        dob: new Date('1995-03-15'),
        birth_place: 'Mumbai',
        birth_state: 'Maharashtra',
        country: 'India',
        aadhar_no: '123456789012',
        mobile_no: '9876543210',
        alternate_number: '9876543211',
        email: 'john.doe@student.rru.ac.in',
        password: '$2b$10$hashedpassword123', // This will be hashed properly
        address: '123 Main Street, Mumbai, Maharashtra, India',
        mou_id: createdMOUs[0]._id,
        course_id: [createdCourses[0]._id, createdCourses[1]._id], // 2 completed courses
        credits: 40,
        available_credit: 20,
        used_credit: 20
      },
      {
        sr_no: 2,
        batch_no: 'BATCH2024-01',
        rank: '2',
        serial_number: 'RRU002',
        enrollment_number: 'ENR002',
        full_name: 'Jane Smith',
        gender: 'Female',
        dob: new Date('1996-07-22'),
        birth_place: 'Delhi',
        birth_state: 'Delhi',
        country: 'India',
        aadhar_no: '123456789013',
        mobile_no: '9876543212',
        alternate_number: '9876543213',
        email: 'jane.smith@student.rru.ac.in',
        password: '$2b$10$hashedpassword123', // This will be hashed properly
        address: '456 Park Avenue, Delhi, Delhi, India',
        mou_id: createdMOUs[1]._id,
        course_id: [createdCourses[2]._id, createdCourses[3]._id], // 2 completed courses
        credits: 35,
        available_credit: 15,
        used_credit: 20
      },
      {
        sr_no: 3,
        batch_no: 'BATCH2024-02',
        rank: '1',
        serial_number: 'RRU003',
        enrollment_number: 'ENR003',
        full_name: 'Mike Johnson',
        gender: 'Male',
        dob: new Date('1994-11-08'),
        birth_place: 'Bangalore',
        birth_state: 'Karnataka',
        country: 'India',
        aadhar_no: '123456789014',
        mobile_no: '9876543214',
        alternate_number: '9876543215',
        email: 'mike.johnson@student.rru.ac.in',
        password: '$2b$10$hashedpassword123', // This will be hashed properly
        address: '789 Tech Street, Bangalore, Karnataka, India',
        mou_id: createdMOUs[0]._id,
        course_id: [createdCourses[0]._id], // 1 completed course
        credits: 25,
        available_credit: 10,
        used_credit: 15
      },
      {
        sr_no: 4,
        batch_no: 'BATCH2024-02',
        rank: '2',
        serial_number: 'RRU004',
        enrollment_number: 'ENR004',
        full_name: 'Sarah Wilson',
        gender: 'Female',
        dob: new Date('1997-05-12'),
        birth_place: 'Chennai',
        birth_state: 'Tamil Nadu',
        country: 'India',
        aadhar_no: '123456789015',
        mobile_no: '9876543216',
        alternate_number: '9876543217',
        email: 'sarah.wilson@student.rru.ac.in',
        password: '$2b$10$hashedpassword123', // This will be hashed properly
        address: '321 Data Lane, Chennai, Tamil Nadu, India',
        mou_id: createdMOUs[1]._id,
        course_id: [createdCourses[2]._id, createdCourses[3]._id, createdCourses[1]._id], // 3 completed courses
        credits: 50,
        available_credit: 25,
        used_credit: 25
      }
    ];

    // Hash passwords properly
    const bcrypt = require('bcrypt');
    const defaultPassword = 'password123';

    for (const studentData of dummyStudents) {
      // Check if student already exists
      let student = await Student.findOne({ enrollment_number: studentData.enrollment_number });
      if (!student) {
        // Hash the password
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        studentData.password = hashedPassword;
        
        student = new Student(studentData);
        await student.save();
        console.log(`✅ Created student: ${studentData.full_name} with ${studentData.course_id.length} completed courses`);
      } else {
        console.log(`⚠️ Student already exists: ${studentData.full_name}`);
      }
    }

    console.log('\n🎉 Dummy data creation completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${createdMOUs.length} MOUs`);
    console.log(`- Created ${createdCourses.length} completed courses`);
    console.log(`- Created ${dummyStudents.length} students with completed courses`);
    console.log('\n🔑 Student Login Credentials:');
    console.log('Email: john.doe@student.rru.ac.in, Password: password123');
    console.log('Email: jane.smith@student.rru.ac.in, Password: password123');
    console.log('Email: mike.johnson@student.rru.ac.in, Password: password123');
    console.log('Email: sarah.wilson@student.rru.ac.in, Password: password123');

  } catch (error) {
    console.error('❌ Error creating dummy data:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the script
createDummyData(); 