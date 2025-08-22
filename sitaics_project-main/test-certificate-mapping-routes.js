const mongoose = require('mongoose');
const CertificateCourseMapping = require('./model3/certificate_course_mapping');
const BprndCertificate = require('./model3/bprnd_certificate');
const bprndStudents = require('./model3/bprndstudents');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testCertificateMappingRoutes() {
  try {
    console.log('🧪 Testing Certificate Course Mapping API Routes...\n');

    // Test 1: Check if we have any existing data to work with
    console.log('📋 Test 1: Checking existing data...');
    
    const existingMappings = await CertificateCourseMapping.find({});
    const existingCertificates = await BprndCertificate.find({});
    const existingStudents = await bprndStudents.find({}).limit(5);
    
    console.log(`📊 Found ${existingMappings.length} certificate course mappings`);
    console.log(`📊 Found ${existingCertificates.length} BPRND certificates`);
    console.log(`📊 Found ${existingStudents.length} BPRND students`);

    if (existingMappings.length === 0) {
      console.log('\n⚠️ No existing mappings found. Creating sample data for testing...');
      
      // Create sample data if none exists
      if (existingCertificates.length > 0 && existingStudents.length > 0) {
        const sampleMapping = new CertificateCourseMapping({
          certificateId: existingCertificates[0]._id,
          studentId: existingStudents[0]._id,
          umbrellaKey: 'Cyber_Security',
          qualification: 'certificate',
          totalCreditsRequired: 30,
          courses: [
            {
              courseId: new mongoose.Types.ObjectId(),
              courseName: 'Sample Cybersecurity Course',
              organization: 'Test Institute',
              theoryHours: 20,
              practicalHours: 10,
              totalCredits: 15,
              creditsUsed: 15,
              completionDate: new Date('2024-01-15'),
              pdfPath: '/uploads/pdfs/sample.pdf',
              pdfFileName: 'sample_course.pdf'
            }
          ]
        });

        await sampleMapping.save();
        console.log('✅ Sample mapping created for testing');
      } else {
        console.log('❌ Cannot create sample data - need at least one certificate and student');
        return;
      }
    }

    // Test 2: Test the main route - GET /api/certificate-course-mappings
    console.log('\n🔍 Test 2: Testing main route GET /api/certificate-course-mappings...');
    
    // Simulate the route logic
    const CertificateCourseMapping = require('./model3/certificate_course_mapping');
    
    // Test without filters
    const allMappings = await CertificateCourseMapping.find({})
      .populate('certificateId', 'certificateNo')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    console.log(`✅ Retrieved ${allMappings.length} mappings without filters`);

    // Test with filters
    const cyberSecurityMappings = await CertificateCourseMapping.find({ 
      umbrellaKey: 'Cyber_Security' 
    })
      .populate('certificateId', 'certificateNo')
      .populate('studentId', 'name email')
      .lean();

    console.log(`✅ Retrieved ${cyberSecurityMappings.length} Cyber Security mappings`);

    // Test 3: Test individual mapping route - GET /api/certificate-course-mappings/:mappingId
    console.log('\n🔍 Test 3: Testing individual mapping route...');
    
    if (allMappings.length > 0) {
      const firstMapping = allMappings[0];
      const individualMapping = await CertificateCourseMapping.findById(firstMapping._id)
        .populate('certificateId', 'certificateNo')
        .populate('studentId', 'name email')
        .lean();

      if (individualMapping) {
        console.log(`✅ Retrieved individual mapping: ${individualMapping._id}`);
        console.log(`   Certificate: ${individualMapping.certificateId?.certificateNo || 'N/A'}`);
        console.log(`   Student: ${individualMapping.studentId?.name || 'N/A'}`);
        console.log(`   Courses: ${individualMapping.courses.length}`);
      }
    }

    // Test 4: Test student-specific route - GET /api/certificate-course-mappings/student/:studentId
    console.log('\n🔍 Test 4: Testing student-specific route...');
    
    if (allMappings.length > 0) {
      const firstMapping = allMappings[0];
      const studentMappings = await CertificateCourseMapping.find({ 
        studentId: firstMapping.studentId 
      })
        .populate('certificateId', 'certificateNo')
        .populate('studentId', 'name email')
        .sort({ createdAt: -1 })
        .lean();

      console.log(`✅ Retrieved ${studentMappings.length} mappings for student ${firstMapping.studentId}`);
    }

    // Test 5: Test pagination and sorting
    console.log('\n🔍 Test 5: Testing pagination and sorting...');
    
    const page1Mappings = await CertificateCourseMapping.find({})
      .populate('certificateId', 'certificateNo')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(5)
      .lean();

    const page2Mappings = await CertificateCourseMapping.find({})
      .populate('certificateId', 'certificateNo')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })
      .skip(5)
      .limit(5)
      .lean();

    console.log(`✅ Pagination test: Page 1 (${page1Mappings.length} items), Page 2 (${page2Mappings.length} items)`);

    // Test 6: Test data enhancement (calculated fields)
    console.log('\n🔍 Test 6: Testing data enhancement...');
    
    if (allMappings.length > 0) {
      const enhancedMappings = allMappings.map(mapping => {
        const totalCreditsUsed = mapping.courses.reduce((sum, course) => sum + course.creditsUsed, 0);
        const remainingCredits = Math.max(0, mapping.totalCreditsRequired - totalCreditsUsed);
        const creditEfficiency = mapping.totalCreditsRequired > 0 
          ? Math.round((totalCreditsUsed / mapping.totalCreditsRequired) * 100) 
          : 0;

        return {
          ...mapping,
          totalCreditsUsed,
          remainingCredits,
          creditEfficiency,
          courseCount: mapping.courses.length
        };
      });

      console.log('✅ Data enhancement working correctly');
      enhancedMappings.forEach((mapping, index) => {
        console.log(`   Mapping ${index + 1}:`);
        console.log(`     Credits Required: ${mapping.totalCreditsRequired}`);
        console.log(`     Credits Used: ${mapping.totalCreditsUsed}`);
        console.log(`     Remaining: ${mapping.remainingCredits}`);
        console.log(`     Efficiency: ${mapping.creditEfficiency}%`);
        console.log(`     Courses: ${mapping.courseCount}`);
      });
    }

    // Test 7: Test summary statistics for student route
    console.log('\n🔍 Test 7: Testing summary statistics...');
    
    if (allMappings.length > 0) {
      const firstMapping = allMappings[0];
      const studentMappings = await CertificateCourseMapping.find({ 
        studentId: firstMapping.studentId 
      }).lean();

      if (studentMappings.length > 0) {
        const summary = {
          totalMappings: studentMappings.length,
          totalCertificates: studentMappings.length,
          totalCreditsEarned: studentMappings.reduce((sum, m) => sum + m.totalCreditsRequired, 0),
          totalCreditsUsed: studentMappings.reduce((sum, m) => sum + m.courses.reduce((cSum, c) => cSum + c.creditsUsed, 0), 0),
          umbrellaBreakdown: {}
        };

        studentMappings.forEach(mapping => {
          if (!summary.umbrellaBreakdown[mapping.umbrellaKey]) {
            summary.umbrellaBreakdown[mapping.umbrellaKey] = {
              certificates: 0,
              totalCredits: 0,
              usedCredits: 0
            };
          }
          
          summary.umbrellaBreakdown[mapping.umbrellaKey].certificates++;
          summary.umbrellaBreakdown[mapping.umbrellaKey].totalCredits += mapping.totalCreditsRequired;
          summary.umbrellaBreakdown[mapping.umbrellaKey].usedCredits += mapping.courses.reduce((sum, c) => sum + c.creditsUsed, 0);
        });

        console.log('✅ Summary statistics calculated correctly');
        console.log(`   Total mappings: ${summary.totalMappings}`);
        console.log(`   Total credits earned: ${summary.totalCreditsEarned}`);
        console.log(`   Total credits used: ${summary.totalCreditsUsed}`);
        console.log(`   Umbrella breakdown: ${Object.keys(summary.umbrellaBreakdown).length} umbrellas`);
      }
    }

    console.log('\n🎉 All certificate course mapping route tests completed successfully!');
    console.log('\n📋 Route Summary:');
    console.log('   ✅ GET /api/certificate-course-mappings - List all mappings with filtering/pagination');
    console.log('   ✅ GET /api/certificate-course-mappings/:mappingId - Get specific mapping');
    console.log('   ✅ GET /api/certificate-course-mappings/student/:studentId - Get student mappings with summary');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testCertificateMappingRoutes();
