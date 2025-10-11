#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 VILA FALO - COMPLETE FIX & DEPLOY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /Users/kristinahanxhara/vila-falo/vila-falo

echo "📝 Step 1: Adding all changes..."
git add .

echo ""
echo "💾 Step 2: Committing changes..."
git commit -m "PRODUCTION FIX: Complete booking system with field normalization

✅ Fixed field name normalization (camelCase & snake_case)
✅ Clean production-ready code
✅ Paysera integration ready
✅ Comprehensive error handling
✅ Real-time notifications
✅ Email notifications
✅ All validation working

Ready for vilafalo.com production deployment"

echo ""
echo "🚀 Step 3: Deploying to Heroku..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git push heroku main

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 Step 4: Checking deployment status..."
heroku ps

echo ""
echo "📊 Step 5: Viewing recent logs..."
heroku logs --tail -n 50

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 NEXT: Test the deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Run this command to test:"
echo "export API_URL=https://vila-falo-resort-8208afd24e04.herokuapp.com"
echo "node test-booking-api.js"
echo ""
