#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 Vila Falo - Automatic Setup');
console.log('==============================\n');

const envPath = path.join(__dirname, '.env');

// Check if .env exists
if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    
    // Copy from .env.example if it exists
    const examplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, envPath);
        console.log('✅ Created .env from .env.example');
    } else {
        console.log('❌ .env.example not found either. Please create .env manually.');
        process.exit(1);
    }
}

// Read current .env content
let envContent = fs.readFileSync(envPath, 'utf8');

// Check if JWT_SECRET exists and is long enough
const jwtMatch = envContent.match(/JWT_SECRET=(.+)/);
let needsJwtSecret = false;

if (!jwtMatch || !jwtMatch[1] || jwtMatch[1].length < 32) {
    needsJwtSecret = true;
}

if (needsJwtSecret) {
    console.log('🔐 Generating new JWT secret...');
    const newJwtSecret = crypto.randomBytes(64).toString('hex');
    
    if (jwtMatch) {
        // Replace existing JWT_SECRET
        envContent = envContent.replace(/JWT_SECRET=.+/, `JWT_SECRET=${newJwtSecret}`);
    } else {
        // Add JWT_SECRET
        envContent += `\nJWT_SECRET=${newJwtSecret}`;
    }
    
    console.log('✅ JWT secret generated and added to .env');
}

// Ensure other required variables exist
const requiredVars = {
    'ADMIN_USERNAME': 'admin',
    'ADMIN_PASSWORD': 'admin123',
    'PORT': '5000',
    'NODE_ENV': 'development'
};

let hasChanges = needsJwtSecret;

Object.entries(requiredVars).forEach(([key, defaultValue]) => {
    const regex = new RegExp(`^${key}=`, 'm');
    if (!regex.test(envContent)) {
        envContent += `\n${key}=${defaultValue}`;
        console.log(`✅ Added ${key} with default value`);
        hasChanges = true;
    }
});

// Write back to .env if we made changes
if (hasChanges) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file updated successfully');
}

console.log('\n🎉 Setup complete! Your environment is now configured.');
console.log('\n🚀 Next steps:');
console.log('   npm run health    # Check system health');
console.log('   npm run dev       # Start development server');
console.log('   npm start         # Start production server');

console.log('\n🌐 Your app will be available at:');
console.log('   Client Site: http://localhost:5000');
console.log('   Admin Panel: http://localhost:5000/admin');
console.log('\n🔑 Default admin credentials:');
console.log('   Username: admin');
console.log('   Password: admin123');
console.log('\n⚠️  Remember to change the admin password in .env file!');
