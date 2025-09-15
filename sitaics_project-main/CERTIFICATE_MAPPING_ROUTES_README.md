# Certificate Course Mapping API Routes

## 🚀 **Overview**

I've added three comprehensive API routes to the admin API (`admin_routes/api.js`) that allow you to fetch all certificate course mapping data and send it to the frontend. These routes provide complete access to the certificate-course-credit mapping information.

## 📋 **Available Routes**

### 1. **GET /api/certificate-course-mappings**
**Main route to fetch all certificate course mappings with filtering and pagination**

#### **Query Parameters:**
- `studentId` - Filter by specific student ID
- `umbrellaKey` - Filter by certification umbrella (e.g., 'Cyber_Security')
- `qualification` - Filter by qualification type ('certificate', 'diploma', 'pg diploma')
- `certificateId` - Filter by specific certificate ID
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (default: 50)
- `sortBy` - Field to sort by (default: 'createdAt')
- `sortOrder` - Sort order 'asc' or 'desc' (default: 'desc')

#### **Example Usage:**
```javascript
// Get all mappings
GET /api/certificate-course-mappings

// Get Cyber Security mappings only
GET /api/certificate-course-mappings?umbrellaKey=Cyber_Security

// Get mappings for specific student with pagination
GET /api/certificate-course-mappings?studentId=123&page=1&limit=10

// Get certificate mappings sorted by qualification
GET /api/certificate-course-mappings?sortBy=qualification&sortOrder=asc
```

#### **Response Format:**
```json
{
  "success": true,
  "count": 25,
  "totalCount": 150,
  "page": 1,
  "limit": 50,
  "totalPages": 3,
  "data": [
    {
      "_id": "mapping_id",
      "certificateId": {
        "_id": "cert_id",
        "certificateNo": "CERT-123456"
      },
      "studentId": {
        "_id": "student_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "umbrellaKey": "Cyber_Security",
      "qualification": "certificate",
      "totalCreditsRequired": 30,
      "courses": [
        {
          "courseId": "course_id",
          "courseName": "Introduction to Cybersecurity",
          "organization": "Tech Institute",
          "theoryHours": 20,
          "practicalHours": 10,
          "totalCredits": 15,
          "creditsUsed": 15,
          "completionDate": "2024-01-15T00:00:00.000Z",
          "pdfPath": "/uploads/pdfs/course1.pdf",
          "pdfFileName": "cybersecurity_intro.pdf"
        }
      ],
      "totalCreditsUsed": 15,
      "remainingCredits": 15,
      "creditEfficiency": 50,
      "courseCount": 1,
      "createdAt": "1/15/2024",
      "updatedAt": "1/15/2024"
    }
  ]
}
```

---

### 2. **GET /api/certificate-course-mappings/:mappingId**
**Get a specific certificate course mapping by ID**

#### **Path Parameters:**
- `mappingId` - The ID of the specific mapping to retrieve

#### **Example Usage:**
```javascript
GET /api/certificate-course-mappings/64f8a1b2c3d4e5f6a7b8c9d0
```

#### **Response Format:**
```json
{
  "success": true,
  "data": {
    "_id": "mapping_id",
    "certificateId": {
      "_id": "cert_id",
      "certificateNo": "CERT-123456"
    },
    "studentId": {
      "_id": "student_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "umbrellaKey": "Cyber_Security",
    "qualification": "certificate",
    "totalCreditsRequired": 30,
    "courses": [...],
    "totalCreditsUsed": 15,
    "remainingCredits": 15,
    "creditEfficiency": 50,
    "courseCount": 1
  }
}
```

---

### 3. **GET /api/certificate-course-mappings/student/:studentId**
**Get all certificate course mappings for a specific student with summary statistics**

#### **Path Parameters:**
- `studentId` - The ID of the student

#### **Query Parameters:**
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (default: 50)

#### **Example Usage:**
```javascript
GET /api/certificate-course-mappings/student/64f8a1b2c3d4e5f6a7b8c9d0

GET /api/certificate-course-mappings/student/64f8a1b2c3d4e5f6a7b8c9d0?page=1&limit=10
```

#### **Response Format:**
```json
{
  "success": true,
  "count": 3,
  "totalCount": 3,
  "page": 1,
  "limit": 50,
  "totalPages": 1,
  "summary": {
    "totalMappings": 3,
    "totalCertificates": 3,
    "totalCreditsEarned": 90,
    "totalCreditsUsed": 75,
    "umbrellaBreakdown": {
      "Cyber_Security": {
        "certificates": 2,
        "totalCredits": 60,
        "usedCredits": 45
      },
      "Digital_Forensics": {
        "certificates": 1,
        "totalCredits": 30,
        "usedCredits": 30
      }
    }
  },
  "data": [...]
}
```

## 🔧 **Frontend Integration Examples**

### **React/JavaScript Example:**
```javascript
// Fetch all certificate course mappings
const fetchAllMappings = async () => {
  try {
    const response = await fetch('/api/certificate-course-mappings', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`Found ${data.count} mappings out of ${data.totalCount} total`);
      console.log('Mappings:', data.data);
      
      // Access calculated fields
      data.data.forEach(mapping => {
        console.log(`Mapping ${mapping._id}:`);
        console.log(`  Credits Used: ${mapping.totalCreditsUsed}`);
        console.log(`  Remaining: ${mapping.remainingCredits}`);
        console.log(`  Efficiency: ${mapping.creditEfficiency}%`);
        console.log(`  Courses: ${mapping.courseCount}`);
      });
    }
  } catch (error) {
    console.error('Error fetching mappings:', error);
  }
};

// Fetch mappings for specific student
const fetchStudentMappings = async (studentId) => {
  try {
    const response = await fetch(`/api/certificate-course-mappings/student/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Student Summary:', data.summary);
      console.log('Student Mappings:', data.data);
    }
  } catch (error) {
    console.error('Error fetching student mappings:', error);
  }
};

// Fetch specific mapping by ID
const fetchMappingById = async (mappingId) => {
  try {
    const response = await fetch(`/api/certificate-course-mappings/${mappingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Specific Mapping:', data.data);
    }
  } catch (error) {
    console.error('Error fetching mapping:', error);
  }
};
```

### **Filtering and Pagination Example:**
```javascript
// Advanced filtering with pagination
const fetchFilteredMappings = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters
  if (filters.studentId) queryParams.append('studentId', filters.studentId);
  if (filters.umbrellaKey) queryParams.append('umbrellaKey', filters.umbrellaKey);
  if (filters.qualification) queryParams.append('qualification', filters.qualification);
  if (filters.page) queryParams.append('page', filters.page);
  if (filters.limit) queryParams.append('limit', filters.limit);
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
  
  try {
    const response = await fetch(`/api/certificate-course-mappings?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return {
        mappings: data.data,
        pagination: {
          currentPage: data.page,
          totalPages: data.totalPages,
          totalCount: data.totalCount,
          hasNext: data.page < data.totalPages,
          hasPrev: data.page > 1
        }
      };
    }
  } catch (error) {
    console.error('Error fetching filtered mappings:', error);
  }
};

// Usage example
const loadMappings = async () => {
  const result = await fetchFilteredMappings({
    umbrellaKey: 'Cyber_Security',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  if (result) {
    console.log('Mappings:', result.mappings);
    console.log('Pagination:', result.pagination);
  }
};
```

## 📊 **Data Fields Explained**

### **Core Mapping Fields:**
- **`_id`** - Unique mapping identifier
- **`certificateId`** - Reference to BPRND certificate (populated with certificateNo)
- **`studentId`** - Reference to student (populated with name and email)
- **`umbrellaKey`** - Certification umbrella (e.g., 'Cyber_Security')
- **`qualification`** - Type of qualification
- **`totalCreditsRequired`** - Credits needed for certification
- **`courses`** - Array of contributing courses
- **`createdAt`** - When mapping was created
- **`updatedAt`** - When mapping was last updated

### **Calculated Fields (Added by API):**
- **`totalCreditsUsed`** - Total credits used from all courses
- **`remainingCredits`** - Credits still needed
- **`creditEfficiency`** - Percentage of credits used efficiently
- **`courseCount`** - Number of courses contributing
- **`createdAt`** - Formatted creation date
- **`updatedAt`** - Formatted update date

### **Course Fields:**
- **`courseId`** - Reference to course history
- **`courseName`** - Name of the course
- **`organization`** - Training organization
- **`theoryHours`** - Theory hours completed
- **`practicalHours`** - Practical hours completed
- **`totalCredits`** - Total credits available from course
- **`creditsUsed`** - Credits actually used for certification
- **`completionDate`** - When course was completed
- **`pdfPath`** - Path to course PDF
- **`pdfFileName`** - Name of course PDF file

## 🔒 **Authentication & Security**

- **All routes require authentication** via JWT token
- **Admin access only** - these routes are in the admin API
- **Token validation** using the existing `authenticateToken` middleware
- **Error handling** with proper HTTP status codes
- **Input validation** for query parameters and path variables

## 🧪 **Testing**

### **Test Script:**
- **File:** `test-certificate-mapping-routes.js`
- **Usage:** `node test-certificate-mapping-routes.js`
- **Purpose:** Verify all routes work correctly with sample data

### **Manual Testing:**
1. **Start your admin API server**
2. **Get a valid JWT token** (login as admin)
3. **Test each route** with Postman or similar tool
4. **Verify responses** match expected format
5. **Test filtering and pagination** with different parameters

## 🚀 **Next Steps**

1. **Test the routes** using the provided test script
2. **Integrate with frontend** using the provided examples
3. **Add any additional filtering** you might need
4. **Customize response format** if required
5. **Add caching** for better performance if needed

## 🎉 **Summary**

You now have three powerful API routes that provide complete access to certificate course mapping data:

- **List all mappings** with filtering, sorting, and pagination
- **Get specific mapping** by ID
- **Get student mappings** with summary statistics

All routes include calculated fields for easy frontend consumption and comprehensive error handling for production use.
