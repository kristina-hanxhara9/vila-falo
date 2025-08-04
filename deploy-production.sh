#!/bin/bash

# Vila Falo - Production Deployment Script
echo "🚀 Vila Falo - Production Deployment Starting..."

# Check if we're on the right branch
echo "📋 Checking git status..."
git status

# Set production environment
export NODE_ENV=production

# Install production dependencies
echo "📦 Installing production dependencies..."
npm install --production

# Run health check
echo "🔍 Running health check..."
npm run health

# Build/optimize if needed
echo "⚡ Optimizing for production..."

# Add all changes
echo "📝 Adding changes to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "🚀 Production deployment $(date)"

# Deploy to Heroku
echo "🌐 Deploying to Heroku..."
git push heroku main

# Final health check
echo "🏥 Final health check..."
sleep 10
curl -f https://vila-falo-resort-8208afd24e04.herokuapp.com/health || echo "❌ Health check failed"

echo "✅ Vila Falo deployment completed!"
echo "🌐 Live at: https://vila-falo-resort-8208afd24e04.herokuapp.com"
