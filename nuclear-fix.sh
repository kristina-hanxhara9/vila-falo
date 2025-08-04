#!/bin/bash

echo "🔥 NUCLEAR OPTION: Complete Heroku rebuild..."

# Step 1: Local cleanup
echo "🗑️  Step 1: Complete local cleanup..."
rm -rf node_modules
rm -f package-lock.json
rm -rf .npm
npm cache clean --force

# Step 2: Install ultra-stable versions
echo "📦 Step 2: Installing ultra-stable Mongoose 6.12.0..."
npm install

# Step 3: Test locally
echo "🏥 Step 3: Testing locally..."
npm run health
if [ $? -ne 0 ]; then
    echo "❌ Local test failed! Check your setup."
    exit 1
fi

# Step 4: Force complete Heroku rebuild
echo "🔥 Step 4: Forcing complete Heroku rebuild..."

# Add a dummy file to force rebuild
echo "# Force rebuild $(date)" > .buildpack-force-rebuild

# Clear Heroku cache aggressively
heroku plugins:install heroku-repo 2>/dev/null || echo "Plugin already installed"
heroku repo:purge_cache -a vila-falo-resort

# Restart all dynos
heroku ps:restart -a vila-falo-resort

# Step 5: Deploy with force
echo "🚀 Step 5: Deploying with nuclear option..."
git add .
git commit -m "Nuclear fix: Mongoose 6.12.0 + complete rebuild $(date)"
git push heroku main --force

# Step 6: Monitor results
echo "📊 Step 6: Monitoring deployment..."
sleep 10
heroku logs --tail -a vila-falo-resort &
LOGS_PID=$!

# Wait a bit then check if it's working
sleep 30
kill $LOGS_PID 2>/dev/null

echo ""
echo "✅ Nuclear option complete!"
echo "🔍 Check your app: https://vila-falo-resort-8208afd24e04.herokuapp.com"
echo "📋 Monitor logs: heroku logs --tail -a vila-falo-resort"
