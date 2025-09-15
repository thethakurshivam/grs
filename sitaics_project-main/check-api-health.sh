#!/bin/bash

# ===========================================
# API HEALTH CHECK SCRIPT
# This script checks if all APIs are running and responding
# ===========================================

echo "🏥 Checking API Health..."

# Function to check API health
check_api() {
    local name=$1
    local port=$2
    local endpoint=$3
    
    echo "🔍 Checking $name (port $port)..."
    
    # Check if port is listening
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "  ✅ Port $port is listening"
        
        # Check if API responds
        if curl -s "http://localhost:$port$endpoint" >/dev/null 2>&1; then
            echo "  ✅ API is responding"
            return 0
        else
            echo "  ❌ API is not responding"
            return 1
        fi
    else
        echo "  ❌ Port $port is not listening"
        return 1
    fi
}

# Check each API
echo ""
check_api "Admin API" "3002" "/api/login"
admin_status=$?

echo ""
check_api "BPRND POC API" "3003" "/api/poc/login"
poc_status=$?

echo ""
check_api "BPRND Student API" "3004" "/api/bprnd/student/login"
student_status=$?

echo ""
echo "🎯 Health Check Summary:"
echo "========================"

if [ $admin_status -eq 0 ]; then
    echo "✅ Admin API: HEALTHY"
else
    echo "❌ Admin API: UNHEALTHY"
fi

if [ $poc_status -eq 0 ]; then
    echo "✅ BPRND POC API: HEALTHY"
else
    echo "❌ BPRND POC API: UNHEALTHY"
fi

if [ $student_status -eq 0 ]; then
    echo "✅ BPRND Student API: HEALTHY"
else
    echo "❌ BPRND Student API: UNHEALTHY"
fi

echo ""
if [ $admin_status -eq 0 ] && [ $poc_status -eq 0 ] && [ $student_status -eq 0 ]; then
    echo "🎉 All APIs are healthy!"
    echo "🌐 Frontend should work correctly at: http://localhost:8080"
else
    echo "⚠️  Some APIs are unhealthy. Check logs and restart if needed."
    echo "💡 Run: ./start-all-apis.sh"
fi
