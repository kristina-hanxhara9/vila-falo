#!/bin/bash

# Vila Falo - Heroku Environment Setup Script
echo "🚀 Setting up Heroku Environment Variables for Vila Falo"
echo "======================================================="

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Please login to Heroku first:"
    echo "   heroku login"
    exit 1
fi

# Get the app name
APP_NAME="vila-falo-resort-8208afd24e04"
echo "🏨 Setting up environment for app: $APP_NAME"

# Set required environment variables
echo "🔧 Setting environment variables..."

# Database Configuration
heroku config:set NODE_ENV=production -a $APP_NAME
heroku config:set MONGODB_URI="mongodb+srv://kristinazhi97:Deon2020.@falo.nxe5orf.mongodb.net/vilafalo?retryWrites=true&w=majority&appName=Falo" -a $APP_NAME

# Security Configuration
heroku config:set JWT_SECRET="a8f5f167f44f4964e6c998dee827110c0c9b0c43c7e1b7c6f7f6f8f9f1e2d3c4b5a6978899001234567890abcdef1234567890fedcba0987654321" -a $APP_NAME

# Admin Configuration
heroku config:set ADMIN_USERNAME=admin -a $APP_NAME
heroku config:set ADMIN_PASSWORD=admin123 -a $APP_NAME

# Email Configuration
heroku config:set EMAIL_USER="vilafalo@gmail.com" -a $APP_NAME
heroku config:set EMAIL_PASS="kteb onut dkxy mufm" -a $APP_NAME
heroku config:set GMAIL_APP_PASSWORD="kteb onut dkxy mufm" -a $APP_NAME
heroku config:set ADMIN_EMAIL="vilafalo@gmail.com" -a $APP_NAME
heroku config:set EMAIL_FROM="Vila Falo Resort <vilafalo@gmail.com>" -a $APP_NAME
heroku config:set EMAIL_FROM_NAME="Vila Falo Resort" -a $APP_NAME

# Email SMTP Settings
heroku config:set EMAIL_HOST="smtp.gmail.com" -a $APP_NAME
heroku config:set EMAIL_PORT=587 -a $APP_NAME
heroku config:set EMAIL_SECURE=false -a $APP_NAME

# Contact Information
heroku config:set VILLA_PHONE="+355 68 336 9436" -a $APP_NAME
heroku config:set VILLA_EMAIL="vilafalo@gmail.com" -a $APP_NAME

echo ""
echo "⚠️  IMPORTANT: You need to set your GEMINI_API_KEY manually!"
echo "🔑 Get your API key from: https://makersuite.google.com/app/apikey"
echo "🛠️  Then run: heroku config:set GEMINI_API_KEY=\"your-actual-api-key-here\" -a $APP_NAME"
echo ""

# Show current config
echo "📋 Current Heroku configuration:"
heroku config -a $APP_NAME

echo ""
echo "✅ Heroku environment setup completed!"
echo "🔗 Next steps:"
echo "   1. Set your GEMINI_API_KEY (see above)"
echo "   2. Deploy: git push heroku main"
echo "   3. Check logs: heroku logs --tail -a $APP_NAME"
echo ""
