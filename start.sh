#!/bin/bash

# Vila Falo Quick Start Script
echo "🏔️  Vila Falo - Mountain Resort Booking System"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️  Setting up environment file..."
    if [ -f ".env.example" ]; then
        echo "📋 Running automatic setup..."
        npm run auto-setup
        if [ $? -ne 0 ]; then
            echo "❌ Auto-setup failed"
            exit 1
        fi
    else
        echo "❌ .env.example file not found. Please create .env manually."
        exit 1
    fi
else
    echo "✅ Environment file found"
    
    # Check if JWT_SECRET exists
    if ! grep -q "JWT_SECRET=" ".env" || grep -q "JWT_SECRET=$" ".env"; then
        echo "🔐 JWT_SECRET missing or empty, running auto-setup..."
        npm run auto-setup
    fi
fi

# Run health check
echo ""
echo "🔍 Running health check..."
npm run health

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Everything looks good! Ready to start the application."
    echo ""
    echo "Choose how to start:"
    echo "1) Development mode (auto-restart on changes)"
    echo "2) Production mode"
    echo "3) Run health check only"
    echo "4) Exit"
    echo ""
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            echo ""
            echo "🚀 Starting in development mode..."
            echo "Application will be available at:"
            echo "   Client Site: http://localhost:5000"
            echo "   Admin Panel: http://localhost:5000/admin"
            echo ""
            echo "Press Ctrl+C to stop the server"
            echo ""
            npm run dev
            ;;
        2)
            echo ""
            echo "🚀 Starting in production mode..."
            echo "Application will be available at:"
            echo "   Client Site: http://localhost:5000"
            echo "   Admin Panel: http://localhost:5000/admin"
            echo ""
            echo "Press Ctrl+C to stop the server"
            echo ""
            npm start
            ;;
        3)
            echo "Health check completed."
            ;;
        4)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid choice. Exiting."
            exit 1
            ;;
    esac
else
    echo ""
    echo "❌ Health check failed. Please fix the issues above before starting."
    echo ""
    echo "💡 Common fixes:"
    echo "   - Make sure MongoDB URI is set in .env"
    echo "   - Generate JWT_SECRET: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    echo "   - Set ADMIN_USERNAME and ADMIN_PASSWORD in .env"
    echo ""
    echo "📖 Check QUICKSTART.md for detailed setup instructions"
    exit 1
fi
