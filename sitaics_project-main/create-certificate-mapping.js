const mongoose = require('mongoose');
const CertificateCourseMapping = require('./model3/certificate_course_mapping');
const BprndCertificate = require('./model3/bprnd_certificate');
const CourseHistory = require('./model3/course_history');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createSampleCertificateMapping() {
  try {
    console.log('🔧 Creating Sample Certificate Course Mapping...\n');

    // Sample data for demonstration
    const sampleMapping = new CertificateCourseMapping({
      certificateId: new mongoose.Types.ObjectId(), // Replace with actual certificate ID
      studentId: new mongoose.Types.ObjectId(), // Replace with actual student ID
      umbrellaKey: 'Cyber_Security',
      qualification: 'certificate',
      totalCreditsRequired: 30,
      courses: [
        {
          courseId: new mongoose.Types.ObjectId(), // Replace with actual course ID
          courseName: 'Introduction to Cybersecurity',
          organization: 'Tech Institute',
          theoryHours: 20,
          practicalHours: 10,
          totalCredits: 15,
          creditsUsed: 15, // Using all credits from this course
          completionDate: new Date('2024-01-15'),
          pdfPath: '/uploads/pdfs/course1.pdf',
          pdfFileName: 'cybersecurity_intro.pdf'
        },
        {
          courseId: new mongoose.Types.ObjectId(), // Replace with actual course ID
          courseName: 'Network Security Fundamentals',
          organization: 'Security Academy',
          theoryHours: 15,
          practicalHours: 15,
          totalCredits: 12,
          creditsUsed: 12, // Using all credits from this course
          completionDate: new Date('2024-02-20'),
          pdfPath: '/uploads/pdfs/course2.pdf',
          pdfFileName: 'network_security.pdf'
        },
        {
          courseId: new mongoose.Types.ObjectId(), // Replace with actual course ID
          courseName: 'Advanced Security Practices',
          organization: 'Cyber Defense Institute',
          theoryHours: 10,
          practicalHours: 5,
          totalCredits: 8,
          creditsUsed: 3, // Only using 3 out of 8 credits (partial usage)
          completionDate: new Date('2024-03-10'),
          pdfPath: '/uploads/pdfs/course3.pdf',
          pdfFileName: 'advanced_security.pdf'
        }
      ]
    });

    await sampleMapping.save();
    console.log('✅ Sample certificate mapping created successfully!');
    console.log(`📊 Certificate ID: ${sampleMapping.certificateId}`);
    console.log(`👤 Student ID: ${sampleMapping.studentId}`);
    console.log(`🎯 Umbrella: ${sampleMapping.umbrellaKey}`);
    console.log(`📚 Total Courses: ${sampleMapping.courses.length}`);
    console.log(`💎 Credits Required: ${sampleMapping.totalCreditsRequired}`);
    
    // Calculate total credits used manually
    const totalCreditsUsed = sampleMapping.courses.reduce((sum, course) => sum + course.creditsUsed, 0);
    console.log(`💎 Total Credits Used: ${totalCreditsUsed}`);
    console.log(`⏳ Remaining Credits: ${Math.max(0, sampleMapping.totalCreditsRequired - totalCreditsUsed)}`);

    console.log('\n🎉 Certificate Course Mapping demonstration completed!');

  } catch (error) {
    console.error('❌ Error creating sample mapping:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Function to create mapping from existing certificate and courses
async function createMappingFromExisting(certificateId, courseIds) {
  try {
    console.log('🔧 Creating mapping from existing certificate...\n');

    // Get the certificate
    const certificate = await BprndCertificate.findById(certificateId);
    if (!certificate) {
      throw new Error('Certificate not found');
    }

    // Get the courses
    const courses = await CourseHistory.find({ _id: { $in: courseIds } });
    if (courses.length === 0) {
      throw new Error('No courses found');
    }

    // Create the mapping
    const mapping = new CertificateCourseMapping({
      certificateId: certificate._id,
      studentId: certificate.studentId,
      umbrellaKey: certificate.umbrellaKey,
      qualification: certificate.qualification,
      totalCreditsRequired: 30, // Set based on your requirements
      courses: courses.map(course => ({
        courseId: course._id,
        courseName: course.name,
        organization: course.organization,
        theoryHours: course.theoryHours,
        practicalHours: course.practicalHours,
        totalCredits: course.creditsEarned,
        creditsUsed: course.creditsEarned, // Initially use all credits
        completionDate: course.createdAt,
        pdfPath: course.pdfPath,
        pdfFileName: course.pdfFileName
      }))
    });

    await mapping.save();
    console.log('✅ Mapping created from existing certificate and courses!');
    return mapping;

  } catch (error) {
    console.error('❌ Error creating mapping from existing data:', error);
    throw error;
  }
}

// Function to find and display all mappings
async function displayAllMappings() {
  try {
    console.log('🔍 Displaying all certificate course mappings...\n');

    const mappings = await CertificateCourseMapping.find({}).populate('certificateId', 'certificateNo');
    
    if (mappings.length === 0) {
      console.log('❌ No mappings found in database');
      return;
    }

    mappings.forEach((mapping, index) => {
      const totalCreditsUsed = mapping.courses.reduce((sum, course) => sum + course.creditsUsed, 0);
      
      console.log(`📋 Mapping ${index + 1}:`);
      console.log(`   Certificate: ${mapping.certificateId?.certificateNo || 'N/A'}`);
      console.log(`   Student: ${mapping.studentId}`);
      console.log(`   Umbrella: ${mapping.umbrellaKey}`);
      console.log(`   Qualification: ${mapping.qualification}`);
      console.log(`   Courses: ${mapping.courses.length}`);
      console.log(`   Credits Required: ${mapping.totalCreditsRequired}`);
      console.log(`   Credits Used: ${totalCreditsUsed}`);
      console.log(`   Remaining: ${Math.max(0, mapping.totalCreditsRequired - totalCreditsUsed)}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('❌ Error displaying mappings:', error);
  }
}

// Export functions for use in other scripts
module.exports = {
  createSampleCertificateMapping,
  createMappingFromExisting,
  displayAllMappings
};

// Run the sample if this file is executed directly
if (require.main === module) {
  createSampleCertificateMapping();
}
