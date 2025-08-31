const mongoose = require('mongoose');
const CreditCalculation = require('./model3/bprndstudents');
const umbrella = require('./model3/umbrella');

// Test the API4 credit breakdown logic directly
async function testAPI4CreditBreakdown() {
  try {
    console.log('🧪 Testing API4 credit breakdown logic...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/sitaics', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    const studentId = '68ad6ef7d26245ad883a5b20'; // Abhay Singh Chauhan
    
    // Step 1: Check what the model returns
    console.log('\n🔍 Step 1: Direct model query...');
    const student = await CreditCalculation.findById(studentId);
    
    if (student) {
      console.log('✅ Student found via model:', student.Name);
      console.log('📊 Student umbrella:', student.Umbrella);
      console.log('📊 Total_Credits:', student.Total_Credits);
      console.log('📊 Border_Management:', student.Border_Management);
      console.log('📊 Tourism_Police:', student.Tourism_Police);
    } else {
      console.log('❌ Student NOT found via model');
      return;
    }
    
    // Step 2: Test the API logic step by step
    console.log('\n🔍 Step 2: Testing API logic...');
    
    // Get umbrellas
    const umbrellas = await umbrella.find({}).sort({ name: 1 });
    console.log(`📋 Found ${umbrellas.length} umbrellas:`, umbrellas.map(u => u.name));
    
    // Build projection
    const projection = { Total_Credits: 1 };
    umbrellas.forEach(u => {
      const fieldKey = u.name.replace(/\s+/g, '_');
      projection[fieldKey] = 1;
    });
    console.log('🔍 Projection:', projection);
    
    // Query with projection
    const studentWithProjection = await CreditCalculation.findById(studentId).select(projection);
    console.log('📊 Student with projection:');
    console.log('  - Total_Credits:', studentWithProjection.Total_Credits);
    console.log('  - Border_Management:', studentWithProjection.Border_Management);
    console.log('  - Tourism_Police:', studentWithProjection.Tourism_Police);
    
    // Build data object like API does
    const data = {};
    umbrellas.forEach(u => {
      const fieldKey = u.name.replace(/\s+/g, '_');
      const fieldValue = studentWithProjection[fieldKey];
      data[fieldKey] = Number(fieldValue || 0);
      
      if (fieldKey === 'Border_Management') {
        console.log(`🔍 Debug Border_Management: fieldValue="${fieldValue}", converted="${Number(fieldValue || 0)}"`);
      }
    });
    
    if (studentWithProjection.Total_Credits !== undefined) {
      data.Total_Credits = Number(studentWithProjection.Total_Credits || 0);
    }
    
    console.log('\n📊 Final API data object:', data);
    
    // Compare with direct database query
    console.log('\n🔍 Step 3: Direct database comparison...');
    const db = mongoose.connection.db;
    const directQuery = await db.collection('credit_calculations').findOne({ 
      _id: new mongoose.Types.ObjectId(studentId) 
    });
    
    console.log('📊 Direct database query:');
    console.log('  - Total_Credits:', directQuery.Total_Credits);
    console.log('  - Border_Management:', directQuery.Border_Management);
    console.log('  - Tourism_Police:', directQuery.Tourism_Police);
    
    // Analysis
    console.log('\n📊 Analysis:');
    console.log(`- Model query Border_Management: ${student.Border_Management}`);
    console.log(`- API logic Border_Management: ${data.Border_Management}`);
    console.log(`- Direct DB Border_Management: ${directQuery.Border_Management}`);
    
    if (student.Border_Management === directQuery.Border_Management && data.Border_Management !== directQuery.Border_Management) {
      console.log('❌ ISSUE: API logic is not preserving the correct values');
    } else if (student.Border_Management === data.Border_Management) {
      console.log('✅ API logic is working correctly');
    } else {
      console.log('⚠️ Inconsistent data between queries');
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

// Run the test
testAPI4CreditBreakdown();
