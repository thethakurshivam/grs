const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sitaics', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Import the model
const CreditCalculation = require('./model3/bprndstudents');

async function testCustomIDGeneration() {
  try {
    console.log('🧪 Testing Custom ID Generation...\n');
    
    // Test 1: Create a new student document
    console.log('📝 Test 1: Creating new student document...');
    const newStudent = new CreditCalculation({
      Name: 'John Doe',
      Designation: 'Police Officer',
      State: 'Delhi',
      Training_Topic: 'Cyber Security',
      Per_session_minutes: 60,
      Theory_sessions: 10,
      Practical_sessions: 5,
      Theory_Hours: 10,
      Practical_Hours: 5,
      Total_Hours: 15,
      Theory_Credits: 10,
      Practical_Credits: 5,
      Total_Credits: 15,
      date_of_birth: new Date('1990-01-01'),
      email: 'john.doe@example.com',
      Umbrella: 'Cyber Security',
      Cyber_Security: 25.5,
      Criminology: 0,
      Military_Law: 0,
      Police_Administration: 0,
      Defence: 0,
      Forensics: 0
    });
    
    // Save the document (this will trigger the custom ID middleware)
    const savedStudent = await newStudent.save();
    console.log('✅ Student saved successfully!');
    console.log('🆔 Custom ID generated:', savedStudent._id);
    console.log('📅 Created at:', savedStudent.createdAt);
    console.log('👤 Student name:', savedStudent.Name);
    console.log('');
    
    // Test 2: Create another student with different name
    console.log('📝 Test 2: Creating another student document...');
    const anotherStudent = new CreditCalculation({
      Name: 'Jane Smith',
      Designation: 'Detective',
      State: 'Mumbai',
      Training_Topic: 'Forensics',
      Per_session_minutes: 60,
      Theory_sessions: 8,
      Practical_sessions: 6,
      Theory_Hours: 8,
      Practical_Hours: 6,
      Total_Hours: 14,
      Theory_Credits: 8,
      Practical_Credits: 6,
      Total_Credits: 14,
      date_of_birth: new Date('1985-05-15'),
      email: 'jane.smith@example.com',
      Umbrella: 'Forensics',
      Cyber_Security: 0,
      Criminology: 0,
      Military_Law: 0,
      Police_Administration: 0,
      Defence: 0,
      Forensics: 30.0
    });
    
    const savedAnotherStudent = await anotherStudent.save();
    console.log('✅ Another student saved successfully!');
    console.log('🆔 Custom ID generated:', savedAnotherStudent._id);
    console.log('📅 Created at:', savedAnotherStudent.createdAt);
    console.log('👤 Student name:', savedAnotherStudent.Name);
    console.log('');
    
    // Test 3: Create a student with special characters in name
    console.log('📝 Test 3: Creating student with special characters in name...');
    const specialCharStudent = new CreditCalculation({
      Name: 'Raj Kumar Singh!@#$%',
      Designation: 'Inspector',
      State: 'Kolkata',
      Training_Topic: 'Military Law',
      Per_session_minutes: 60,
      Theory_sessions: 12,
      Practical_sessions: 4,
      Theory_Hours: 12,
      Practical_Hours: 4,
      Total_Hours: 16,
      Theory_Credits: 12,
      Practical_Credits: 4,
      Total_Credits: 16,
      date_of_birth: new Date('1988-12-25'),
      email: 'raj.kumar@example.com',
      Umbrella: 'Military Law',
      Cyber_Security: 0,
      Criminology: 0,
      Military_Law: 35.0,
      Police_Administration: 0,
      Defence: 0,
      Forensics: 0
    });
    
    const savedSpecialCharStudent = await specialCharStudent.save();
    console.log('✅ Special character student saved successfully!');
    console.log('🆔 Custom ID generated:', savedSpecialCharStudent._id);
    console.log('📅 Created at:', savedSpecialCharStudent.createdAt);
    console.log('👤 Student name:', savedSpecialCharStudent.Name);
    console.log('');
    
    // Test 4: Create a student with very long name
    console.log('📝 Test 4: Creating student with very long name...');
    const longNameStudent = new CreditCalculation({
      Name: 'This Is A Very Long Student Name That Exceeds Twenty Characters',
      Designation: 'Superintendent',
      State: 'Chennai',
      Training_Topic: 'Police Administration',
      Per_session_minutes: 60,
      Theory_sessions: 15,
      Practical_sessions: 3,
      Theory_Hours: 15,
      Practical_Hours: 3,
      Total_Hours: 18,
      Theory_Credits: 15,
      Practical_Credits: 3,
      Total_Credits: 18,
      date_of_birth: new Date('1982-08-10'),
      email: 'long.name@example.com',
      Umbrella: 'Police Administration',
      Cyber_Security: 0,
      Criminology: 0,
      Military_Law: 0,
      Police_Administration: 40.0,
      Defence: 0,
      Forensics: 0
    });
    
    const savedLongNameStudent = await longNameStudent.save();
    console.log('✅ Long name student saved successfully!');
    console.log('🆔 Custom ID generated:', savedLongNameStudent._id);
    console.log('📅 Created at:', savedLongNameStudent.createdAt);
    console.log('👤 Student name:', savedLongNameStudent.Name);
    console.log('');
    
    // Display all generated IDs
    console.log('📊 Summary of Generated Custom IDs:');
    console.log('=====================================');
    console.log(`1. ${savedStudent.Name}: ${savedStudent._id}`);
    console.log(`2. ${savedAnotherStudent.Name}: ${savedAnotherStudent._id}`);
    console.log(`3. ${savedSpecialCharStudent.Name}: ${savedSpecialCharStudent._id}`);
    console.log(`4. ${savedLongNameStudent.Name}: ${savedLongNameStudent._id}`);
    console.log('');
    
    // Test 5: Verify ID format
    console.log('🔍 ID Format Verification:');
    console.log('==========================');
    const allStudents = [savedStudent, savedAnotherStudent, savedSpecialCharStudent, savedLongNameStudent];
    
    allStudents.forEach((student, index) => {
      const id = student._id;
      const parts = id.split('_');
      
      console.log(`\nStudent ${index + 1}: ${student.Name}`);
      console.log(`ID: ${id}`);
      console.log(`Prefix: ${parts[0]}`);
      console.log(`Name part: ${parts[1]}`);
      console.log(`Date part: ${parts[2]}`);
      console.log(`Time part: ${parts[3]}`);
      
      // Validate format
      const isValidFormat = parts.length === 4 && 
                           parts[0] === 'rrubprndt' &&
                           parts[2].length === 8 && // YYYYMMDD
                           parts[3].length === 6;   // HHMMSS
      
      console.log(`✅ Format valid: ${isValidFormat}`);
    });
    
    console.log('\n🎉 Custom ID generation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testCustomIDGeneration();
