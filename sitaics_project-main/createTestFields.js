const mongoose = require('mongoose');
const Field = require('./models/fields');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitaics';

async function createTestFields() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing fields
    console.log('🧹 Clearing existing fields...');
    await Field.deleteMany({});

    // Create comprehensive test fields
    const testFields = [
      // Computer Science & Technology
      {
        name: 'Computer Science',
        count: 0
      },
      {
        name: 'Information Technology',
        count: 0
      },
      {
        name: 'Software Engineering',
        count: 0
      },
      {
        name: 'Data Science',
        count: 0
      },
      {
        name: 'Artificial Intelligence',
        count: 0
      },
      {
        name: 'Cybersecurity',
        count: 0
      },
      {
        name: 'Web Development',
        count: 0
      },
      {
        name: 'Mobile App Development',
        count: 0
      },

      // Engineering
      {
        name: 'Mechanical Engineering',
        count: 0
      },
      {
        name: 'Electrical Engineering',
        count: 0
      },
      {
        name: 'Civil Engineering',
        count: 0
      },
      {
        name: 'Chemical Engineering',
        count: 0
      },
      {
        name: 'Biomedical Engineering',
        count: 0
      },
      {
        name: 'Aerospace Engineering',
        count: 0
      },
      {
        name: 'Environmental Engineering',
        count: 0
      },

      // Business & Management
      {
        name: 'Business Administration',
        count: 0
      },
      {
        name: 'Finance',
        count: 0
      },
      {
        name: 'Marketing',
        count: 0
      },
      {
        name: 'Human Resources',
        count: 0
      },
      {
        name: 'Project Management',
        count: 0
      },
      {
        name: 'Entrepreneurship',
        count: 0
      },
      {
        name: 'Supply Chain Management',
        count: 0
      },
      {
        name: 'International Business',
        count: 0
      },

      // Healthcare & Medicine
      {
        name: 'Medicine',
        count: 0
      },
      {
        name: 'Nursing',
        count: 0
      },
      {
        name: 'Pharmacy',
        count: 0
      },
      {
        name: 'Public Health',
        count: 0
      },
      {
        name: 'Physiotherapy',
        count: 0
      },
      {
        name: 'Medical Technology',
        count: 0
      },
      {
        name: 'Mental Health',
        count: 0
      },

      // Education
      {
        name: 'Education',
        count: 0
      },
      {
        name: 'Early Childhood Education',
        count: 0
      },
      {
        name: 'Special Education',
        count: 0
      },
      {
        name: 'Educational Technology',
        count: 0
      },
      {
        name: 'Curriculum Development',
        count: 0
      },

      // Arts & Humanities
      {
        name: 'Literature',
        count: 0
      },
      {
        name: 'History',
        count: 0
      },
      {
        name: 'Philosophy',
        count: 0
      },
      {
        name: 'Fine Arts',
        count: 0
      },
      {
        name: 'Music',
        count: 0
      },
      {
        name: 'Theater',
        count: 0
      },
      {
        name: 'Film Studies',
        count: 0
      },

      // Social Sciences
      {
        name: 'Psychology',
        count: 0
      },
      {
        name: 'Sociology',
        count: 0
      },
      {
        name: 'Political Science',
        count: 0
      },
      {
        name: 'Economics',
        count: 0
      },
      {
        name: 'Anthropology',
        count: 0
      },
      {
        name: 'Social Work',
        count: 0
      },

      // Natural Sciences
      {
        name: 'Physics',
        count: 0
      },
      {
        name: 'Chemistry',
        count: 0
      },
      {
        name: 'Biology',
        count: 0
      },
      {
        name: 'Mathematics',
        count: 0
      },
      {
        name: 'Environmental Science',
        count: 0
      },
      {
        name: 'Geology',
        count: 0
      },
      {
        name: 'Astronomy',
        count: 0
      },

      // Law & Justice
      {
        name: 'Law',
        count: 0
      },
      {
        name: 'Criminal Justice',
        count: 0
      },
      {
        name: 'International Law',
        count: 0
      },
      {
        name: 'Human Rights',
        count: 0
      },

      // Communication & Media
      {
        name: 'Journalism',
        count: 0
      },
      {
        name: 'Public Relations',
        count: 0
      },
      {
        name: 'Digital Media',
        count: 0
      },
      {
        name: 'Broadcasting',
        count: 0
      },

      // Agriculture & Food
      {
        name: 'Agriculture',
        count: 0
      },
      {
        name: 'Food Science',
        count: 0
      },
      {
        name: 'Horticulture',
        count: 0
      },

      // Architecture & Design
      {
        name: 'Architecture',
        count: 0
      },
      {
        name: 'Interior Design',
        count: 0
      },
      {
        name: 'Urban Planning',
        count: 0
      },
      {
        name: 'Graphic Design',
        count: 0
      },

      // Transportation & Logistics
      {
        name: 'Transportation Management',
        count: 0
      },
      {
        name: 'Logistics',
        count: 0
      },
      {
        name: 'Aviation',
        count: 0
      },

      // Energy & Sustainability
      {
        name: 'Renewable Energy',
        count: 0
      },
      {
        name: 'Sustainability',
        count: 0
      },
      {
        name: 'Energy Management',
        count: 0
      },

      // Sports & Recreation
      {
        name: 'Sports Management',
        count: 0
      },
      {
        name: 'Physical Education',
        count: 0
      },
      {
        name: 'Recreation Management',
        count: 0
      },

      // Tourism & Hospitality
      {
        name: 'Tourism Management',
        count: 0
      },
      {
        name: 'Hospitality Management',
        count: 0
      },
      {
        name: 'Event Management',
        count: 0
      },

      // Fashion & Textiles
      {
        name: 'Fashion Design',
        count: 0
      },
      {
        name: 'Textile Engineering',
        count: 0
      },

      // Language & Linguistics
      {
        name: 'English',
        count: 0
      },
      {
        name: 'Spanish',
        count: 0
      },
      {
        name: 'French',
        count: 0
      },
      {
        name: 'German',
        count: 0
      },
      {
        name: 'Chinese',
        count: 0
      },
      {
        name: 'Linguistics',
        count: 0
      }
    ];

    console.log('🌱 Creating test fields...');
    await Field.insertMany(testFields);

    // Verify fields were created
    const fields = await Field.find();
    console.log(`✅ Created ${fields.length} fields successfully!`);
    
    // Display first 10 fields as sample
    console.log('📋 Sample fields created:');
    fields.slice(0, 10).forEach((field, index) => {
      console.log(`${index + 1}. ${field.name}`);
    });

    console.log('✅ Test fields created successfully!');
  } catch (error) {
    console.error('❌ Error creating test fields:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the function
createTestFields();