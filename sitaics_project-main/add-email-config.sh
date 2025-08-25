#!/bin/bash

echo "🔧 Adding Email Configuration to .env.poc file..."

# Check if .env.poc exists
if [ ! -f ".env.poc" ]; then
    echo "❌ .env.poc file not found!"
    exit 1
fi

# Check if email config already exists
if grep -q "EMAIL_USER" .env.poc; then
    echo "✅ Email configuration already exists in .env.poc"
    echo "Current email config:"
    grep -E "EMAIL_" .env.poc
else
    echo "📧 Adding email configuration..."
    
    # Add email config to the end of .env.poc
    cat >> .env.poc << 'EOF'

# Email Configuration for Nodemailer
EMAIL_USER=trinayan.1303@gmail.com
EMAIL_PASS=sfnw ucmk zunl zmra
EMAIL_SERVICE=gmail
EOF

    echo "✅ Email configuration added to .env.poc"
    echo "New email config:"
    grep -E "EMAIL_" .env.poc
fi

echo ""
echo "🚀 Next steps:"
echo "1. Restart the BPRND POC API (node api3.js)"
echo "2. Run the email test: node test-email-functionality.js"
echo "3. Check if test email is received"
echo "4. Try uploading an Excel file to test bulk import emails"
