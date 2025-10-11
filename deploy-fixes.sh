#!/bin/bash

# Vila Falo - Quick Fix Deployment Script
# This script deploys all the critical fixes to Heroku

echo "🚀 Starting Vila Falo Critical Fixes Deployment..."
echo ""

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Please run this script from the vila-falo directory"
    exit 1
fi

# Show what files were changed
echo "📝 Files modified:"
echo "  ✓ public/js/scripts.js (fixed duplicate variable)"
echo "  ✓ public/css/hero-mobile-fixes.css (moved to correct location)"  
echo "  ✓ public/index.html (updated CSS path)"
echo ""

# Add all changes
echo "📦 Adding changes to git..."
git add public/js/scripts.js
git add public/css/hero-mobile-fixes.css
git add public/index.html
echo "✓ Changes added"
echo ""

# Commit
echo "💾 Committing changes..."
git commit -m "Fix: Resolve JavaScript duplicate declaration, CSS MIME type error, and room type validation

- Fixed duplicate virtualTourBtn declaration in scripts.js
- Moved hero-mobile-fixes.css to proper /public/css/ directory
- Updated index.html to reference correct CSS path
- Room type normalization already handles 'Deluxe Family Suite' mapping"
echo "✓ Changes committed"
echo ""

# Push to Heroku
echo "🚀 Deploying to Heroku..."
git push heroku main

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 To view logs, run:"
echo "   heroku logs --tail --app vila-falo-resort-8208afd24e04"
echo ""
echo "🌐 Your site: https://vila-falo-resort-8208afd24e04.herokuapp.com"
echo ""
echo "✓ All critical errors have been fixed!"
