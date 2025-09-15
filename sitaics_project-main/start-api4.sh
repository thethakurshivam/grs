#!/bin/bash

# Startup script for BPRND Student API (api4.js)
# This script loads the .env.api4 file and starts the server

echo "🚀 Starting BPRND Student API (api4.js)..."
echo "📁 Loading environment from .env.api4"

# Check if .env.api4 exists
if [ ! -f ".env.api4" ]; then
    echo "❌ Error: .env.api4 file not found!"
    echo "💡 Please create .env.api4 file with required environment variables"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed!"
    echo "💡 Please install Node.js to run the API server"
    exit 1
fi

# Check if api4.js exists
if [ ! -f "api4.js" ]; then
    echo "❌ Error: api4.js file not found!"
    echo "💡 Please ensure you're in the correct directory"
    exit 1
fi

# Display configuration
echo "⚙️  Configuration:"
echo "   - Port: $(grep PORT .env.api4 | cut -d'=' -f2)"
echo "   - Environment: $(grep NODE_ENV .env.api4 | cut -d'=' -f2)"
echo "   - Database: $(grep MONGODB_URI .env.api4 | cut -d'=' -f2)"

echo ""
echo "🔗 API Endpoints:"
echo "   - Health Check: http://localhost:3004/health"
echo "   - Database Test: http://localhost:3004/test-db"
echo "   - Login: http://localhost:3004/login"

echo ""
echo "📝 Starting server..."
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the server
node api4.js
