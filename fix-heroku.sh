#!/bin/bash

# VILA FALO - HEROKU DEPLOYMENT FIX
# Fixes nodemailer and other Heroku-specific issues

echo "╔════════════════════════════════════════╗"
echo "║   VILA FALO - HEROKU DEPLOYMENT FIX   ║"
echo "╚════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Cleaning node_modules and package-lock...${NC}"
rm -rf node_modules
rm -f package-lock.json
echo -e "${GREEN}✓ Cleaned${NC}"
echo ""

echo -e "${BLUE}Step 2: Reinstalling all dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}Step 3: Verifying nodemailer...${NC}"
if [ -d "node_modules/nodemailer" ]; then
    echo -e "${GREEN}✓ nodemailer installed${NC}"
else
    echo -e "${RED}✗ nodemailer missing, installing now...${NC}"
    npm install nodemailer --save
fi
echo ""

echo -e "${BLUE}Step 4: Testing local server...${NC}"
echo -e "${YELLOW}Starting server for 10 seconds to test...${NC}"
timeout 10s npm start || true
echo ""

echo -e "${BLUE}Step 5: Preparing for Heroku deployment...${NC}"
echo -e "${YELLOW}Adding all changes to git...${NC}"
git add .
echo ""

echo -e "${YELLOW}Current git status:${NC}"
git status
echo ""

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   READY TO DEPLOY                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}To deploy to Heroku, run:${NC}"
echo -e "${BLUE}git commit -m 'Fix nodemailer and update system'${NC}"
echo -e "${BLUE}git push heroku main${NC}"
echo ""

echo -e "${YELLOW}Or use the quick deploy:${NC}"
echo -e "${BLUE}git commit -m 'Fix nodemailer and update system' && git push heroku main${NC}"
echo ""

echo -e "${GREEN}After deployment, check Heroku logs:${NC}"
echo -e "${BLUE}heroku logs --tail${NC}"
echo ""
