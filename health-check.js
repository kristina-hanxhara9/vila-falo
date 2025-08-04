// Enhanced health check for production
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🏥 Vila Falo Resort - Production Health Check');
console.log('==========================================');

const runHealthCheck = async () => {
    let exitCode = 0;
    const results = [];

    // Node.js Version Check
    console.log('\n📋 System Environment:');
    const nodeVersion = process.version;
    const expectedNode = '20.x';
    const nodeOk = nodeVersion.startsWith('v20.');
    
    console.log(`   Node.js Version: ${nodeVersion} ${nodeOk ? '✅' : '❌'}`);
    console.log(`   Platform: ${process.platform}`);
    console.log(`   Architecture: ${process.arch}`);
    
    if (!nodeOk) {
        results.push('❌ Node.js version incompatible');
        exitCode = 1;
    }

    // Environment Variables Check
    console.log('\n🔐 Environment Variables:');
    const requiredEnvVars = [
        'MONGODB_URI',
        'JWT_SECRET', 
        'ADMIN_USERNAME',
        'ADMIN_PASSWORD'
    ];

    const optionalEnvVars = [
        'PORT',
        'NODE_ENV',
        'CORS_ORIGIN',
        'BASE_URL'
    ];

    let envOk = true;
    requiredEnvVars.forEach(envVar => {
        const exists = !!process.env[envVar];
        console.log(`   ${envVar}: ${exists ? 'Set ✅' : 'Missing ❌'}`);
        if (!exists) {
            envOk = false;
            exitCode = 1;
        }
    });

    optionalEnvVars.forEach(envVar => {
        const exists = !!process.env[envVar];
        console.log(`   ${envVar}: ${exists ? 'Set ✅' : 'Not Set ⚠️'}`);
    });

    if (!envOk) {
        results.push('❌ Required environment variables missing');
    }

    // File Structure Check
    console.log('\n📁 File Structure:');
    const requiredFiles = [
        'server.js',
        'package.json',
        '.env',
        'public/index.html',
        'public/admin-panel.html',
        'config/db.js',
        'models/Booking.js',
        'routes/bookingRoutes.js',
        'middleware/errorHandler.js'
    ];

    let filesOk = true;
    requiredFiles.forEach(file => {
        const exists = fs.existsSync(path.join(__dirname, file));
        console.log(`   ${file}: ${exists ? 'Found ✅' : 'Missing ❌'}`);
        if (!exists) {
            filesOk = false;
            exitCode = 1;
        }
    });

    if (!filesOk) {
        results.push('❌ Required files missing');
    }

    // Database Connection Check
    console.log('\n🗄️  Database Connection:');
    try {
        const { connectDB, checkConnection } = require('./config/db');
        
        // Test connection
        await connectDB();
        
        const connectionInfo = checkConnection();
        console.log(`   Status: ${connectionInfo.status} ${connectionInfo.isConnected ? '✅' : '❌'}`);
        console.log(`   Host: ${connectionInfo.host || 'Unknown'}`);
        console.log(`   Database: ${connectionInfo.name || 'Unknown'}`);
        
        if (connectionInfo.isConnected) {
            // Test basic operations
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log(`   Collections: ${collections.length} found ✅`);
            
            // Test a simple query
            try {
                await mongoose.connection.db.admin().ping();
                console.log(`   Ping test: Success ✅`);
            } catch (pingError) {
                console.log(`   Ping test: Failed ❌`);
                results.push('❌ Database ping failed');
                exitCode = 1;
            }
        } else {
            results.push('❌ Database connection failed');
            exitCode = 1;
        }
        
        // Close connection
        await mongoose.connection.close();
        
    } catch (dbError) {
        console.log(`   Connection: Failed ❌`);
        console.log(`   Error: ${dbError.message}`);
        results.push('❌ Database connection error');
        exitCode = 1;
    }

    // Dependencies Check
    console.log('\n📦 Dependencies:');
    try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
        const dependencies = packageJson.dependencies || {};
        
        const criticalDeps = [
            'express',
            'mongoose', 
            'cors',
            'dotenv',
            'bcryptjs',
            'jsonwebtoken'
        ];

        let depsOk = true;
        for (const dep of criticalDeps) {
            try {
                const version = dependencies[dep];
                require.resolve(dep);
                console.log(`   ${dep}: ${version} ✅`);
            } catch (depError) {
                console.log(`   ${dep}: Missing ❌`);
                depsOk = false;
                exitCode = 1;
            }
        }

        if (!depsOk) {
            results.push('❌ Critical dependencies missing');
        }

        // Check for production dependencies
        if (process.env.NODE_ENV === 'production') {
            const prodDeps = ['helmet', 'compression', 'express-rate-limit', 'morgan'];
            for (const dep of prodDeps) {
                try {
                    require.resolve(dep);
                    console.log(`   ${dep}: Available ✅`);
                } catch (depError) {
                    console.log(`   ${dep}: Missing (production) ⚠️`);
                }
            }
        }

    } catch (packageError) {
        console.log('   Package.json: Error reading ❌');
        results.push('❌ Package.json error');
        exitCode = 1;
    }

    // Production Readiness Check
    if (process.env.NODE_ENV === 'production') {
        console.log('\n🏭 Production Readiness:');
        
        // Security check
        const hasSecrets = process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32;
        console.log(`   JWT Secret: ${hasSecrets ? 'Strong ✅' : 'Weak ❌'}`);
        
        // SSL check
        const hasSSL = process.env.BASE_URL && process.env.BASE_URL.startsWith('https://');
        console.log(`   SSL Ready: ${hasSSL ? 'Yes ✅' : 'HTTP only ⚠️'}`);
        
        // Database SSL
        const dbSSL = process.env.MONGODB_URI && process.env.MONGODB_URI.includes('ssl=true');
        console.log(`   Database SSL: ${dbSSL ? 'Enabled ✅' : 'Check config ⚠️'}`);

        if (!hasSecrets) {
            results.push('❌ Weak JWT secret in production');
            exitCode = 1;
        }
    }

    // Summary
    console.log('\n🎯 Health Check Summary:');
    console.log('========================');
    
    if (exitCode === 0) {
        console.log('✅ ALL CHECKS PASSED - System is healthy!');
        console.log('\n🚀 Ready for deployment:');
        console.log('   Development: npm run dev');
        console.log('   Production:  npm start');
        console.log('\n🌐 Access URLs:');
        if (process.env.NODE_ENV === 'production') {
            console.log('   Production: https://vila-falo-resort-8208afd24e04.herokuapp.com');
            console.log('   Admin: https://vila-falo-resort-8208afd24e04.herokuapp.com/admin');
        } else {
            console.log('   Local: http://localhost:5000');
            console.log('   Admin: http://localhost:5000/admin');
        }
    } else {
        console.log('❌ HEALTH CHECK FAILED');
        console.log('\n🔧 Issues found:');
        results.forEach(issue => console.log(`   ${issue}`));
        console.log('\n📋 Please fix the issues above before deployment.');
    }

    process.exit(exitCode);
};

// Run the health check
runHealthCheck().catch(error => {
    console.error('\n💥 Health check crashed:', error.message);
    process.exit(1);
});