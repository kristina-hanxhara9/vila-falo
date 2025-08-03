#!/usr/bin/env node

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function healthCheck() {
    console.log('🔍 Vila Falo Application Health Check');
    console.log('=====================================');
    
    let allGood = true;
    
    // Check Node.js version
    console.log('\n📋 Node.js Version Check:');
    const nodeVersion = process.version;
    console.log(`   Node.js Version: ${nodeVersion}`);
    
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion >= 14) {
        console.log('   ✅ Node.js version is compatible');
    } else {
        console.log('   ❌ Node.js version too old (need v14+)');
        allGood = false;
    }
    
    // Check environment variables
    console.log('\n🔐 Environment Variables Check:');
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
    const optionalEnvVars = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'PORT', 'NODE_ENV'];
    
    requiredEnvVars.forEach(varName => {
        if (process.env[varName]) {
            console.log(`   ✅ ${varName}: Set`);
        } else {
            console.log(`   ❌ ${varName}: Missing (REQUIRED)`);
            allGood = false;
        }
    });
    
    optionalEnvVars.forEach(varName => {
        if (process.env[varName]) {
            console.log(`   ✅ ${varName}: Set`);
        } else {
            console.log(`   ⚠️  ${varName}: Not set (optional)`);
        }
    });
    
    // Check file structure
    console.log('\n📁 File Structure Check:');
    const requiredFiles = [
        'server.js',
        'package.json',
        '.env',
        'public/index.html',
        'public/admin-panel.html',
        'config/db.js',
        'models/Booking.js',
        'routes/bookingRoutes.js'
    ];
    
    requiredFiles.forEach(filePath => {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
            console.log(`   ✅ ${filePath}: Found`);
        } else {
            console.log(`   ❌ ${filePath}: Missing`);
            allGood = false;
        }
    });
    
    // Check MongoDB connection
    console.log('\n🗄️  Database Connection Check:');
    if (process.env.MONGODB_URI) {
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('   ✅ MongoDB connection successful');
            
            // Test basic database operations
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log(`   ✅ Database accessible (${collections.length} collections found)`);
            
            await mongoose.connection.close();
        } catch (error) {
            console.log('   ❌ MongoDB connection failed:', error.message);
            allGood = false;
        }
    } else {
        console.log('   ❌ Cannot test MongoDB - URI not set');
        allGood = false;
    }
    
    // Check package dependencies
    console.log('\n📦 Dependencies Check:');
    try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
        const requiredDeps = [
            'express', 'mongoose', 'cors', 'dotenv', 
            'bcryptjs', 'jsonwebtoken', 'body-parser', 'cookie-parser'
        ];
        
        requiredDeps.forEach(dep => {
            if (packageJson.dependencies && packageJson.dependencies[dep]) {
                console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
            } else {
                console.log(`   ❌ ${dep}: Missing`);
                allGood = false;
            }
        });
    } catch (error) {
        console.log('   ❌ Error reading package.json:', error.message);
        allGood = false;
    }
    
    // Final result
    console.log('\n🎯 Overall Health Check Result:');
    if (allGood) {
        console.log('   ✅ All checks passed! Your app is ready to run.');
        console.log('\n🚀 To start your application:');
        console.log('   Development: npm run dev');
        console.log('   Production:  npm start');
        console.log('\n🌐 Access URLs:');
        console.log(`   Client Site: http://localhost:${process.env.PORT || 5000}`);
        console.log(`   Admin Panel: http://localhost:${process.env.PORT || 5000}/admin`);
        process.exit(0);
    } else {
        console.log('   ❌ Some issues found. Please fix them before starting the app.');
        console.log('\n📖 Check the README.md or QUICKSTART.md for setup instructions.');
        process.exit(1);
    }
}

// Run the health check
healthCheck().catch(error => {
    console.error('❌ Health check failed:', error);
    process.exit(1);
});
