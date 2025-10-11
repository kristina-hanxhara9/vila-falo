#!/bin/bash

# Quick Deploy Script for Booking API Fix
# This script deploys the fixed booking system to Heroku

echo "🚀 ============================================"
echo "🚀 Vila Falo - Booking API Fix Deployment"
echo "🚀 ============================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "   Please run this script from the vila-falo directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository"
    echo "   Please initialize git first"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Uncommitted changes detected"
    echo ""
    
    # Show what will be committed
    echo "Files to be committed:"
    git status --short
    echo ""
    
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Add all changes
        git add .
        
        # Commit with descriptive message
        git commit -m "Fix: Production-ready booking API with robust body parsing

- Enhanced body parser middleware with multiple fallback strategies
- Added field name normalization (supports camelCase and snake_case)
- Comprehensive request/response logging for debugging
- Detailed validation error messages with hints
- Test endpoints for debugging (/api/test-body, /api/booking/test-body-parser)
- Created comprehensive test suite (test-booking-api.js)
- Production-ready error handling
- Better user feedback on validation errors"
        
        echo "✅ Changes committed"
    else
        echo "❌ Deployment cancelled - please commit your changes first"
        exit 1
    fi
else
    echo "✅ No uncommitted changes"
fi

echo ""
echo "🔍 Checking Heroku remote..."

# Check if heroku remote exists
if git remote | grep -q "heroku"; then
    echo "✅ Heroku remote found"
    HEROKU_REMOTE=$(git remote get-url heroku)
    echo "   Remote: $HEROKU_REMOTE"
else
    echo "❌ Error: Heroku remote not configured"
    echo "   Please add Heroku remote first:"
    echo "   heroku git:remote -a vila-falo-resort-8208afd24e04"
    exit 1
fi

echo ""
echo "🚀 Deploying to Heroku..."
echo ""

# Deploy to Heroku
if git push heroku main; then
    echo ""
    echo "✅ ============================================"
    echo "✅ Deployment Successful!"
    echo "✅ ============================================"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. Check deployment logs:"
    echo "   heroku logs --tail"
    echo ""
    echo "2. Test the API:"
    echo "   export API_URL=https://vila-falo-resort-8208afd24e04.herokuapp.com"
    echo "   node test-booking-api.js"
    echo ""
    echo "3. Test manually with curl:"
    echo "   curl -X POST https://vila-falo-resort-8208afd24e04.herokuapp.com/api/booking \\"
    echo "     -H \"Content-Type: application/json\" \\"
    echo "     -d '{\"guestName\":\"Test\",\"email\":\"test@example.com\",\"phone\":\"+355691234567\",\"checkInDate\":\"2025-11-01\",\"checkOutDate\":\"2025-11-04\",\"roomType\":\"Standard\",\"numberOfGuests\":2}'"
    echo ""
    echo "4. Test from your website:"
    echo "   https://vila-falo-resort-8208afd24e04.herokuapp.com/booking.html"
    echo ""
    echo "5. Monitor for errors:"
    echo "   heroku logs --tail"
    echo ""
    echo "📚 For more details, see: BOOKING-API-FIX-COMPLETE.md"
    echo ""
else
    echo ""
    echo "❌ ============================================"
    echo "❌ Deployment Failed"
    echo "❌ ============================================"
    echo ""
    echo "Please check the error messages above and try again."
    echo "Common issues:"
    echo "  - Network connection problems"
    echo "  - Heroku authentication issues (run: heroku login)"
    echo "  - Build errors (check heroku logs)"
    echo ""
    exit 1
fi

# Optional: Run tests against production
echo "🧪 Would you like to run tests against production? (y/n) "
read -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🧪 Running production tests..."
    export API_URL=https://vila-falo-resort-8208afd24e04.herokuapp.com
    node test-booking-api.js
fi

echo ""
echo "✅ All done! Your booking API is now production-ready!"
echo ""
