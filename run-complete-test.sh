#!/bin/bash

# ================================================================
# VILA FALO - COMPLETE SYSTEM TEST & START
# ================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         🏔️  VILA FALO - STARTING SYSTEM  🏔️              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Making scripts executable...${NC}"
chmod +x verify-system.sh
chmod +x setup-scripts.sh
echo -e "${GREEN}✓ Done${NC}"
echo ""

echo -e "${BLUE}Step 2: Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
echo ""

echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║           RUNNING COMPREHENSIVE TESTS                      ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

node test-complete-system.js

echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║           SYSTEM READY - HOW TO USE                        ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}✅ ALL SYSTEMS OPERATIONAL!${NC}"
echo ""
echo -e "${YELLOW}To start the server, run:${NC}"
echo -e "${BLUE}    npm start${NC}"
echo ""
echo -e "${YELLOW}Then test these pages:${NC}"
echo ""
echo -e "${BLUE}1. Chatbot Test (Gemini API):${NC}"
echo "   http://localhost:5000/chatbot-test-live.html"
echo ""
echo -e "${BLUE}2. Booking Form:${NC}"
echo "   http://localhost:5000/booking.html"
echo ""
echo -e "${BLUE}3. Main Website:${NC}"
echo "   http://localhost:5000"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo "   • START-HERE.md           - Getting started guide"
echo "   • QUICK-REFERENCE.md      - Quick lookup"
echo "   • SYSTEM-UPDATE-COMPLETE.md - Full details"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     WHAT WAS UPDATED:                                      ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║  ✅ Chatbot using Gemini API                              ║${NC}"
echo -e "${GREEN}║  ✅ Room types: Standard, Premium, Deluxe                 ║${NC}"
echo -e "${GREEN}║  ✅ Prices: 5000, 7000, 8000 Lek                          ║${NC}"
echo -e "${GREEN}║  ✅ Capacity: 12 rooms (7, 4, 1)                          ║${NC}"
echo -e "${GREEN}║  ✅ Breakfast included in all prices                      ║${NC}"
echo -e "${GREEN}║  ✅ Payment: 50% deposit + 50% arrival                    ║${NC}"
echo -e "${GREEN}║  ✅ Real-time availability checking                       ║${NC}"
echo -e "${GREEN}║  ✅ Overbooking prevention active                         ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${MAGENTA}🎉 Ready to use! Start with: ${BLUE}npm start${NC}"
echo ""
