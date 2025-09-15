# BPRND Student API (api4.js)

This is the dedicated API server for BPRND (Bureau of Police Research and Development) student authentication and management.

## 🚀 Quick Start

### Method 1: Using npm scripts
```bash
# Start api4.js
npm run api4

# Start with nodemon (auto-restart on changes)
npm run api4:dev

# Start with startup script (recommended)
npm run start:bprnd
```

### Method 2: Direct execution
```bash
# Start directly
node api4.js

# Start with custom port
PORT=3004 node api4.js
```

### Method 3: Using startup script
```bash
# Make executable (first time only)
chmod +x start-api4.sh

# Run startup script
./start-api4.sh
```

## ⚙️ Configuration

The API uses `.env.api4` file for configuration:

```env
# Server
PORT=3004
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/sitaics

# JWT
JWT_SECRET=bprnd-student-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=http://localhost:5173
```

## 🔗 API Endpoints

### Health & Testing
- **GET** `/health` - Server health check
- **GET** `/test-db` - Database connection test

### Authentication
- **POST** `/login` - BPRND student login

#### Login Request
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

#### Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "student": {
    "_id": "student_id",
    "email": "student@example.com",
    "Name": "Student Name",
    "Designation": "Officer",
    "State": "State Name",
    "Umbrella": "Cyber Security",
    // ... other student data
  }
}
```

## 🗄️ Database Models

### BPRND Students (`credit_calculations` collection)
- Email and password authentication
- Personal information (Name, Designation, State)
- Training data (Topics, Hours, Credits)
- Umbrella category assignment

### Umbrellas (`umbrellas` collection)
- Available umbrella categories
- Used for student classification

## 🔧 Development

### Prerequisites
- Node.js (v14+)
- MongoDB running on localhost:27017
- Required npm packages installed

### Environment Setup
1. Copy `.env.api4` and update values
2. Ensure MongoDB is running
3. Start the server using any method above

### Testing
```bash
# Test the API connection
node testAPI4Connection.js

# Manual testing
curl http://localhost:3004/health
curl http://localhost:3004/test-db
```

## 🔒 Security Features

- JWT token authentication (24h expiration)
- CORS protection with allowed origins
- Input validation
- Error handling middleware
- Graceful shutdown handling

## 📊 Monitoring

The API provides detailed logging:
- ✅ Successful operations
- ❌ Error conditions
- 🔍 Database connection status
- 📝 Request/response logging

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill existing process
   pkill -f "node api4.js"
   # Or use different port
   PORT=3005 node api4.js
   ```

2. **Database connection failed**
   - Check if MongoDB is running
   - Verify MONGODB_URI in .env.api4
   - Test with: `curl http://localhost:3004/test-db`

3. **Login fails with valid credentials**
   - Check if student exists in database
   - Verify password format (plain text vs hashed)
   - Check server logs for detailed error messages

### Debug Mode
Set `DEBUG=true` in `.env.api4` for detailed logging.

## 📝 Notes

- This API runs on port **3004** by default
- Uses direct password comparison (no bcrypt hashing)
- Designed specifically for BPRND student authentication
- Integrates with frontend at `/student/bprnd/login` route
