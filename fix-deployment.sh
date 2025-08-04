#!/bin/bash

echo "🔧 Fixing Vila Falo deployment issue..."

# Remove node_modules only (keep package-lock.json for consistency)
echo "🗑️  Removing node_modules..."
rm -rf node_modules

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Reinstall dependencies
echo "📦 Reinstalling dependencies..."
npm install

# Run health check
echo "🏥 Running health check..."
npm run health

echo "✅ Fix complete! Try deploying to Heroku again."
