const mongoose = require('mongoose');
const CertificateCourseMapping = require('./model3/certificate_course_mapping');
const BprndCertificate = require('./model3/bprnd_certificate');
const bprnd_certification_claim = require('./model3/bprnd_certification_claim');
const CourseHistory = require('./model3/course_history');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testAdminApprovalIntegration() {
  try {
    console.log('🧪 Testing Admin Approval Integration with Certificate Course Mapping...\n');

    // Test 1: Check if certificate course mappings are being created
    console.log('📋 Test 1: Checking for existing certificate course mappings...');
    
    const existingMappings = await CertificateCourseMapping.find({}).populate('certificateId', 'certificateNo');
    
    if (existingMappings.length === 0) {
      console.log('ℹ️ No certificate course mappings found in database');
      console.log('   This is expected if no admin approvals have been processed yet');
    } else {
      console.log(`✅ Found ${existingMappings.length} certificate course mappings:`);
      
      existingMappings.forEach((mapping, index) => {
        const totalCreditsUsed = mapping.courses.reduce((sum, course) => sum + course.creditsUsed, 0);
        
        console.log(`   Mapping ${index + 1}:`);
        console.log(`     Certificate: ${mapping.certificateId?.certificateNo || 'N/A'}`);
        console.log(`     Student: ${mapping.studentId}`);
        console.log(`     Umbrella: ${mapping.umbrellaKey}`);
        console.log(`     Qualification: ${mapping.qualification}`);
        console.log(`     Courses: ${mapping.courses.length}`);
        console.log(`     Credits Required: ${mapping.totalCreditsRequired}`);
        console.log(`     Credits Used: ${totalCreditsUsed}`);
        console.log(`     Remaining: ${Math.max(0, mapping.totalCreditsRequired - totalCreditsUsed)}`);
        console.log('     ---');
      });
    }

    // Test 2: Check if mappings correspond to existing certificates
    console.log('\n🔍 Test 2: Verifying mapping-certificate relationships...');
    
    const certificates = await BprndCertificate.find({});
    console.log(`📊 Found ${certificates.length} BPRND certificates in database`);
    
    if (certificates.length > 0) {
      for (const certificate of certificates) {
        const mapping = await CertificateCourseMapping.findOne({ certificateId: certificate._id });
        
        if (mapping) {
          console.log(`✅ Certificate ${certificate.certificateNo} has a course mapping`);
          console.log(`   Mapped ${mapping.courses.length} courses`);
        } else {
          console.log(`⚠️ Certificate ${certificate.certificateNo} has NO course mapping`);
          console.log(`   This might indicate the mapping creation failed or was not implemented yet`);
        }
      }
    }

    // Test 3: Check data integrity of mappings
    console.log('\n🔒 Test 3: Checking data integrity of mappings...');
    
    if (existingMappings.length > 0) {
      for (const mapping of existingMappings) {
        // Check if all required fields are present
        const requiredFields = ['certificateId', 'studentId', 'umbrellaKey', 'qualification', 'totalCreditsRequired', 'courses'];
        const missingFields = requiredFields.filter(field => !mapping[field]);
        
        if (missingFields.length > 0) {
          console.log(`❌ Mapping ${mapping._id} is missing fields: ${missingFields.join(', ')}`);
        } else {
          console.log(`✅ Mapping ${mapping._id} has all required fields`);
        }
        
        // Check if courses array is properly structured
        if (mapping.courses && mapping.courses.length > 0) {
          const courseRequiredFields = ['courseId', 'courseName', 'organization', 'theoryHours', 'practicalHours', 'totalCredits', 'creditsUsed', 'completionDate'];
          
          mapping.courses.forEach((course, courseIndex) => {
            const missingCourseFields = courseRequiredFields.filter(field => course[field] === undefined);
            if (missingCourseFields.length > 0) {
              console.log(`❌ Course ${courseIndex} in mapping ${mapping._id} is missing fields: ${missingCourseFields.join(', ')}`);
            }
          });
        }
      }
    }

    // Test 4: Check credit calculations
    console.log('\n💎 Test 4: Verifying credit calculations...');
    
    if (existingMappings.length > 0) {
      for (const mapping of existingMappings) {
        const totalCreditsUsed = mapping.courses.reduce((sum, course) => sum + course.creditsUsed, 0);
        const remainingCredits = Math.max(0, mapping.totalCreditsRequired - totalCreditsUsed);
        
        console.log(`📊 Mapping ${mapping._id}:`);
        console.log(`   Required: ${mapping.totalCreditsRequired}`);
        console.log(`   Used: ${totalCreditsUsed}`);
        console.log(`   Remaining: ${remainingCredits}`);
        
        // Check if any course is using more credits than available
        const invalidCourses = mapping.courses.filter(course => course.creditsUsed > course.totalCredits);
        if (invalidCourses.length > 0) {
          console.log(`❌ Found ${invalidCourses.length} courses with invalid credit usage`);
        } else {
          console.log(`✅ All courses have valid credit usage`);
        }
      }
    }

    console.log('\n🎉 Admin approval integration testing completed!');
    
    if (existingMappings.length === 0) {
      console.log('\n💡 Next steps:');
      console.log('   1. Process an admin approval through the UI/API');
      console.log('   2. Check if a certificate course mapping is created');
      console.log('   3. Verify the mapping contains correct course and credit information');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testAdminApprovalIntegration();
