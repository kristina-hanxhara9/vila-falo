#!/usr/bin/env node

console.log('🔧 Vila Falo - Route Debugging Tool');
console.log('===================================');

const fs = require('fs');
const path = require('path');

// Check if critical files exist
const criticalFiles = [
    'server.js',
    'public/index.html',
    'public/admin-panel.html',
    '.env'
];

console.log('\n📁 Checking critical files:');
let missingFiles = [];

criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) missingFiles.push(file);
});

if (missingFiles.length > 0) {
    console.log('\n❌ Missing files found. This could cause routing issues.');
    console.log('   Missing:', missingFiles.join(', '));
    process.exit(1);
}

// Check .env variables
console.log('\n🔐 Checking environment variables:');
require('dotenv').config();

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
let missingEnvVars = [];

requiredEnvVars.forEach(envVar => {
    const exists = !!process.env[envVar];
    console.log(`   ${exists ? '✅' : '❌'} ${envVar}`);
    if (!exists) missingEnvVars.push(envVar);
});

if (missingEnvVars.length > 0) {
    console.log('\n⚠️  Missing environment variables. Run: npm run auto-setup');
}

// Check if routes are properly configured
console.log('\n🛣️  Checking route files:');
const routeFiles = [
    'routes/bookingRoutes.js',
    'routes/NewsletterRoutes.js', 
    'routes/adminRoutes.js',
    'routes/users.js'
];

routeFiles.forEach(routeFile => {
    const filePath = path.join(__dirname, routeFile);
    const exists = fs.existsSync(filePath);
    console.log(`   ${exists ? '✅' : '❌'} ${routeFile}`);
});

// Check package.json
console.log('\n📦 Checking package.json:');
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const hasStartScript = !!packageJson.scripts?.start;
    const hasDevScript = !!packageJson.scripts?.dev;
    
    console.log(`   ${hasStartScript ? '✅' : '❌'} start script`);
    console.log(`   ${hasDevScript ? '✅' : '❌'} dev script`);
    
    if (!hasStartScript || !hasDevScript) {
        console.log('   ⚠️  Missing npm scripts');
    }
} catch (error) {
    console.log('   ❌ Error reading package.json');
}

console.log('\n🧪 Diagnostic complete. Recommendations:');

if (missingFiles.length > 0) {
    console.log('   1. ❌ Restore missing files from backup');
}

if (missingEnvVars.length > 0) {
    console.log('   2. ⚙️  Run: npm run auto-setup');
}

console.log('   3. 🧪 Test with: npm run test-server');
console.log('   4. 🚀 If test works, try: npm run dev');
console.log('   5. 🔍 For detailed logs: npm run debug');

console.log('\n💡 Common fixes:');
console.log('   - Kill any existing server: pkill -f "node.*server"');
console.log('   - Clear npm cache: npm cache clean --force');
console.log('   - Reinstall dependencies: rm -rf node_modules && npm install');
console.log('   - Check port 5000 is free: lsof -i :5000');

console.log('\n✅ If all checks pass, your routing should work!');
