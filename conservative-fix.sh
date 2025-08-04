#!/bin/bash

echo "🔄 CONSERVATIVE FIX: Mongoose compatibility issue..."

# Step 1: Clean dependencies
echo "🗑️  Step 1: Cleaning dependencies..."
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force

# Step 2: Install conservative versions
echo "📦 Step 2: Installing stable Mongoose 7.6.3..."
npm install

# Step 3: Test locally
echo "🏥 Step 3: Testing locally..."
npm run health

# Step 4: Deploy to Heroku
echo "🚀 Step 4: Deploying stable version to Heroku..."
git add .
git commit -m "Fix: Revert to stable Mongoose 7.6.3 to resolve bulkWriteResult error"
git push heroku main

echo "✅ Conservative fix complete!"
echo "🔍 Monitor with: heroku logs --tail -a vila-falo-resort"
