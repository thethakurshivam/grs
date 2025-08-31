const mongoose = require('mongoose');
const CourseHistory = require('./model3/course_history');
const bprndStudents = require('./model3/bprndstudents');

async function testBulkImportCourseHistory() {
  try {
    console.log('🧪 Testing CourseHistory creation with bulk import data structure...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/sitaics', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Create a test student first (to get a valid studentId)
    const testStudent = new bprndStudents({
      Name: 'Test Student for Course History',
      email: `test.coursehistory.${Date.now()}@example.com`,
      password: 'password123',
      Designation: 'Test Officer',
      State: 'Test State',
      Organization: 'Test Organization',
      Umbrella: 'Border Management',
      Training_Topic: 'Test Training Topic',
      Per_session_minutes: 0,
      Theory_sessions: 0,
      Practical_sessions: 0,
      Theory_Hours: 1,
      Practical_Hours: 1,
      Total_Hours: 2,
      Theory_Credits: 1,
      Practical_Credits: 1,
      Total_Credits: 2,
      date_of_birth: new Date('1990-01-01'),
      Tourism_Police: 0,
      Women_in_Security_and_Police: 0,
      Traffic_Management_and_Road_Safety: 0,
      Border_Management: 0,
      Disaster_Risk_Reduction: 0,
      OSI_Model: 0,
      Social_Media_Security: 0,
      Cyber_Threat_Intelligence: 0,
      Cyber_Security: 0,
      Cyber_Law: 0,
      Forensics_Psychology: 0,
      Gender_Sensitisation: 0,
      Behavioral_Sciences: 0,
    });
    
    await testStudent.save();
    console.log('✅ Test student created with ID:', testStudent._id);
    
    // Now create course history with EXACT same structure as bulk import
    const normalizedRow = {
      Training_Topic: 'Test Training Topic',
      Organization: 'Test Organization',
      Theory_Hours: 1,
      Practical_Hours: 1,
      Total_Hours: 2,
      Theory_Credits: 1,
      Practical_Credits: 1,
      Total_Credits: 2
    };
    const umbrella = 'Border Management';
    
    console.log('🔍 Creating course history entry with bulk import structure...');
    
    const courseHistoryEntry = new CourseHistory({
      studentId: testStudent._id,
      name: normalizedRow.Training_Topic,
      organization: normalizedRow.Organization,
      discipline: umbrella,
      theoryHours: normalizedRow.Theory_Hours,
      practicalHours: normalizedRow.Practical_Hours,
      totalHours: normalizedRow.Total_Hours,
      noOfDays: 1, // Default to 1 day for now
      theoryCredits: normalizedRow.Theory_Credits,
      practicalCredits: normalizedRow.Practical_Credits,
      creditsEarned: normalizedRow.Total_Credits,
      count: normalizedRow.Total_Credits, // Same value as Total Credits
      certificateContributed: false
    });
    
    console.log('🔍 Course history data before save:', JSON.stringify(courseHistoryEntry.toObject(), null, 2));
    
    try {
      await courseHistoryEntry.save();
      console.log('✅ Course history entry saved with ID:', courseHistoryEntry._id);
      
      // Verify it was saved to the correct collection
      const db = mongoose.connection.db;
      const savedEntry = await db.collection('coursehistories').findOne({ _id: courseHistoryEntry._id });
      if (savedEntry) {
        console.log('✅ Verified: Entry found in coursehistories collection');
        console.log('🔍 Saved entry:', JSON.stringify(savedEntry, null, 2));
      } else {
        console.log('❌ Entry NOT found in coursehistories collection');
      }
      
    } catch (saveError) {
      console.error('❌ Failed to save course history entry:', saveError);
      console.error('❌ Validation errors:', saveError.errors);
    }
    
    // Clean up
    await bprndStudents.findByIdAndDelete(testStudent._id);
    if (courseHistoryEntry._id) {
      await CourseHistory.findByIdAndDelete(courseHistoryEntry._id);
    }
    console.log('🧹 Cleaned up test data');
    
    await mongoose.connection.close();
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

testBulkImportCourseHistory();
