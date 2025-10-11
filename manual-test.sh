#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 VILA FALO - MANUAL BOOKING TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This script will test your booking system step by step"
echo ""

# API URL
API_URL="https://vila-falo-resort-8208afd24e04.herokuapp.com"

echo "📍 Testing API at: $API_URL"
echo ""

# Test 1: Health Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Checking if server is running..."
echo ""

HEALTH_RESPONSE=$(curl -s "$API_URL/health")
echo "Response: $HEALTH_RESPONSE"
echo ""

if echo "$HEALTH_RESPONSE" | grep -q "OK"; then
    echo "✅ Server is running!"
else
    echo "❌ Server not responding correctly"
    echo "Check heroku logs: heroku logs --tail"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Create Booking (camelCase fields)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Calculate dates
TOMORROW=$(date -v+1d +%Y-%m-%d 2>/dev/null || date -d "+1 day" +%Y-%m-%d)
THREE_DAYS=$(date -v+4d +%Y-%m-%d 2>/dev/null || date -d "+4 days" +%Y-%m-%d)

echo "Creating booking for dates: $TOMORROW to $THREE_DAYS"
echo ""

BOOKING1=$(curl -s -X POST "$API_URL/api/booking" \
  -H "Content-Type: application/json" \
  -d "{
    \"guestName\": \"Test User - Manual Test\",
    \"email\": \"test@vilafalo.com\",
    \"phone\": \"+355 69 123 4567\",
    \"checkInDate\": \"$TOMORROW\",
    \"checkOutDate\": \"$THREE_DAYS\",
    \"roomType\": \"Standard\",
    \"numberOfGuests\": 2,
    \"specialRequests\": \"This is a test booking from manual test script\"
  }")

echo "Response:"
echo "$BOOKING1" | python3 -m json.tool 2>/dev/null || echo "$BOOKING1"
echo ""

if echo "$BOOKING1" | grep -q "\"success\":true"; then
    echo "✅ Booking created successfully with camelCase fields!"
    BOOKING_ID=$(echo "$BOOKING1" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   Booking ID: $BOOKING_ID"
else
    echo "❌ Booking creation failed with camelCase"
    echo "   Check the error message above"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Create Booking (snake_case fields)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Calculate different dates
FIVE_DAYS=$(date -v+5d +%Y-%m-%d 2>/dev/null || date -d "+5 days" +%Y-%m-%d)
EIGHT_DAYS=$(date -v+8d +%Y-%m-%d 2>/dev/null || date -d "+8 days" +%Y-%m-%d)

echo "Creating booking for dates: $FIVE_DAYS to $EIGHT_DAYS"
echo ""

BOOKING2=$(curl -s -X POST "$API_URL/api/booking" \
  -H "Content-Type: application/json" \
  -d "{
    \"guest_name\": \"Snake Case Test User\",
    \"email\": \"snake@vilafalo.com\",
    \"phone\": \"+355 69 999 8888\",
    \"check_in_date\": \"$FIVE_DAYS\",
    \"check_out_date\": \"$EIGHT_DAYS\",
    \"room_type\": \"Standard\",
    \"number_of_guests\": 2,
    \"special_requests\": \"Testing snake_case field names\"
  }")

echo "Response:"
echo "$BOOKING2" | python3 -m json.tool 2>/dev/null || echo "$BOOKING2"
echo ""

if echo "$BOOKING2" | grep -q "\"success\":true"; then
    echo "✅ Booking created successfully with snake_case fields!"
    BOOKING_ID2=$(echo "$BOOKING2" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   Booking ID: $BOOKING_ID2"
else
    echo "❌ Booking creation failed with snake_case"
    echo "   Check the error message above"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Check Room Availability"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

AVAILABILITY=$(curl -s "$API_URL/api/booking/availability?checkInDate=$TOMORROW&checkOutDate=$THREE_DAYS&roomType=Standard")

echo "Response:"
echo "$AVAILABILITY" | python3 -m json.tool 2>/dev/null || echo "$AVAILABILITY"
echo ""

if echo "$AVAILABILITY" | grep -q "\"available\":true"; then
    AVAIL_ROOMS=$(echo "$AVAILABILITY" | grep -o '"availableRooms":[0-9]*' | cut -d':' -f2)
    echo "✅ Availability check working! Available rooms: $AVAIL_ROOMS"
else
    echo "⚠️  Check availability response"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: List All Bookings"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ALL_BOOKINGS=$(curl -s "$API_URL/api/booking")

if echo "$ALL_BOOKINGS" | grep -q "\"success\":true"; then
    BOOKING_COUNT=$(echo "$ALL_BOOKINGS" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "✅ Retrieved all bookings successfully!"
    echo "   Total bookings in system: $BOOKING_COUNT"
else
    echo "❌ Failed to retrieve bookings"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ If all tests passed, your booking system is working!"
echo ""
echo "🗑️  IMPORTANT: Delete test bookings from admin panel:"
echo "   https://vila-falo-resort-8208afd24e04.herokuapp.com/admin"
echo ""
echo "📋 Next steps:"
echo "   1. Test booking form on website: $API_URL/booking.html"
echo "   2. Check admin panel: $API_URL/admin"
echo "   3. Setup Paysera (see PAYSERA-SETUP-COMPLETE-GUIDE.md)"
echo "   4. Setup custom domain (vilafalo.com)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
