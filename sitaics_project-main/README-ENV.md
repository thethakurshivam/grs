# Environment Variables for POC API Server (api2.js)

This document describes all the environment variables used by the POC API server.

## Quick Setup

1. Run the setup script:
   ```bash
   ./setup-env.sh
   ```

2. Update the `.env` file with your specific values (see details below)

3. Start the server:
   ```bash
   node api2.js
   ```

## Environment Variables

### MongoDB Configuration
- **MONGODB_URI**: MongoDB connection string
  - Default: `mongodb://localhost:27017/sitaics`
  - Description: Connection string for the MongoDB database

### JWT Configuration
- **JWT_SECRET**: Secret key for JWT token signing
  - Default: `poc-secret-key-change-in-production`
  - ⚠️ **Important**: Change this to a secure random string in production
  - Description: Used to sign and verify JWT tokens for POC authentication

### Server Configuration
- **PORT**: Port number for the server
  - Default: `3002`
  - Description: The port on which the API server will run

- **NODE_ENV**: Node.js environment
  - Default: `development`
  - Options: `development`, `production`, `test`
  - Description: Sets the Node.js environment mode

### CORS Configuration
- **FRONTEND_URL**: Frontend application URL
  - Default: `http://localhost:5173`
  - Description: URL of the frontend application for CORS configuration

### Email Configuration
- **EMAIL_USER**: Gmail address for sending emails
  - Default: `your-email@gmail.com`
  - Description: Gmail address used to send account credentials to students

- **EMAIL_PASS**: Gmail app password
  - Default: `your-app-password`
  - Description: App password for Gmail (not your regular password)
  - ⚠️ **Important**: Use Gmail App Passwords, not your regular password

### File Upload Configuration
- **MAX_FILE_SIZE**: Maximum file size in bytes
  - Default: `5242880` (5MB)
  - Description: Maximum allowed file size for bulk import uploads

- **ALLOWED_FILE_TYPES**: Comma-separated list of allowed MIME types
  - Default: Excel and CSV file types
  - Description: Allowed file types for bulk import uploads

### Logging Configuration
- **LOG_LEVEL**: Logging level
  - Default: `info`
  - Options: `error`, `warn`, `info`, `debug`
  - Description: Sets the logging level for the application

## Gmail Setup for Email Functionality

To enable email functionality for sending student credentials:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Update the .env file**:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

## Security Notes

1. **Never commit the .env file** to version control
2. **Use strong JWT secrets** in production
3. **Use environment-specific values** for different deployments
4. **Regularly rotate secrets** and passwords

## Example .env File

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sitaics

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Server Configuration
PORT=3002
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv

# Logging Configuration
LOG_LEVEL=info
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check the MONGODB_URI is correct

2. **Email Not Sending**:
   - Verify Gmail credentials
   - Check if 2FA is enabled
   - Ensure app password is correct

3. **CORS Errors**:
   - Update FRONTEND_URL to match your frontend URL
   - Check if the frontend is running on the correct port

4. **File Upload Errors**:
   - Check file size (max 5MB)
   - Ensure file type is supported (Excel/CSV)
   - Verify file format matches template 