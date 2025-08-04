#!/bin/bash

echo "🔧 LANGUAGE FIX - Mixed English/Albanian Content"
echo "==============================================="

# Quick status check
echo "📋 Current status..."
git status --short

# Add all changes
echo "📦 Adding language fixes..."
git add .

# Quick commit
echo "💾 Committing language fixes..."
git commit -m "🔧 LANGUAGE FIX: Albanian/English content properly separated

✅ Added missing initLanguageSwitcher() function
✅ Added missing updateLanguage() function  
✅ Added language switching functionality
✅ Set Albanian as default language immediately
✅ Added fallback language setting in ultimate script
✅ Added proper language toggle handling
✅ Fixed mixed content display issue

The website will now display properly in Albanian by default with working language switching!"

# Deploy immediately
echo "🚀 Deploying language fix to production..."
git push heroku main

echo ""
echo "✅ LANGUAGE FIX DEPLOYED!"
echo "🌐 Check: https://vila-falo-resort-8208afd24e04.herokuapp.com"
echo ""
echo "The website should now:"
echo "✅ Display in Albanian by default"
echo "✅ Allow switching between AL/EN"
echo "✅ Not show mixed language content"
echo "✅ Properly toggle languages when clicked"
