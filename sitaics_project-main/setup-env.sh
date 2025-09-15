#!/bin/bash

# Setup script for creating .env file for api2.js

echo "Setting up environment variables for POC API Server..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "Warning: .env file already exists!"
    read -p "Do you want to overwrite it? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

# Create .env file
cat > .env << EOF
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sitaics

# JWT Configuration
JWT_SECRET=poc-secret-key-change-in-production

# Server Configuration
PORT=3002
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email Configuration (for sending credentials to students)
EMAIL_USER=trinayan.1303@gmail.com
EMAIL_PASS=sfnw ucmk zunl zmra

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv

# Logging Configuration
LOG_LEVEL=info
EOF

echo "✅ .env file created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update EMAIL_USER with your Gmail address"
echo "2. Update EMAIL_PASS with your Gmail app password"
echo "3. Change JWT_SECRET to a secure random string for production"
echo "4. Update FRONTEND_URL if your frontend runs on a different port"
echo ""
echo "🚀 You can now run: node api2.js" 