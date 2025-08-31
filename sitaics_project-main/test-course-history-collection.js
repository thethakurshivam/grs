const mongoose = require('mongoose');
const CourseHistory = require('./model3/course_history');

async function testCourseHistoryCollection() {
  try {
    console.log('🧪 Testing CourseHistory collection...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/sitaics', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('🔍 CourseHistory model info:');
    console.log('  - Model name:', CourseHistory.modelName);
    console.log('  - Collection name:', CourseHistory.collection.name);
    console.log('  - Collection namespace:', CourseHistory.collection.namespace);
    
    // Create a test entry
    const testEntry = new CourseHistory({
      studentId: new mongoose.Types.ObjectId(),
      name: 'Test Course History Collection',
      organization: 'Test Organization',
      discipline: 'Test Discipline',
      theoryHours: 1,
      practicalHours: 1,
      totalHours: 2,
      noOfDays: 1,
      theoryCredits: 1,
      practicalCredits: 1,
      creditsEarned: 2,
      count: 2,
      certificateContributed: false
    });
    
    console.log('💾 Saving test entry...');
    await testEntry.save();
    console.log('✅ Test entry saved with ID:', testEntry._id);
    
    // Check which collection it was saved to
    const db = mongoose.connection.db;
    
    console.log('🔍 Checking coursehistories collection...');
    const coursehistoriesCount = await db.collection('coursehistories').countDocuments({ _id: testEntry._id });
    console.log('  - Found in coursehistories:', coursehistoriesCount > 0);
    
    console.log('🔍 Checking course_history collection...');
    const courseHistoryCount = await db.collection('course_history').countDocuments({ _id: testEntry._id });
    console.log('  - Found in course_history:', courseHistoryCount > 0);
    
    // Clean up - remove test entry
    await CourseHistory.findByIdAndDelete(testEntry._id);
    console.log('🧹 Cleaned up test entry');
    
    await mongoose.connection.close();
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

testCourseHistoryCollection();
