#!/bin/bash

# Quick fix for nodemailer issue
echo "🔧 Fixing nodemailer..."

# Reinstall nodemailer specifically
npm uninstall nodemailer
npm install nodemailer@latest --save

echo "✅ Nodemailer reinstalled!"
echo ""
echo "Now run: npm start"
