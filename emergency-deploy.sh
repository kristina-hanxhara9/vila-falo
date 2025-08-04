#!/bin/bash

echo "🚨 EMERGENCY PRODUCTION DEPLOYMENT - Vila Falo Resort"
echo "=================================================="

# Set error handling
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Clean everything
echo -e "${YELLOW}🧹 Step 1: Cleaning previous builds...${NC}"
rm -rf node_modules package-lock.json
heroku ps:scale web=0 -a vila-falo-resort || echo "App not running, continuing..."

# Step 2: Clear Heroku cache (critical!)
echo -e "${YELLOW}🗑️  Step 2: Clearing Heroku build cache...${NC}"
heroku builds:cache:purge -a vila-falo-resort || echo "Cache clear failed, continuing..."

# Step 3: Set critical environment variables
echo -e "${YELLOW}⚙️  Step 3: Setting environment variables...${NC}"
heroku config:set NODE_ENV=production -a vila-falo-resort
heroku config:set NPM_CONFIG_PRODUCTION=false -a vila-falo-resort
heroku config:set NODE_MODULES_CACHE=false -a vila-falo-resort

# Step 4: Create release commands in Procfile
echo -e "${YELLOW}📝 Step 4: Updating Procfile...${NC}"
cat > Procfile << EOF
web: npm start
release: npm rebuild
EOF

# Step 5: Deploy with force
echo -e "${YELLOW}🚀 Step 5: Deploying to production...${NC}"
git add .
git commit -m "EMERGENCY FIX: Resolve mongoose binary loading issue - mongoose 7.x upgrade"
git push heroku main --force

# Step 6: Scale up and monitor
echo -e "${YELLOW}📈 Step 6: Scaling up and monitoring...${NC}"
heroku ps:scale web=1 -a vila-falo-resort

# Step 7: Wait and test
echo -e "${YELLOW}⏳ Step 7: Waiting for deployment...${NC}"
sleep 15

# Test the deployment
echo -e "${BLUE}🧪 Testing deployment...${NC}"
if curl -s --fail https://vila-falo-resort-8208afd24e04.herokuapp.com/health; then
    echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${GREEN}🌐 Your app is live at: https://vila-falo-resort-8208afd24e04.herokuapp.com${NC}"
    echo -e "${GREEN}👨‍💼 Admin panel: https://vila-falo-resort-8208afd24e04.herokuapp.com/admin${NC}"
else
    echo -e "${RED}❌ Deployment test failed. Checking logs...${NC}"
    heroku logs --tail -a vila-falo-resort
fi

echo -e "${BLUE}📊 Current app status:${NC}"
heroku ps -a vila-falo-resort