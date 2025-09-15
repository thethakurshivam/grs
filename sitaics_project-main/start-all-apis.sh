#!/bin/bash

# ===========================================
# START ALL APIs SCRIPT
# This script starts all three APIs with correct configurations
# ===========================================

echo "🚀 Starting all APIs..."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $port is already in use. Stopping existing process..."
        pkill -f ":$port"
        sleep 2
    fi
}

# Function to start API with proper environment
start_api() {
    local api_name=$1
    local env_file=$2
    local port=$3
    local command=$4
    
    echo "🔧 Starting $api_name on port $port..."
    
    # Copy environment file
    cp "$env_file" .env
    
    # Start API in background
    nohup $command > "${api_name}_api.log" 2>&1 &
    
    # Wait a moment and check if it started
    sleep 3
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "✅ $api_name started successfully on port $port"
    else
        echo "❌ Failed to start $api_name on port $port"
        return 1
    fi
}

# Check and clear ports
echo "🔍 Checking ports..."
check_port 3002
check_port 3003
check_port 3004

# Start Admin API (port 3002)
start_api "Admin" ".env.admin" "3002" "node admin_routes/api.js"

# Start BPRND POC API (port 3003)
start_api "BPRND POC" ".env.poc" "3003" "node api3.js"

# Start BPRND Student API (port 3004)
start_api "BPRND Student" ".env.api4" "3004" "node api4.js"

echo ""
echo "🎯 All APIs Status:"
echo "=================="
lsof -i :3002 -i :3003 -i :3004 | grep LISTEN

echo ""
echo "📋 Log files created:"
echo "- Admin API: admin_api.log"
echo "- BPRND POC API: bprnd_poc_api.log" 
echo "- BPRND Student API: bprnd_student_api.log"

echo ""
echo "✅ All APIs started successfully!"
echo "🌐 Frontend should be accessible at: http://localhost:8080"
echo ""
echo "💡 To stop all APIs, run: ./stop-all-apis.sh"
