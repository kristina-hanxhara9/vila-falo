#!/bin/bash

echo "🚀 Deploying Email Fix + Testing Booking System"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /Users/kristinahanxhara/vila-falo/vila-falo

# Deploy
echo "📦 Committing email service fix..."
git add services/emailService.js
git commit -m "Fix: Email service typo (createTransporter → createTransport)"

echo ""
echo "🚀 Deploying to Heroku..."
git push heroku main

echo ""
echo "⏳ Waiting for deployment to complete (10 seconds)..."
sleep 10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TESTING BOOKING SYSTEM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

./manual-test.sh
