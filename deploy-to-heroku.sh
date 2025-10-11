#!/bin/bash

# Vila Falo Resort - Quick Deployment Script
# This script automates the deployment process

echo "🏨 Vila Falo Resort - Deployment Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found!${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${YELLOW}Step 2: Checking Heroku login...${NC}"
heroku whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Not logged in to Heroku. Logging in...${NC}"
    heroku login
fi
echo -e "${GREEN}✅ Heroku authenticated${NC}"
echo ""

echo -e "${YELLOW}Step 3: Committing changes...${NC}"
git add .
git commit -m "Deploy: Payment integration and real-time updates"
echo -e "${GREEN}✅ Changes committed${NC}"
echo ""

echo -e "${YELLOW}Step 4: Deploying to Heroku...${NC}"
git push heroku main
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Deployed successfully${NC}"
echo ""

echo -e "${YELLOW}Step 5: Checking deployment status...${NC}"
heroku ps -a vila-falo-resort-8208afd24e04
echo ""

echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Set Paysera credentials: heroku config:set PAYSERA_PROJECT_ID=your_id"
echo "2. Set Paysera password: heroku config:set PAYSERA_SIGN_PASSWORD=your_password"
echo "3. Test your site: heroku open"
echo ""
echo "View logs: heroku logs --tail"
echo ""
