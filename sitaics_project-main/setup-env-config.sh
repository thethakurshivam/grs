#!/bin/bash

# Environment Configuration Setup Script
# This script helps configure the environment files for all three services

echo "🔧 Setting up Environment Configuration for All Services..."
echo "=================================================="

# Create .env.admin for Admin API (Port 3002)
echo "📝 Creating .env.admin for Admin API (Port 3002)..."
cat > .env.admin << 'EOF'
# ===========================================
# ADMIN API ENVIRONMENT CONFIGURATION
# Port 3002 - Admin Authentication & Management
# ===========================================

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/sitaics

# JWT Secrets
JWT_SECRET=admin-secret-key-change-in-production
BPRND_JWT_SECRET=bprnd-admin-secret-key-change-in-production

# Server Configuration
PORT=3002
NODE_ENV=development

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:8080
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000,http://localhost:5173,http://127.0.0.1:8080

# Email Configuration for Nodemailer
EMAIL_USER=trinayan.1303@gmail.com
EMAIL_PASS=sfnw ucmk zunl zmra

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=csv,xlsx,xls

# Logging
LOG_LEVEL=info

# Security
SHOW_ERROR_DETAILS=true
RATE_LIMIT=100
EOF

# Update .env.api4 for BPRND Student API (Port 3004)
echo "📝 Updating .env.api4 for BPRND Student API (Port 3004)..."
cat > .env.api4 << 'EOF'
# ===========================================
# BPRND STUDENT API ENVIRONMENT CONFIGURATION
# Port 3004 - BPRND Student Authentication & Management
# ===========================================

# Server Configuration
PORT=3004
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/sitaics

# JWT Configuration
JWT_SECRET=bprnd-student-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
FRONTEND_URL=http://localhost:8080
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000,http://localhost:5173,http://127.0.0.1:8080

# Logging Configuration
LOG_LEVEL=info

# Security Configuration
SHOW_ERROR_DETAILS=true
RATE_LIMIT=100

# API Configuration
API_VERSION=v1
ENABLE_API_DOCS=true

# Development Settings
DEBUG=true
MONGOOSE_DEBUG=false
EOF

# Create .env.poc for BPRND POC API (Port 3003)
echo "📝 Creating .env.poc for BPRND POC API (Port 3003)..."
cat > .env.poc << 'EOF'
# ===========================================
# BPRND POC API ENVIRONMENT CONFIGURATION
# Port 3003 - BPRND POC Authentication & Management
# ===========================================

# Server Configuration
PORT=3003
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/sitaics

# JWT Configuration
JWT_SECRET=bprnd-poc-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
FRONTEND_URL=http://localhost:8080
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000,http://localhost:5173,http://127.0.0.1:8080

# Logging Configuration
LOG_LEVEL=info

# Security Configuration
SHOW_ERROR_DETAILS=true
RATE_LIMIT=100

# API Configuration
API_VERSION=v1
ENABLE_API_DOCS=true

# Development Settings
DEBUG=true
MONGOOSE_DEBUG=false
EOF

echo ""
echo "✅ Environment files created successfully!"
echo ""
echo "📁 Files created:"
echo "   - .env.admin (Admin API - Port 3002)"
echo "   - .env.api4 (BPRND Student API - Port 3004)"
echo "   - .env.poc (BPRND POC API - Port 3003)"
echo ""
echo "🔧 Next steps:"
echo "   1. Copy .env.admin to .env for Admin API"
echo "   2. Use .env.api4 for BPRND Student API"
echo "   3. Use .env.poc for BPRND POC API"
echo ""
echo "📋 Port Configuration:"
echo "   - Admin API: 3002"
echo "   - BPRND POC API: 3003"
echo "   - BPRND Student API: 3004"
echo "   - Frontend: 8080"
echo ""
echo "🌐 CORS configured for: http://localhost:8080"
echo ""
echo "🚀 To start services:"
echo "   - Admin API: npm start (uses .env)"
echo "   - BPRND Student API: npm run api4 (uses .env.api4)"
echo "   - BPRND POC API: npm run poc (uses .env.poc)"
