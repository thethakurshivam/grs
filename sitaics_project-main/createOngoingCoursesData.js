const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Course = require('./models/courses');
const MOU = require('./models/MOU');
const School = require('./models/school');
const Field = require('./models/fields');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create ongoing courses data
const createOngoingCoursesData = async () => {
  try {
    console.log('🚀 Starting to create ongoing courses data...');

    // First, get existing schools, MOUs, and fields
    const schools = await School.find({});
    const mous = await MOU.find({});
    const fields = await Field.find({});

    console.log(`Found ${schools.length} schools, ${mous.length} MOUs, ${fields.length} fields`);

    if (schools.length === 0) {
      console.log('❌ No schools found. Please create schools first.');
      return;
    }

    if (mous.length === 0) {
      console.log('❌ No MOUs found. Please create MOUs first.');
      return;
    }

    if (fields.length === 0) {
      console.log('❌ No fields found. Please create fields first.');
      return;
    }

    // Define ongoing courses to create
    const ongoingCourses = [
      {
        ID: 'COURSE_ONGOING001',
        courseName: 'Advanced Cybersecurity Training',
        organization: 'CyberSec Solutions',
        duration: '8 months',
        indoorCredits: 20,
        outdoorCredits: 8,
        field: fields.find(f => f.name === 'Cyber Security')?._id || fields[0]._id,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-02-01'),
        completionStatus: 'ongoing',
        mou_id: mous[0]._id,
        subjects: [
          {
            noOfPeriods: 25,
            periodsMin: 60,
            totalMins: 1500,
            totalHrs: 25,
            credits: 8
          },
          {
            noOfPeriods: 20,
            periodsMin: 45,
            totalMins: 900,
            totalHrs: 15,
            credits: 6
          }
        ]
      },
      {
        ID: 'COURSE_ONGOING002',
        courseName: 'Defence Strategy and Leadership',
        organization: 'Defence Academy',
        duration: '6 months',
        indoorCredits: 18,
        outdoorCredits: 6,
        field: fields.find(f => f.name === 'Defence and Strategic Studies')?._id || fields[0]._id,
        startDate: new Date('2024-07-01'),
        endDate: new Date('2025-01-01'),
        completionStatus: 'ongoing',
        mou_id: mous[0]._id,
        subjects: [
          {
            noOfPeriods: 22,
            periodsMin: 50,
            totalMins: 1100,
            totalHrs: 18.33,
            credits: 7
          }
        ]
      },
      {
        ID: 'COURSE_ONGOING003',
        courseName: 'Criminal Law and Investigation',
        organization: 'Legal Institute',
        duration: '7 months',
        indoorCredits: 16,
        outdoorCredits: 7,
        field: fields.find(f => f.name === 'Criminal and Military Law')?._id || fields[0]._id,
        startDate: new Date('2024-08-01'),
        endDate: new Date('2025-03-01'),
        completionStatus: 'ongoing',
        mou_id: mous[1]?._id || mous[0]._id,
        subjects: [
          {
            noOfPeriods: 24,
            periodsMin: 55,
            totalMins: 1320,
            totalHrs: 22,
            credits: 8
          },
          {
            noOfPeriods: 15,
            periodsMin: 40,
            totalMins: 600,
            totalHrs: 10,
            credits: 4
          }
        ]
      },
      {
        ID: 'COURSE_ONGOING004',
        courseName: 'Police Administration and Management',
        organization: 'Police Training Academy',
        duration: '5 months',
        indoorCredits: 14,
        outdoorCredits: 5,
        field: fields.find(f => f.name === 'Police')?._id || fields[0]._id,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-02-01'),
        completionStatus: 'ongoing',
        mou_id: mous[1]?._id || mous[0]._id,
        subjects: [
          {
            noOfPeriods: 20,
            periodsMin: 45,
            totalMins: 900,
            totalHrs: 15,
            credits: 6
          },
          {
            noOfPeriods: 12,
            periodsMin: 60,
            totalMins: 720,
            totalHrs: 12,
            credits: 5
          }
        ]
      },
      {
        ID: 'COURSE_ONGOING005',
        courseName: 'Criminology and Criminal Psychology',
        organization: 'Behavioral Sciences Institute',
        duration: '9 months',
        indoorCredits: 22,
        outdoorCredits: 9,
        field: fields.find(f => f.name === 'Criminology')?._id || fields[0]._id,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2025-02-01'),
        completionStatus: 'ongoing',
        mou_id: mous[0]._id,
        subjects: [
          {
            noOfPeriods: 28,
            periodsMin: 50,
            totalMins: 1400,
            totalHrs: 23.33,
            credits: 9
          },
          {
            noOfPeriods: 18,
            periodsMin: 45,
            totalMins: 810,
            totalHrs: 13.5,
            credits: 5
          },
          {
            noOfPeriods: 10,
            periodsMin: 60,
            totalMins: 600,
            totalHrs: 10,
            credits: 4
          }
        ]
      }
    ];

    const createdCourses = [];
    const existingCourses = [];

    for (const courseData of ongoingCourses) {
      // Check if course already exists
      let course = await Course.findOne({ ID: courseData.ID });
      if (!course) {
        course = new Course(courseData);
        await course.save();
        createdCourses.push(course);
        console.log(`✅ Created ongoing course: ${courseData.courseName} (${courseData.ID})`);
      } else {
        existingCourses.push(course);
        console.log(`⚠️ Course already exists: ${courseData.courseName} (${courseData.ID})`);
      }
    }

    console.log('\n🎉 Ongoing courses creation completed!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${createdCourses.length} new ongoing courses`);
    console.log(`- Found ${existingCourses.length} existing courses`);
    
    if (createdCourses.length > 0) {
      console.log('\n✅ Newly Created Ongoing Courses:');
      createdCourses.forEach(course => {
        console.log(`  - ${course.courseName} (${course.ID})`);
        console.log(`    Duration: ${course.duration}`);
        console.log(`    Credits: ${course.indoorCredits + course.outdoorCredits}`);
        console.log(`    Status: ${course.completionStatus}`);
      });
    }
    
    if (existingCourses.length > 0) {
      console.log('\n⚠️ Existing Courses:');
      existingCourses.forEach(course => {
        console.log(`  - ${course.courseName} (${course.ID})`);
      });
    }

    // Show all ongoing courses in database
    const allOngoingCourses = await Course.find({ completionStatus: 'ongoing' });
    console.log('\n📋 All Ongoing Courses in Database:');
    allOngoingCourses.forEach(course => {
      console.log(`  - ${course.courseName} (${course.ID}) - ${course.duration}`);
    });

  } catch (error) {
    console.error('❌ Error creating ongoing courses:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the script
createOngoingCoursesData(); 