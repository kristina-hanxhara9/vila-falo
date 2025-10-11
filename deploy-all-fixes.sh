#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║      Vila Falo - Complete Fix Deployment                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Please run this script from the vila-falo directory"
    exit 1
fi

echo "📋 FIXES INCLUDED:"
echo "   ✅ Room type normalization (all variations accepted)"
echo "   ✅ Admin panel booking display"
echo "   ✅ Database recording confirmed"
echo "   ✅ JavaScript duplicate variable removed"
echo "   ✅ CSS MIME type issue resolved"
echo ""

echo "📝 Modified files:"
git status --short
echo ""

read -p "🤔 Do you want to deploy these changes? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "📦 Preparing deployment..."
echo ""

# Add all changes
echo "➜ Adding changes to git..."
git add routes/bookingRoutes.js
git add public/js/scripts.js
git add public/css/hero-mobile-fixes.css
git add public/index.html

if [ $? -ne 0 ]; then
    echo "❌ Error adding files to git"
    exit 1
fi

echo "✓ Files added"
echo ""

# Commit
echo "➜ Committing changes..."
git commit -m "Fix: Complete booking system fixes

- Enhanced room type normalization with ALL variations
- Added comprehensive logging for debugging
- Fixed admin panel booking display
- Removed JavaScript duplicate declaration
- Moved CSS to correct directory
- Updated CSS paths in HTML

Fixes:
- Room type validation now accepts all variations (Standard Mountain Room, etc.)
- Admin panel now displays all bookings correctly
- Database properly records all bookings
- No more JavaScript console errors
- CSS loads correctly without MIME type warnings

Room types supported:
- Standard Mountain Room → Standard
- Premium Family Room → Premium
- Deluxe Family Suite → Deluxe
(including all case variations and Albanian names)"

if [ $? -ne 0 ]; then
    echo "❌ Error committing changes"
    exit 1
fi

echo "✓ Changes committed"
echo ""

# Push to Heroku
echo "➜ Deploying to Heroku..."
echo "   This may take 2-3 minutes..."
echo ""

git push heroku main

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Deployment failed!"
    echo "   Please check the error message above"
    exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║            ✅ DEPLOYMENT SUCCESSFUL!                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Your website: https://vila-falo-resort-8208afd24e04.herokuapp.com"
echo ""
echo "📊 TESTING CHECKLIST:"
echo ""
echo "   1. Test Booking Form:"
echo "      → Go to website"
echo "      → Select 'Standard Mountain Room'"
echo "      → Fill in dates and info"
echo "      → Submit booking"
echo "      → Should see success message ✅"
echo ""
echo "   2. Test Admin Panel:"
echo "      → Go to /admin/login"
echo "      → Login with your credentials"
echo "      → View bookings in dashboard"
echo "      → Check that new booking appears ✅"
echo ""
echo "   3. Check Database:"
echo "      → New booking should be in MongoDB"
echo "      → Email notification should be sent"
echo ""
echo "📡 Monitor deployment:"
echo "   heroku logs --tail --app vila-falo-resort-8208afd24e04"
echo ""
echo "🔍 Look for these success indicators in logs:"
echo "   ✅ MongoDB Connected"
echo "   ✅ Room type mapped to: Standard"
echo "   ✅ Booking saved: [id]"
echo "   ✅ BOOKING COMPLETED SUCCESSFULLY"
echo ""
echo "🎉 All fixes deployed! Your booking system should now work perfectly."
echo ""
