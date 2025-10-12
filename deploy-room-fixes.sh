#!/bin/bash

echo "🏨 ======================================"
echo "🏨 VILA FALO - ROOM INVENTORY UPDATE"
echo "🏨 ======================================"
echo ""

echo "📋 Changes to deploy:"
echo "  ✅ Fixed room inventory (7 Standard, 4 Deluxe, 1 Premium)"
echo "  ✅ Updated room capacities (2, 4, 5 guests)"
echo "  ✅ Fixed FullCalendar loading in admin"
echo "  ✅ Updated website to show correct Premium capacity"
echo ""

echo "📦 Adding files to git..."
git add routes/bookingRoutes.js
git add public/index.html
git add public/admin.html
git add ROOM-INVENTORY-UPDATE-COMPLETE.md
git add ADMIN-FIXES-COMPLETE.md

echo ""
echo "💾 Committing changes..."
git commit -m "Fix: Update room inventory and capacities

- Standard: 7 rooms, max 2 guests, 5000 Lek
- Deluxe: 4 rooms, max 4 guests, 6000 Lek  
- Premium: 1 room, max 5 guests, 7000 Lek
- Fixed FullCalendar loading in admin dashboard
- Updated website Premium suite to show 5 guests capacity"

echo ""
echo "🚀 Pushing to Heroku..."
git push heroku main

echo ""
echo "⏳ Waiting for deployment to complete..."
sleep 5

echo ""
echo "🧪 Testing deployed changes..."
echo ""

echo "1️⃣ Checking room availability..."
curl -s "https://vila-falo-resort-8208afd24e04.herokuapp.com/api/booking/availability?checkInDate=2025-02-01&checkOutDate=2025-02-03" | jq '.'

echo ""
echo "✅ ======================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "✅ ======================================"
echo ""
echo "📊 Your room inventory is now:"
echo "   • Standard Mountain Room: 7 rooms (2 guests each)"
echo "   • Deluxe Family Suite: 4 rooms (4 guests each)"
echo "   • Premium Panorama Suite: 1 room (5 guests)"
echo ""
echo "🌐 Test your website:"
echo "   https://vila-falo-resort-8208afd24e04.herokuapp.com"
echo ""
echo "🔧 Check admin dashboard:"
echo "   https://vila-falo-resort-8208afd24e04.herokuapp.com/admin"
echo ""
echo "📊 View deployment logs:"
echo "   heroku logs --tail"
echo ""
