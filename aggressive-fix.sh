#!/bin/bash

echo "🚨 AGGRESSIVE FIX: Resolving persistent MongoDB module error..."

# Step 1: Complete cleanup
echo "🗑️  Step 1: Complete cleanup..."
rm -rf node_modules
rm -f package-lock.json
rm -rf .npm
npm cache clean --force

# Step 2: Clear Heroku build cache
echo "🧹 Step 2: Clearing Heroku build cache..."
heroku plugins:install heroku-repo 2>/dev/null || echo "Plugin already installed"
heroku repo:purge_cache -a vila-falo-resort

# Step 3: Install updated dependencies
echo "📦 Step 3: Installing updated dependencies..."
npm install

# Step 4: Test locally
echo "🏥 Step 4: Testing locally..."
npm run health

# Step 5: Deploy to Heroku
echo "🚀 Step 5: Deploying to Heroku..."
git add .
git commit -m "Fix: Update MongoDB/Mongoose to resolve module loading error"
git push heroku main

echo "✅ Aggressive fix complete! Check heroku logs for results."
echo "🔍 Monitor with: heroku logs --tail -a vila-falo-resort"
