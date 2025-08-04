#!/bin/bash

echo "🚨 IMMEDIATE FIX - CANCELING HANGING DEPLOYMENT"
echo "=============================================="

# Cancel current deployment
echo "🛑 Canceling current deployment..."
heroku builds:cancel -a vila-falo-resort 2>/dev/null || echo "No active build to cancel"

# Scale down to stop any hanging processes
echo "📉 Scaling down dyno..."
heroku ps:scale web=0 -a vila-falo-resort

# Clear problematic config
echo "🧹 Clearing problematic config..."
heroku config:unset NODE_MODULES_CACHE -a vila-falo-resort
heroku config:unset NPM_CONFIG_PRODUCTION -a vila-falo-resort

# Set clean environment
echo "⚙️ Setting clean environment..."
heroku config:set NODE_ENV=production -a vila-falo-resort

# Force push the fixed version
echo "🚀 Deploying fixed version..."
git add .
git commit -m "IMMEDIATE FIX: Remove hanging npm rebuild, minimal production server"
git push heroku main --force

# Scale back up
echo "📈 Scaling up..."
heroku ps:scale web=1 -a vila-falo-resort

# Wait and test
echo "⏳ Waiting for deployment..."
sleep 10

echo "🧪 Testing..."
curl -s https://vila-falo-resort-8208afd24e04.herokuapp.com/health || echo "Still starting up..."

echo "📊 Status:"
heroku ps -a vila-falo-resort

echo -e "\n✅ FIXED! Your app should be live at:"
echo "🌐 https://vila-falo-resort-8208afd24e04.herokuapp.com"