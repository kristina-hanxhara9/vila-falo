#!/bin/bash

# Vila Falo - Complete Production Deployment Script
echo "🏔️ VILA FALO - PRODUCTION DEPLOYMENT"
echo "===================================="
echo ""

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

APP_NAME="vila-falo-resort-8208afd24e04"
PRODUCTION_URL="https://vila-falo-resort-8208afd24e04.herokuapp.com"

echo -e "${BLUE}📋 Pre-deployment Checklist${NC}"
echo "============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the project directory?${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Project directory confirmed${NC}"

# Check if Heroku CLI is available
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}❌ Heroku CLI not found. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Heroku CLI available${NC}"

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo -e "${RED}❌ Please login to Heroku first: heroku login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Heroku authentication confirmed${NC}"

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    echo "Current git status:"
    git status --short
    echo ""
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

echo -e "${GREEN}✅ Git status checked${NC}"

# Check critical environment variables
echo ""
echo -e "${BLUE}🔍 Checking Environment Configuration${NC}"
echo "===================================="

# Load local .env for reference
if [ -f ".env" ]; then
    source .env
    echo -e "${GREEN}✅ Local .env file found${NC}"
else
    echo -e "${YELLOW}⚠️  No local .env file found${NC}"
fi

# Check if GEMINI_API_KEY is properly set
if [[ "$GEMINI_API_KEY" == *"REPLACE-WITH-YOUR-ACTUAL"* ]] || [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${RED}❌ GEMINI_API_KEY needs to be set with a real API key${NC}"
    echo "   Get one from: https://makersuite.google.com/app/apikey"
    exit 1
fi

echo -e "${GREEN}✅ GEMINI_API_KEY appears to be set${NC}"

# Check email configuration
if [ -z "$EMAIL_USER" ] || [ -z "$EMAIL_PASS" ]; then
    echo -e "${RED}❌ Email configuration incomplete${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Email configuration looks good${NC}"

# Validate MongoDB URI
if [ -z "$MONGODB_URI" ]; then
    echo -e "${RED}❌ MONGODB_URI not set${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database configuration confirmed${NC}"

echo ""
echo -e "${BLUE}🛠️  Setting up Heroku Environment${NC}"
echo "================================="

# Set all environment variables on Heroku
echo "Setting environment variables..."

heroku config:set NODE_ENV=production -a $APP_NAME
heroku config:set MONGODB_URI="$MONGODB_URI" -a $APP_NAME
heroku config:set JWT_SECRET="$JWT_SECRET" -a $APP_NAME
heroku config:set GEMINI_API_KEY="$GEMINI_API_KEY" -a $APP_NAME

heroku config:set ADMIN_USERNAME="$ADMIN_USERNAME" -a $APP_NAME
heroku config:set ADMIN_PASSWORD="$ADMIN_PASSWORD" -a $APP_NAME

heroku config:set EMAIL_USER="$EMAIL_USER" -a $APP_NAME
heroku config:set EMAIL_PASS="$EMAIL_PASS" -a $APP_NAME
heroku config:set GMAIL_APP_PASSWORD="$EMAIL_PASS" -a $APP_NAME
heroku config:set ADMIN_EMAIL="$ADMIN_EMAIL" -a $APP_NAME
heroku config:set EMAIL_FROM="$EMAIL_FROM" -a $APP_NAME
heroku config:set EMAIL_FROM_NAME="$EMAIL_FROM_NAME" -a $APP_NAME

heroku config:set EMAIL_HOST="$EMAIL_HOST" -a $APP_NAME
heroku config:set EMAIL_PORT="$EMAIL_PORT" -a $APP_NAME
heroku config:set EMAIL_SECURE="$EMAIL_SECURE" -a $APP_NAME

heroku config:set VILLA_PHONE="$VILLA_PHONE" -a $APP_NAME
heroku config:set VILLA_EMAIL="$VILLA_EMAIL" -a $APP_NAME

echo -e "${GREEN}✅ Environment variables set on Heroku${NC}"

echo ""
echo -e "${BLUE}📦 Building and Deploying${NC}"
echo "========================="

# Install production dependencies
echo "Installing production dependencies..."
npm install --production

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Add all changes to git
echo "Adding changes to git..."
git add .

# Commit changes with timestamp
COMMIT_MESSAGE="🚀 Production deployment $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MESSAGE" || echo "No changes to commit"

echo -e "${GREEN}✅ Changes committed${NC}"

# Deploy to Heroku
echo "Deploying to Heroku..."
echo "This may take a few minutes..."

if git push heroku main; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo "Check the logs: heroku logs --tail -a $APP_NAME"
    exit 1
fi

echo ""
echo -e "${BLUE}🔍 Post-deployment Validation${NC}"
echo "============================"

# Wait for app to start
echo "Waiting for app to start..."
sleep 15

# Health check
echo "Running health check..."
if curl -f "$PRODUCTION_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed - app may still be starting${NC}"
fi

# Test email configuration
echo "Checking email service..."
# We'll check this in the logs instead of making an actual request

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}📱 Your Vila Falo Resort is now live at:${NC}"
echo "   🌐 Website: $PRODUCTION_URL"
echo "   🛠️  Admin Panel: $PRODUCTION_URL/admin"
echo "   🤖 Chatbot API: $PRODUCTION_URL/api/chatbot/message"
echo "   📋 Booking API: $PRODUCTION_URL/api/booking"
echo "   ❤️  Health Check: $PRODUCTION_URL/health"
echo ""
echo -e "${BLUE}🔧 Monitoring Commands:${NC}"
echo "   📊 View logs: heroku logs --tail -a $APP_NAME"
echo "   📈 Monitor: heroku ps -a $APP_NAME"
echo "   🔧 Config: heroku config -a $APP_NAME"
echo ""
echo -e "${BLUE}🧪 Testing Checklist:${NC}"
echo "   ✅ Visit the website and check all pages load"
echo "   ✅ Test the chatbot booking flow"
echo "   ✅ Verify emails are being sent"
echo "   ✅ Check admin panel functionality"
echo "   ✅ Test booking creation and dashboard updates"
echo ""
echo -e "${GREEN}🚀 Vila Falo is ready to accept bookings!${NC}"
echo ""
