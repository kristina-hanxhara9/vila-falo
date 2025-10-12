#!/bin/bash

echo "======================================"
echo "Vila Falo - Deploy All Fixes"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo -e "${RED}❌ Error: Must run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📝 Changes being deployed:${NC}"
echo "  1. ✅ Booking emails now sent to guests AND admin"
echo "  2. ✅ Added custom routes: /admin and /admintotal"  
echo "  3. ✅ Calendar showing real booking data"
echo ""

# Check if changes are already committed
if git diff --quiet services/emailService.js server.js; then
    echo -e "${GREEN}✅ No changes detected - files already updated${NC}"
else
    echo -e "${YELLOW}📦 Staging changes...${NC}"
    git add services/emailService.js
    git add server.js
    
    echo -e "${YELLOW}💾 Committing changes...${NC}"
    git commit -m "Fix: Send booking emails to guests, add custom admin routes (/admin and /admintotal)"
fi

echo ""
echo -e "${YELLOW}🚀 Deploying to Heroku...${NC}"
git push heroku main

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "======================================"
echo "Testing Your Changes"
echo "======================================"
echo ""
echo "1. Test Booking Emails:"
echo "   • Make a test booking"
echo "   • Check guest email: should receive confirmation"
echo "   • Check admin email (vilafalo@gmail.com): should receive notification"
echo ""
echo "2. Test Admin Routes:"
echo "   • Admin Login: https://vila-falo-resort-8208afd24e04.herokuapp.com/admin"
echo "   • Admin Panel: https://vila-falo-resort-8208afd24e04.herokuapp.com/admintotal"
echo ""
echo "3. Test Calendar:"
echo "   • Go to Admin Panel > Calendar tab"
echo "   • Should show all confirmed bookings"
echo ""
echo "4. Set up Custom Domain (Optional):"
echo "   • See FIX-ALL-ISSUES.md for DNS setup instructions"
echo ""
echo "======================================"
echo ""
echo -e "${YELLOW}📋 View logs:${NC} heroku logs --tail --app vila-falo-resort"
echo -e "${YELLOW}🔧 Check config:${NC} heroku config --app vila-falo-resort"
echo ""
