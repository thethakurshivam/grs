const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/sitaics';

async function checkSpecificStudentCourseHistories() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('sitaics');
    const courseHistoriesCollection = db.collection('coursehistories');
    
    const studentId = '68a06aecb24bd983a3e92d4f';
    
    console.log(`🔍 Checking course history for student: ${studentId}`);
    
    // Method 1: Direct query
    const directQuery = await courseHistoriesCollection.find({ studentId: studentId }).toArray();
    console.log(`\n📚 Direct query results: ${directQuery.length} documents`);
    
    if (directQuery.length > 0) {
      directQuery.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.name} - ${doc.discipline} - ${doc.creditsEarned} credits`);
      });
    }
    
    // Method 2: Check data type of studentId
    console.log('\n🔍 Checking studentId data types in collection...');
    const sampleDocs = await courseHistoriesCollection.find({}).limit(3).toArray();
    sampleDocs.forEach((doc, index) => {
      console.log(`   Document ${index + 1}:`);
      console.log(`     studentId: ${doc.studentId} (type: ${typeof doc.studentId})`);
      console.log(`     studentId constructor: ${doc.studentId.constructor.name}`);
      if (doc.studentId.constructor.name === 'ObjectId') {
        console.log(`     studentId toString: ${doc.studentId.toString()}`);
      }
    });
    
    // Method 3: Try with ObjectId conversion
    console.log('\n🔍 Trying with ObjectId conversion...');
    try {
      const objectIdQuery = await courseHistoriesCollection.find({ 
        studentId: new ObjectId(studentId) 
      }).toArray();
      console.log(`   ObjectId query results: ${objectIdQuery.length} documents`);
      
      if (objectIdQuery.length > 0) {
        objectIdQuery.forEach((doc, index) => {
          console.log(`     ${index + 1}. ${doc.name} - ${doc.discipline} - ${doc.creditsEarned} credits`);
        });
      }
    } catch (error) {
      console.log(`   ❌ ObjectId conversion error: ${error.message}`);
    }
    
    // Method 4: Check if studentId is stored as string
    console.log('\n🔍 Checking if studentId is stored as string...');
    const stringQuery = await courseHistoriesCollection.find({ 
      studentId: studentId.toString() 
    }).toArray();
    console.log(`   String query results: ${stringQuery.length} documents`);
    
    // Method 5: Check all documents for this studentId (any format)
    console.log('\n🔍 Checking all documents for any format of this studentId...');
    const allDocs = await courseHistoriesCollection.find({}).toArray();
    const matchingDocs = allDocs.filter(doc => {
      const docStudentId = doc.studentId;
      if (typeof docStudentId === 'string') {
        return docStudentId === studentId;
      } else if (docStudentId.constructor.name === 'ObjectId') {
        return docStudentId.toString() === studentId;
      }
      return false;
    });
    
    console.log(`   Filtered results: ${matchingDocs.length} documents`);
    if (matchingDocs.length > 0) {
      matchingDocs.forEach((doc, index) => {
        console.log(`     ${index + 1}. ${doc.name} - ${doc.discipline} - ${doc.creditsEarned} credits`);
      });
    }
    
    // Method 6: Check if there are any documents with similar studentId
    console.log('\n🔍 Checking for similar studentIds...');
    const similarDocs = allDocs.filter(doc => {
      const docStudentId = doc.studentId;
      const docIdStr = typeof docStudentId === 'string' ? docStudentId : docStudentId.toString();
      return docIdStr.includes(studentId.slice(-8)); // Check last 8 characters
    });
    
    console.log(`   Similar studentId results: ${similarDocs.length} documents`);
    if (similarDocs.length > 0) {
      similarDocs.forEach((doc, index) => {
        const docStudentId = doc.studentId;
        const docIdStr = typeof docStudentId === 'string' ? docStudentId : docStudentId.toString();
        console.log(`     ${index + 1}. StudentId: ${docIdStr} - ${doc.name} - ${doc.discipline}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkSpecificStudentCourseHistories();
