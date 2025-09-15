#!/bin/bash

# ===========================================
# STOP ALL APIs SCRIPT
# This script stops all three APIs cleanly
# ===========================================

echo "🛑 Stopping all APIs..."

# Stop Admin API (port 3002)
echo "🔧 Stopping Admin API on port 3002..."
pkill -f "node admin_routes/api.js"
pkill -f ":3002"

# Stop BPRND POC API (port 3003)
echo "🔧 Stopping BPRND POC API on port 3003..."
pkill -f "node api3.js"
pkill -f ":3003"

# Stop BPRND Student API (port 3004)
echo "🔧 Stopping BPRND Student API on port 3004..."
pkill -f "node api4.js"
pkill -f ":3004"

# Wait a moment for processes to stop
sleep 2

echo ""
echo "🎯 Checking if any APIs are still running..."
if lsof -i :3002 -i :3003 -i :3004 >/dev/null 2>&1; then
    echo "⚠️  Some APIs are still running. Force stopping..."
    lsof -ti :3002 :3003 :3004 | xargs kill -9
else
    echo "✅ All APIs stopped successfully!"
fi

echo ""
echo "🧹 Cleanup complete!"
