const mongoose = require('mongoose');

// Subject schema (embedded within courses)
const subjectSchema = new mongoose.Schema({
  // Number of periods
  noOfPeriods: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Periods minimum
  periodsMin: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Total minutes
  totalMins: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Total hours
  totalHrs: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Credits
  credits: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  _id: false // This will be embedded in courses, so no separate _id needed
});

// Course schema with all your specified fields
const courseSchema = new mongoose.Schema({
  // Unique identifier for the course
  ID: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Course name
  courseName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  
  // Organization
  organization: {
    type: String,
    required: true,
    trim: true
  },
  
  // Duration
  duration: {
    type: String,
    required: true,
    trim: true
  },
  
  // Indoor credits
  indoorCredits: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Outdoor credits
  outdoorCredits: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Field
  field: {
    type: String,
    required: true,
    trim: true
  },
  
  // Start date of the course
  startDate: {
    type: Date,
    required: true
  },
  
  // Completion status of the course
  completionStatus: {
    type: String,
    required: true,
    enum: ['ongoing', 'completed', 'upcoming'],
    default: 'upcoming'
  },
  
  // Subjects array - each course can have many subjects
  subjects: {
    type: [subjectSchema],
    required: true,
    validate: {
      validator: function(subjects) {
        return subjects && subjects.length > 0;
      },
      message: 'At least one subject must be specified'
    }
  }
}, {
  collection: 'courses',
  timestamps: true
});

// Middleware to automatically update completion status based on duration
courseSchema.pre('save', function(next) {
  const course = this;
  
  // Only run this middleware if startDate and duration are present
  if (course.startDate && course.duration) {
    const now = new Date();
    const startDate = new Date(course.startDate);
    
    // Parse duration to get the number of months/days
    const durationStr = course.duration.toLowerCase();
    let durationInDays = 0;
    
    // Extract number and unit from duration string
    const durationMatch = durationStr.match(/(\d+)\s*(day|days|month|months|year|years|week|weeks)/);
    
    if (durationMatch) {
      const number = parseInt(durationMatch[1]);
      const unit = durationMatch[2];
      
      switch (unit) {
        case 'day':
        case 'days':
          durationInDays = number;
          break;
        case 'week':
        case 'weeks':
          durationInDays = number * 7;
          break;
        case 'month':
        case 'months':
          durationInDays = number * 30; // Approximate
          break;
        case 'year':
        case 'years':
          durationInDays = number * 365; // Approximate
          break;
      }
    }
    
    // Calculate end date
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationInDays);
    
    // Update completion status based on current date
    if (now < startDate) {
      course.completionStatus = 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      course.completionStatus = 'ongoing';
    } else {
      course.completionStatus = 'completed';
    }
  }
  
  next();
});

// Static method to update completion status for all courses
courseSchema.statics.updateAllCompletionStatuses = async function() {
  const courses = await this.find({});
  const now = new Date();
  
  for (const course of courses) {
    if (course.startDate && course.duration) {
      const startDate = new Date(course.startDate);
      
      // Parse duration
      const durationStr = course.duration.toLowerCase();
      let durationInDays = 0;
      
      const durationMatch = durationStr.match(/(\d+)\s*(day|days|month|months|year|years|week|weeks)/);
      
      if (durationMatch) {
        const number = parseInt(durationMatch[1]);
        const unit = durationMatch[2];
        
        switch (unit) {
          case 'day':
          case 'days':
            durationInDays = number;
            break;
          case 'week':
          case 'weeks':
            durationInDays = number * 7;
            break;
          case 'month':
          case 'months':
            durationInDays = number * 30;
            break;
          case 'year':
          case 'years':
            durationInDays = number * 365;
            break;
        }
      }
      
      // Calculate end date
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationInDays);
      
      // Determine new status
      let newStatus = course.completionStatus;
      if (now < startDate) {
        newStatus = 'upcoming';
      } else if (now >= startDate && now <= endDate) {
        newStatus = 'ongoing';
      } else {
        newStatus = 'completed';
      }
      
      // Update if status changed
      if (newStatus !== course.completionStatus) {
        course.completionStatus = newStatus;
        await course.save();
      }
    }
  }
};

// Create and export the model
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;