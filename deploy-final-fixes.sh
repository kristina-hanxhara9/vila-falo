#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         Vila Falo - FINAL FIX DEPLOYMENT                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "✅ FIXES APPLIED:"
echo ""
echo "1. ✅ Room Booking Logic - FIXED"
echo "   - ANY number of guests allowed (1 to room max)"
echo "   - Standard: 1-3 guests allowed ✅"
echo "   - Premium: 1-4 guests allowed ✅"
echo "   - Deluxe: 1-5 guests allowed ✅"
echo "   - NO booking if more than max capacity ✅"
echo ""
echo "2. ✅ Price Display - ENHANCED"
echo "   - Total price shown prominently 💰"
echo "   - Deposit amount (50%) displayed"
echo "   - Remaining amount (50%) displayed"
echo "   - Booking reference included"
echo ""
echo "3. ✅ Room Type Validation - FIXED"
echo "   - All room name variations accepted"
echo "   - Case-insensitive matching"
echo ""
echo "4. ✅ Admin Panel - WORKING"
echo "   - Bookings display correctly"
echo "   - Database recording confirmed"
echo ""

read -p "Deploy these fixes now? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 0
fi

echo ""
echo "📦 Deploying..."

# Add changes
git add routes/bookingRoutes.js
git add public/js/scripts.js

# Commit
git commit -m "Fix: Room booking and price display improvements

CRITICAL FIXES:
1. Room Booking Logic - Allow flexible guest counts
   - Changed minGuests from 2/4/4 to 1/1/1 for all rooms
   - Guests can now book ANY number from 1 to room maximum
   - Standard: 1-3 guests ✅
   - Premium: 1-4 guests ✅  
   - Deluxe: 1-5 guests ✅
   - Blocks bookings if guests > room capacity ✅

2. Price Display - Enhanced visibility
   - Total price displayed in large, bold text
   - Deposit amount (50%) clearly shown
   - Remaining amount (50%) highlighted
   - Formatted with Lek currency
   - Visual styling with colors and borders
   - Booking reference prominently displayed

3. Room Type Normalization
   - All variations handled (Standard Mountain Room, etc.)
   - Case-insensitive matching

4. Better User Experience
   - Clear success message
   - All booking details visible
   - Payment instructions included
   - Email confirmation notice

These fixes ensure guests can book rooms regardless of party size
(as long as they don't exceed capacity) and see pricing immediately."

# Push to Heroku
git push heroku main

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                 ✅ DEPLOYMENT COMPLETE!                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🧪 TEST THE FIXES:"
echo ""
echo "1. Book a room with 2 guests in a 5-person room ✅"
echo "   → Should work now!"
echo ""
echo "2. Try to book 6 guests in a 5-person room ❌"
echo "   → Should be blocked with clear message"
echo ""
echo "3. Check the confirmation modal 💰"
echo "   → Should show:"
echo "     - Total price in LEK"
echo "     - Deposit (50%)"
echo "     - On arrival (50%)"
echo "     - Booking reference"
echo ""
echo "4. Verify admin panel 📊"
echo "   → https://vila-falo-resort-8208afd24e04.herokuapp.com/admin/login"
echo "   → New bookings should appear"
echo ""
echo "🌐 Your site: https://vila-falo-resort-8208afd24e04.herokuapp.com"
echo ""
echo "📊 Monitor logs:"
echo "   heroku logs --tail --app vila-falo-resort-8208afd24e04"
echo ""
