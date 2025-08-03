@echo off
REM Vila Falo Quick Start Script for Windows

echo 🏔️  Vila Falo - Mountain Resort Booking System
echo ==============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first:
    echo    https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm found
npm --version

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo.
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
)

REM Check if .env file exists
if not exist ".env" (
    echo.
    echo ⚙️  Setting up environment file...
    if exist ".env.example" (
        echo 📋 Running automatic setup...
        npm run auto-setup
        if %errorlevel% neq 0 (
            echo ❌ Auto-setup failed
            pause
            exit /b 1
        )
    ) else (
        echo ❌ .env.example file not found. Please create .env manually.
        pause
        exit /b 1
    )
) else (
    echo ✅ Environment file found
    
    REM Check if JWT_SECRET exists
    findstr /C:"JWT_SECRET=" ".env" >nul
    if %errorlevel% neq 0 (
        echo 🔐 JWT_SECRET missing, running auto-setup...
        npm run auto-setup
    )
)

REM Run health check
echo.
echo 🔍 Running health check...
npm run health

if %errorlevel% equ 0 (
    echo.
    echo 🎉 Everything looks good! Ready to start the application.
    echo.
    echo Choose how to start:
    echo 1) Development mode (auto-restart on changes)
    echo 2) Production mode  
    echo 3) Run health check only
    echo 4) Exit
    echo.
    
    set /p choice="Enter your choice (1-4): "
    
    if "%choice%"=="1" (
        echo.
        echo 🚀 Starting in development mode...
        echo Application will be available at:
        echo    Client Site: http://localhost:5000
        echo    Admin Panel: http://localhost:5000/admin
        echo.
        echo Press Ctrl+C to stop the server
        echo.
        npm run dev
    ) else if "%choice%"=="2" (
        echo.
        echo 🚀 Starting in production mode...
        echo Application will be available at:
        echo    Client Site: http://localhost:5000
        echo    Admin Panel: http://localhost:5000/admin
        echo.
        echo Press Ctrl+C to stop the server
        echo.
        npm start
    ) else if "%choice%"=="3" (
        echo Health check completed.
        pause
    ) else if "%choice%"=="4" (
        echo Goodbye!
        exit /b 0
    ) else (
        echo Invalid choice. Exiting.
        pause
        exit /b 1
    )
) else (
    echo.
    echo ❌ Health check failed. Please fix the issues above before starting.
    echo.
    echo 💡 Common fixes:
    echo    - Make sure MongoDB URI is set in .env
    echo    - Generate JWT_SECRET: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    echo    - Set ADMIN_USERNAME and ADMIN_PASSWORD in .env
    echo.
    echo 📖 Check QUICKSTART.md for detailed setup instructions
    pause
    exit /b 1
)
