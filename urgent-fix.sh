#!/bin/bash

echo "🚨 URGENT FIX - Website Loading Issue"
echo "======================================"

# Quick status check
echo "📋 Current status..."
git status --short

# Add all changes
echo "📦 Adding all fixes..."
git add .

# Quick commit
echo "💾 Committing urgent fixes..."
git commit -m "🚨 URGENT FIX: Website loading issue - Multiple fallbacks added

✅ Fixed CSP blocking inline scripts
✅ Added CSS animation fallback for loader
✅ Added JavaScript fallbacks (500ms, 1s, 2.5s)
✅ Made all content visible by default
✅ Added ultimate inline script fallback

The website should now load properly!"

# Deploy immediately
echo "🚀 Deploying fix to production..."
git push heroku main

echo ""
echo "✅ URGENT FIX DEPLOYED!"
echo "🌐 Check: https://vila-falo-resort-8208afd24e04.herokuapp.com"
echo ""
echo "The website should now load properly with multiple fallback systems."
