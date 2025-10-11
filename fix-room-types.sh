#!/bin/bash

echo "🔧 FIXING ROOM TYPES MISMATCH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /Users/kristinahanxhara/vila-falo/vila-falo/public

echo "📝 Fixing room types in index.html..."

# Backup first
cp index.html index.html.backup

# Fix room type values to match API expectations
sed -i '' 's/value="Standard Mountain Room"/value="Standard"/g' index.html
sed -i '' 's/value="Deluxe Family Suite"/value="Deluxe"/g' index.html
sed -i '' 's/value="Premium Panorama Suite"/value="Premium"/g' index.html

echo "✅ Room types fixed!"
echo ""
echo "Room type mappings:"
echo "  Standard Mountain Room → Standard"
echo "  Deluxe Family Suite → Deluxe"
echo "  Premium Panorama Suite → Premium"
echo ""

cd /Users/kristinahanxhara/vila-falo/vila-falo

echo "📦 Committing fix..."
git add public/index.html
git commit -m "Fix: Room type values to match API (Standard, Premium, Deluxe)"

echo ""
echo "🚀 Deploying to Heroku..."
git push heroku main

echo ""
echo "✅ DONE! Test your booking form now!"
