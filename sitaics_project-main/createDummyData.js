const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const School = require('./models/school');
const MOU = require('./models/MOU');
const Course = require('./models/courses');
const Field = require('./models/fields');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function deleteAllData() {
  try {
    console.log('Deleting all existing data...');
    
    // Delete all documents from collections
    await School.deleteMany({});
    await MOU.deleteMany({});
    await Course.deleteMany({});
    await Field.deleteMany({});
    
    console.log('All existing data deleted successfully!');
  } catch (error) {
    console.error('Error deleting data:', error);
  }
}

async function createDummyData() {
  try {
    console.log('Creating dummy data...');

    // Create dummy fields
    const fields = await Field.create([
      {
        name: 'Computer Science',
        description: 'Computer Science and Information Technology'
      },
      {
        name: 'Engineering',
        description: 'Mechanical and Electrical Engineering'
      },
      {
        name: 'Business Administration',
        description: 'Business and Management Studies'
      },
      {
        name: 'Medical Sciences',
        description: 'Healthcare and Medical Research'
      },
      {
        name: 'Arts and Humanities',
        description: 'Liberal Arts and Humanities'
      }
    ]);
    console.log('Fields created:', fields.length);

    // Create dummy schools
    const schools = await School.create([
      {
        name: 'School of Computer Science',
        count: 150
      },
      {
        name: 'School of Engineering',
        count: 200
      },
      {
        name: 'School of Business',
        count: 120
      },
      {
        name: 'School of Medical Sciences',
        count: 80
      },
      {
        name: 'School of Arts and Humanities',
        count: 100
      }
    ]);
    console.log('Schools created:', schools.length);

    // Create dummy MOUs
    const mous = await MOU.create([
      {
        ID: 'MOU001',
        school: schools[0]._id, // School of Computer Science
        nameOfPartnerInstitution: 'Tech University',
        strategicAreas: 'Artificial Intelligence, Machine Learning, Data Science',
        dateOfSigning: new Date('2024-01-15'),
        validity: '5 years',
        affiliationDate: new Date('2024-01-15')
      },
      {
        ID: 'MOU002',
        school: schools[1]._id, // School of Engineering
        nameOfPartnerInstitution: 'Engineering Institute',
        strategicAreas: 'Robotics, Automation, Renewable Energy',
        dateOfSigning: new Date('2024-02-20'),
        validity: '3 years',
        affiliationDate: new Date('2024-02-20')
      },
      {
        ID: 'MOU003',
        school: schools[2]._id, // School of Business
        nameOfPartnerInstitution: 'Business Academy',
        strategicAreas: 'Entrepreneurship, Finance, Marketing',
        dateOfSigning: new Date('2024-03-10'),
        validity: '4 years',
        affiliationDate: new Date('2024-03-10')
      },
      {
        ID: 'MOU004',
        school: schools[3]._id, // School of Medical Sciences
        nameOfPartnerInstitution: 'Medical Research Center',
        strategicAreas: 'Biotechnology, Clinical Research, Public Health',
        dateOfSigning: new Date('2024-04-05'),
        validity: '6 years',
        affiliationDate: new Date('2024-04-05')
      },
      {
        ID: 'MOU005',
        school: schools[4]._id, // School of Arts and Humanities
        nameOfPartnerInstitution: 'Liberal Arts College',
        strategicAreas: 'Literature, Philosophy, Cultural Studies',
        dateOfSigning: new Date('2024-05-12'),
        validity: '3 years',
        affiliationDate: new Date('2024-05-12')
      }
    ]);
    console.log('MOUs created:', mous.length);

    // Create dummy courses
    const courses = await Course.create([
      // Upcoming Courses
      {
        ID: 'CS101',
        mou_id: mous[0]._id,
        courseName: 'Introduction to Artificial Intelligence',
        organization: 'Tech University',
        duration: '3 months',
        indoorCredits: 15,
        outdoorCredits: 5,
        field: fields[0]._id,
        startDate: new Date('2024-06-01'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 20,
            periodsMin: 45,
            totalMins: 900,
            totalHrs: 15,
            credits: 3
          },
          {
            noOfPeriods: 15,
            periodsMin: 60,
            totalMins: 900,
            totalHrs: 15,
            credits: 2
          }
        ]
      },
      {
        ID: 'CS102',
        mou_id: mous[0]._id,
        courseName: 'Advanced Machine Learning',
        organization: 'Tech University',
        duration: '4 months',
        indoorCredits: 20,
        outdoorCredits: 8,
        field: fields[0]._id,
        startDate: new Date('2024-07-01'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 25,
            periodsMin: 50,
            totalMins: 1250,
            totalHrs: 20.8,
            credits: 4
          }
        ]
      },
      {
        ID: 'CS103',
        mou_id: mous[0]._id,
        courseName: 'Data Science Fundamentals',
        organization: 'Tech University',
        duration: '3 months',
        indoorCredits: 16,
        outdoorCredits: 6,
        field: fields[0]._id,
        startDate: new Date('2024-08-01'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 18,
            periodsMin: 45,
            totalMins: 810,
            totalHrs: 13.5,
            credits: 3
          }
        ]
      },
      {
        ID: 'ENG201',
        mou_id: mous[1]._id,
        courseName: 'Advanced Robotics Engineering',
        organization: 'Engineering Institute',
        duration: '4 months',
        indoorCredits: 20,
        outdoorCredits: 10,
        field: fields[1]._id,
        startDate: new Date('2024-06-15'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 25,
            periodsMin: 50,
            totalMins: 1250,
            totalHrs: 20.8,
            credits: 4
          }
        ]
      },
      {
        ID: 'ENG202',
        mou_id: mous[1]._id,
        courseName: 'Automation Systems Design',
        organization: 'Engineering Institute',
        duration: '5 months',
        indoorCredits: 22,
        outdoorCredits: 12,
        field: fields[1]._id,
        startDate: new Date('2024-07-15'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 28,
            periodsMin: 55,
            totalMins: 1540,
            totalHrs: 25.7,
            credits: 5
          }
        ]
      },
      {
        ID: 'BUS301',
        mou_id: mous[2]._id,
        courseName: 'Digital Marketing Strategies',
        organization: 'Business Academy',
        duration: '2 months',
        indoorCredits: 10,
        outdoorCredits: 5,
        field: fields[2]._id,
        startDate: new Date('2024-07-01'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 16,
            periodsMin: 40,
            totalMins: 640,
            totalHrs: 10.7,
            credits: 2
          }
        ]
      },
      {
        ID: 'BUS302',
        mou_id: mous[2]._id,
        courseName: 'Entrepreneurship Development',
        organization: 'Business Academy',
        duration: '3 months',
        indoorCredits: 14,
        outdoorCredits: 7,
        field: fields[2]._id,
        startDate: new Date('2024-08-01'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 20,
            periodsMin: 45,
            totalMins: 900,
            totalHrs: 15,
            credits: 3
          }
        ]
      },
      {
        ID: 'BUS303',
        mou_id: mous[2]._id,
        courseName: 'Financial Management',
        organization: 'Business Academy',
        duration: '4 months',
        indoorCredits: 18,
        outdoorCredits: 9,
        field: fields[2]._id,
        startDate: new Date('2024-09-01'),
        completionStatus: 'upcoming',
        subjects: [
          {
            noOfPeriods: 24,
            periodsMin: 50,
            totalMins: 1200,
            totalHrs: 20,
            credits: 4
          }
        ]
      },
      // Ongoing Courses
      {
        ID: 'MED401',
        mou_id: mous[3]._id,
        courseName: 'Biotechnology Fundamentals',
        organization: 'Medical Research Center',
        duration: '6 months',
        indoorCredits: 25,
        outdoorCredits: 15,
        field: fields[3]._id,
        startDate: new Date('2024-01-15'),
        completionStatus: 'ongoing',
        subjects: [
          {
            noOfPeriods: 30,
            periodsMin: 55,
            totalMins: 1650,
            totalHrs: 27.5,
            credits: 5
          }
        ]
      },
      {
        ID: 'MED402',
        mou_id: mous[3]._id,
        courseName: 'Clinical Research Methods',
        organization: 'Medical Research Center',
        duration: '5 months',
        indoorCredits: 20,
        outdoorCredits: 12,
        field: fields[3]._id,
        startDate: new Date('2024-02-15'),
        completionStatus: 'ongoing',
        subjects: [
          {
            noOfPeriods: 26,
            periodsMin: 50,
            totalMins: 1300,
            totalHrs: 21.7,
            credits: 4
          }
        ]
      },
      {
        ID: 'MED403',
        mou_id: mous[3]._id,
        courseName: 'Public Health Epidemiology',
        organization: 'Medical Research Center',
        duration: '4 months',
        indoorCredits: 16,
        outdoorCredits: 8,
        field: fields[3]._id,
        startDate: new Date('2024-03-15'),
        completionStatus: 'ongoing',
        subjects: [
          {
            noOfPeriods: 20,
            periodsMin: 45,
            totalMins: 900,
            totalHrs: 15,
            credits: 3
          }
        ]
      },
      {
        ID: 'ART501',
        mou_id: mous[4]._id,
        courseName: 'Modern Literature Analysis',
        organization: 'Liberal Arts College',
        duration: '3 months',
        indoorCredits: 12,
        outdoorCredits: 3,
        field: fields[4]._id,
        startDate: new Date('2024-03-01'),
        completionStatus: 'ongoing',
        subjects: [
          {
            noOfPeriods: 18,
            periodsMin: 45,
            totalMins: 810,
            totalHrs: 13.5,
            credits: 3
          }
        ]
      },
      {
        ID: 'ART502',
        mou_id: mous[4]._id,
        courseName: 'Philosophy and Ethics',
        organization: 'Liberal Arts College',
        duration: '4 months',
        indoorCredits: 14,
        outdoorCredits: 4,
        field: fields[4]._id,
        startDate: new Date('2024-04-01'),
        completionStatus: 'ongoing',
        subjects: [
          {
            noOfPeriods: 22,
            periodsMin: 50,
            totalMins: 1100,
            totalHrs: 18.3,
            credits: 4
          }
        ]
      },
      {
        ID: 'CS201',
        mou_id: mous[0]._id,
        courseName: 'Machine Learning Applications',
        organization: 'Tech University',
        duration: '4 months',
        indoorCredits: 18,
        outdoorCredits: 7,
        field: fields[0]._id,
        startDate: new Date('2024-02-01'),
        completionStatus: 'ongoing',
        subjects: [
          {
            noOfPeriods: 22,
            periodsMin: 50,
            totalMins: 1100,
            totalHrs: 18.3,
            credits: 4
          }
        ]
      },
      {
        ID: 'CS202',
        mou_id: mous[0]._id,
        courseName: 'Web Development Bootcamp',
        organization: 'Tech University',
        duration: '3 months',
        indoorCredits: 15,
        outdoorCredits: 6,
        field: fields[0]._id,
        startDate: new Date('2024-03-01'),
        completionStatus: 'ongoing',
        subjects: [
          {
            noOfPeriods: 20,
            periodsMin: 45,
            totalMins: 900,
            totalHrs: 15,
            credits: 3
          }
        ]
      },
      {
        ID: 'ENG203',
        mou_id: mous[1]._id,
        courseName: 'Renewable Energy Systems',
        organization: 'Engineering Institute',
        duration: '5 months',
        indoorCredits: 24,
        outdoorCredits: 12,
        field: fields[1]._id,
        startDate: new Date('2024-01-15'),
        completionStatus: 'ongoing',
        subjects: [
          {
            noOfPeriods: 30,
            periodsMin: 55,
            totalMins: 1650,
            totalHrs: 27.5,
            credits: 5
          }
        ]
      },
      {
        ID: 'BUS304',
        mou_id: mous[2]._id,
        courseName: 'Strategic Management',
        organization: 'Business Academy',
        duration: '4 months',
        indoorCredits: 16,
        outdoorCredits: 8,
        field: fields[2]._id,
        startDate: new Date('2024-02-01'),
        completionStatus: 'ongoing',
        subjects: [
          {
            noOfPeriods: 20,
            periodsMin: 45,
            totalMins: 900,
            totalHrs: 15,
            credits: 3
          }
        ]
      },
      // Completed Courses
      {
        ID: 'ENG101',
        mou_id: mous[1]._id,
        courseName: 'Basic Engineering Principles',
        organization: 'Engineering Institute',
        duration: '2 months',
        indoorCredits: 8,
        outdoorCredits: 4,
        field: fields[1]._id,
        startDate: new Date('2023-10-01'),
        completionStatus: 'completed',
        subjects: [
          {
            noOfPeriods: 12,
            periodsMin: 40,
            totalMins: 480,
            totalHrs: 8,
            credits: 2
          }
        ]
      },
      {
        ID: 'ENG102',
        mou_id: mous[1]._id,
        courseName: 'Mechanical Design Fundamentals',
        organization: 'Engineering Institute',
        duration: '3 months',
        indoorCredits: 12,
        outdoorCredits: 6,
        field: fields[1]._id,
        startDate: new Date('2023-11-01'),
        completionStatus: 'completed',
        subjects: [
          {
            noOfPeriods: 16,
            periodsMin: 45,
            totalMins: 720,
            totalHrs: 12,
            credits: 3
          }
        ]
      },
      {
        ID: 'BUS101',
        mou_id: mous[2]._id,
        courseName: 'Business Fundamentals',
        organization: 'Business Academy',
        duration: '3 months',
        indoorCredits: 12,
        outdoorCredits: 6,
        field: fields[2]._id,
        startDate: new Date('2023-11-01'),
        completionStatus: 'completed',
        subjects: [
          {
            noOfPeriods: 16,
            periodsMin: 45,
            totalMins: 720,
            totalHrs: 12,
            credits: 3
          }
        ]
      },
      {
        ID: 'BUS102',
        mou_id: mous[2]._id,
        courseName: 'Marketing Principles',
        organization: 'Business Academy',
        duration: '2 months',
        indoorCredits: 10,
        outdoorCredits: 5,
        field: fields[2]._id,
        startDate: new Date('2023-12-01'),
        completionStatus: 'completed',
        subjects: [
          {
            noOfPeriods: 14,
            periodsMin: 40,
            totalMins: 560,
            totalHrs: 9.3,
            credits: 2
          }
        ]
      },
      {
        ID: 'MED101',
        mou_id: mous[3]._id,
        courseName: 'Introduction to Medical Research',
        organization: 'Medical Research Center',
        duration: '4 months',
        indoorCredits: 16,
        outdoorCredits: 8,
        field: fields[3]._id,
        startDate: new Date('2023-09-01'),
        completionStatus: 'completed',
        subjects: [
          {
            noOfPeriods: 20,
            periodsMin: 50,
            totalMins: 1000,
            totalHrs: 16.7,
            credits: 3
          }
        ]
      },
      {
        ID: 'MED102',
        mou_id: mous[3]._id,
        courseName: 'Basic Laboratory Techniques',
        organization: 'Medical Research Center',
        duration: '3 months',
        indoorCredits: 14,
        outdoorCredits: 7,
        field: fields[3]._id,
        startDate: new Date('2023-10-01'),
        completionStatus: 'completed',
        subjects: [
          {
            noOfPeriods: 18,
            periodsMin: 45,
            totalMins: 810,
            totalHrs: 13.5,
            credits: 3
          }
        ]
      },
      {
        ID: 'ART101',
        mou_id: mous[4]._id,
        courseName: 'Classical Literature',
        organization: 'Liberal Arts College',
        duration: '2 months',
        indoorCredits: 8,
        outdoorCredits: 2,
        field: fields[4]._id,
        startDate: new Date('2023-12-01'),
        completionStatus: 'completed',
        subjects: [
          {
            noOfPeriods: 10,
            periodsMin: 45,
            totalMins: 450,
            totalHrs: 7.5,
            credits: 2
          }
        ]
      },
      {
        ID: 'ART102',
        mou_id: mous[4]._id,
        courseName: 'Creative Writing Workshop',
        organization: 'Liberal Arts College',
        duration: '3 months',
        indoorCredits: 10,
        outdoorCredits: 3,
        field: fields[4]._id,
        startDate: new Date('2023-11-01'),
        completionStatus: 'completed',
        subjects: [
          {
            noOfPeriods: 15,
            periodsMin: 45,
            totalMins: 675,
            totalHrs: 11.3,
            credits: 2
          }
        ]
      },
      {
        ID: 'CS001',
        mou_id: mous[0]._id,
        courseName: 'Programming Fundamentals',
        organization: 'Tech University',
        duration: '3 months',
        indoorCredits: 12,
        outdoorCredits: 4,
        field: fields[0]._id,
        startDate: new Date('2023-09-01'),
        completionStatus: 'completed',
        subjects: [
          {
            noOfPeriods: 16,
            periodsMin: 45,
            totalMins: 720,
            totalHrs: 12,
            credits: 3
          }
        ]
      },
      {
        ID: 'CS002',
        mou_id: mous[0]._id,
        courseName: 'Database Management Systems',
        organization: 'Tech University',
        duration: '4 months',
        indoorCredits: 16,
        outdoorCredits: 6,
        field: fields[0]._id,
        startDate: new Date('2023-10-01'),
        completionStatus: 'completed',
        subjects: [
          {
            noOfPeriods: 20,
            periodsMin: 50,
            totalMins: 1000,
            totalHrs: 16.7,
            credits: 4
          }
        ]
      }
    ]);
    console.log('Courses created:', courses.length);

    console.log('\n=== DUMMY DATA CREATION COMPLETE ===');
    console.log('Fields:', fields.length);
    console.log('Schools:', schools.length);
    console.log('MOUs:', mous.length);
    console.log('Courses:', courses.length);
    
    // Display some sample data
    console.log('\n=== SAMPLE DATA ===');
    console.log('Sample School:', schools[0]);
    console.log('Sample MOU:', mous[0]);
    console.log('Sample Course:', courses[0]);

  } catch (error) {
    console.error('Error creating dummy data:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
async function main() {
  await deleteAllData();
  await createDummyData();
}

main(); 