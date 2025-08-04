#!/bin/bash

# Vila Falo - Quick Test Script
# Run this script to test all the fixes

echo "🧪 Vila Falo - Testing All Fixes..."
echo "=================================="
echo ""

# Check if server is running
if pgrep -f "node.*server" > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Start with: npm start"
fi

# Check if key files exist
echo ""
echo "📁 Checking Fix Files:"

if [ -f "public/js/immediate-fixes.js" ]; then
    echo "✅ Immediate fixes script: EXISTS"
else
    echo "❌ Immediate fixes script: MISSING"
fi

if [ -f "hero-mobile-fixes.css" ]; then
    echo "✅ Hero mobile fixes CSS: EXISTS"
else
    echo "❌ Hero mobile fixes CSS: MISSING"
fi

if [ -f ".env.example" ]; then
    echo "✅ Environment template: EXISTS"
else
    echo "❌ Environment template: MISSING"
fi

if [ -f ".env" ]; then
    echo "✅ Environment file: EXISTS"
    
    # Check if email is configured
    if grep -q "EMAIL_PASS=" .env && ! grep -q "EMAIL_PASS=your_" .env; then
        echo "✅ Email configuration: CONFIGURED"
    else
        echo "⚠️ Email configuration: NEEDS SETUP"
        echo "   Run: cp .env.example .env"
        echo "   Then edit .env with your Gmail App Password"
    fi
else
    echo "❌ Environment file: MISSING"
    echo "   Run: cp .env.example .env"
fi

# Check MongoDB connection
echo ""
echo "🗄️ Database Status:"
if [ -f ".env" ] && grep -q "MONGODB_URI=" .env && ! grep -q "MONGODB_URI=your_" .env; then
    echo "✅ MongoDB URI: CONFIGURED"
else
    echo "⚠️ MongoDB URI: NEEDS SETUP"
fi

echo ""
echo "🔍 Testing Instructions:"
echo "1. Open website in browser"
echo "2. Test language toggle (EN/AL buttons)"
echo "3. Check hero section on mobile"
echo "4. Try making a booking via chatbot"
echo "5. Check if emails are received"
echo ""

# Show current status
echo "📊 Quick Status Check:"
echo "   Language Toggle: Check manually in browser"
echo "   Hero Section: Check manually on mobile"
echo "   Chatbot: Check manually with test booking"
echo "   Emails: Check spam folder if not received"
echo ""

echo "📖 For detailed instructions, see: FIX-SUMMARY.md"
echo ""

if [ -f ".env" ] && grep -q "EMAIL_PASS=" .env && ! grep -q "EMAIL_PASS=your_" .env; then
    echo "🎉 Setup appears complete! Test your website now."
else
    echo "⚠️ Setup incomplete. Configure .env file first."
fi
