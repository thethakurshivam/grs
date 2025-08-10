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

// Create upcoming courses data
const createUpcomingCoursesData = async () => {
  try {
    console.log('🚀 Starting to create upcoming courses data...');

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

    // Define upcoming courses to create
    const upcomingCourses = [
      {
        ID: 'COURSE_UPCOMING001',
        courseName: 'Digital Forensics and Cyber Investigation',
        organization: 'CyberTech Institute',
        duration: '6 months',
        indoorCredits: 16,
        outdoorCredits: 6,
        field: fields.find(f => f.name === 'Cyber Security')?._id || fields[0]._id,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-07-15'),
        completionStatus: 'upcoming',
        mou_id: mous[0]._id,
        subjects: [
          {
            noOfPeriods: 20,
            periodsMin: 60,
            totalMins: 1200,
            totalHrs: 20,
            credits: 8
          },
          {
            noOfPeriods: 15,
            periodsMin: 45,
            totalMins: 675,
            totalHrs: 11.25,
            credits: 5
          }
        ]
      },
      {
        ID: 'COURSE_UPCOMING002',
        courseName: 'Strategic Intelligence and National Security',
        organization: 'National Security Academy',
        duration: '8 months',
        indoorCredits: 20,
        outdoorCredits: 8,
        field: fields.find(f => f.name === 'Defence and Strategic Studies')?._id || fields[0]._id,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-10-01'),
        completionStatus: 'upcoming',
        mou_id: mous[0]._id,
        subjects: [
          {
            noOfPeriods: 25,
            periodsMin: 50,
            totalMins: 1250,
            totalHrs: 20.83,
            credits: 9
          },
          {
            noOfPeriods: 18,
            periodsMin: 60,
            totalMins: 1080,
            totalHrs: 18,
            credits: 7
          }
        ]
      },
      {
        ID: 'COURSE_UPCOMING003',
        courseName: 'Military Law and International Humanitarian Law',
        organization: 'International Law Center',
        duration: '7 months',
        indoorCredits: 18,
        outdoorCredits: 7,
        field: fields.find(f => f.name === 'Criminal and Military Law')?._id || fields[0]._id,
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-10-01'),
        completionStatus: 'upcoming',
        mou_id: mous[1]?._id || mous[0]._id,
        subjects: [
          {
            noOfPeriods: 22,
            periodsMin: 55,
            totalMins: 1210,
            totalHrs: 20.17,
            credits: 8
          },
          {
            noOfPeriods: 16,
            periodsMin: 45,
            totalMins: 720,
            totalHrs: 12,
            credits: 6
          }
        ]
      },
      {
        ID: 'COURSE_UPCOMING004',
        courseName: 'Community Policing and Public Safety',
        organization: 'Public Safety Institute',
        duration: '5 months',
        indoorCredits: 14,
        outdoorCredits: 5,
        field: fields.find(f => f.name === 'Police')?._id || fields[0]._id,
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-09-01'),
        completionStatus: 'upcoming',
        mou_id: mous[1]?._id || mous[0]._id,
        subjects: [
          {
            noOfPeriods: 18,
            periodsMin: 50,
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
        ID: 'COURSE_UPCOMING005',
        courseName: 'Forensic Psychology and Criminal Profiling',
        organization: 'Behavioral Analysis Center',
        duration: '9 months',
        indoorCredits: 24,
        outdoorCredits: 9,
        field: fields.find(f => f.name === 'Criminology')?._id || fields[0]._id,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-10-01'),
        completionStatus: 'upcoming',
        mou_id: mous[0]._id,
        subjects: [
          {
            noOfPeriods: 30,
            periodsMin: 50,
            totalMins: 1500,
            totalHrs: 25,
            credits: 10
          },
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
        ID: 'COURSE_UPCOMING006',
        courseName: 'Cybersecurity for Critical Infrastructure',
        organization: 'Infrastructure Security Institute',
        duration: '6 months',
        indoorCredits: 17,
        outdoorCredits: 6,
        field: fields.find(f => f.name === 'Cyber Security')?._id || fields[0]._id,
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-11-01'),
        completionStatus: 'upcoming',
        mou_id: mous[2]?._id || mous[0]._id,
        subjects: [
          {
            noOfPeriods: 21,
            periodsMin: 55,
            totalMins: 1155,
            totalHrs: 19.25,
            credits: 8
          },
          {
            noOfPeriods: 14,
            periodsMin: 50,
            totalMins: 700,
            totalHrs: 11.67,
            credits: 5
          }
        ]
      },
      {
        ID: 'COURSE_UPCOMING007',
        courseName: 'Border Security and Counter-Terrorism',
        organization: 'Border Security Academy',
        duration: '7 months',
        indoorCredits: 19,
        outdoorCredits: 7,
        field: fields.find(f => f.name === 'Defence and Strategic Studies')?._id || fields[0]._id,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-12-31'),
        completionStatus: 'upcoming',
        mou_id: mous[1]?._id || mous[0]._id,
        subjects: [
          {
            noOfPeriods: 24,
            periodsMin: 50,
            totalMins: 1200,
            totalHrs: 20,
            credits: 8
          },
          {
            noOfPeriods: 17,
            periodsMin: 55,
            totalMins: 935,
            totalHrs: 15.58,
            credits: 7
          }
        ]
      }
    ];

    const createdCourses = [];
    const existingCourses = [];

    for (const courseData of upcomingCourses) {
      // Check if course already exists
      let course = await Course.findOne({ ID: courseData.ID });
      if (!course) {
        course = new Course(courseData);
        await course.save();
        createdCourses.push(course);
        console.log(`✅ Created upcoming course: ${courseData.courseName} (${courseData.ID})`);
      } else {
        existingCourses.push(course);
        console.log(`⚠️ Course already exists: ${courseData.courseName} (${courseData.ID})`);
      }
    }

    console.log('\n🎉 Upcoming courses creation completed!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${createdCourses.length} new upcoming courses`);
    console.log(`- Found ${existingCourses.length} existing courses`);
    
    if (createdCourses.length > 0) {
      console.log('\n✅ Newly Created Upcoming Courses:');
      createdCourses.forEach(course => {
        console.log(`  - ${course.courseName} (${course.ID})`);
        console.log(`    Duration: ${course.duration}`);
        console.log(`    Credits: ${course.indoorCredits + course.outdoorCredits}`);
        console.log(`    Status: ${course.completionStatus}`);
        console.log(`    Start Date: ${course.startDate.toDateString()}`);
      });
    }
    
    if (existingCourses.length > 0) {
      console.log('\n⚠️ Existing Courses:');
      existingCourses.forEach(course => {
        console.log(`  - ${course.courseName} (${course.ID})`);
      });
    }

    // Show all upcoming courses in database
    const allUpcomingCourses = await Course.find({ completionStatus: 'upcoming' });
    console.log('\n📋 All Upcoming Courses in Database:');
    allUpcomingCourses.forEach(course => {
      console.log(`  - ${course.courseName} (${course.ID}) - ${course.duration} - ${course.startDate.toDateString()}`);
    });

  } catch (error) {
    console.error('❌ Error creating upcoming courses:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the script
createUpcomingCoursesData(); 