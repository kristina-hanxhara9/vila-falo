#!/bin/bash

# ==============================================
# VILA FALO - HEROKU ENVIRONMENT SETUP
# ==============================================

echo "🚀 Setting up Heroku environment variables..."

# Database Configuration
heroku config:set MONGODB_URI="mongodb+srv://kristinazhi97:Deon2020.@falo.nxe5orf.mongodb.net/vilafalo?retryWrites=true&w=majority&appName=Falo" -a vila-falo-resort

# Server Configuration  
heroku config:set PORT=5000 -a vila-falo-resort
heroku config:set NODE_ENV=production -a vila-falo-resort

# Security Configuration
heroku config:set JWT_SECRET="a8f5f167f44f4964e6c998dee827110c0c9b0c43c7e1b7c6f7f6f8f9f1e2d3c4b5a6978899001234567890abcdef1234567890fedcba0987654321" -a vila-falo-resort

# Admin & Email Configuration
heroku config:set ADMIN_USERNAME="admin" -a vila-falo-resort
heroku config:set ADMIN_PASSWORD="admin123" -a vila-falo-resort
heroku config:set ADMIN_EMAIL="vilafalo@gmail.com" -a vila-falo-resort
heroku config:set EMAIL_USER="vilafalo@gmail.com" -a vila-falo-resort
heroku config:set EMAIL_PASS="your-gmail-app-password-here" -a vila-falo-resort
heroku config:set EMAIL_FROM="vilafalo@gmail.com" -a vila-falo-resort
heroku config:set EMAIL_FROM_NAME="Vila Falo Resort" -a vila-falo-resort

# Email SMTP Settings
heroku config:set EMAIL_HOST="smtp.gmail.com" -a vila-falo-resort
heroku config:set EMAIL_PORT=587 -a vila-falo-resort
heroku config:set EMAIL_SECURE=false -a vila-falo-resort

# Contact Information
heroku config:set VILLA_PHONE="+355 68 336 9436" -a vila-falo-resort
heroku config:set VILLA_EMAIL="vilafalo@gmail.com" -a vila-falo-resort

# GEMINI API KEY (you need to get this from Google AI Studio)
echo "⚠️  IMPORTANT: You need to set your GEMINI_API_KEY manually:"
echo "   1. Go to https://aistudio.google.com/app/apikey"
echo "   2. Create a new API key"
echo "   3. Run: heroku config:set GEMINI_API_KEY=\"your-api-key-here\" -a vila-falo-resort"

echo "✅ Environment variables setup complete!"
echo "📝 Don't forget to set your GEMINI_API_KEY and update EMAIL_PASS with a real Gmail app password!"
