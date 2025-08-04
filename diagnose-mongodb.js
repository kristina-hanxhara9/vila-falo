// MongoDB Connection Diagnostic Tool
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

console.log('🔍 MongoDB Diagnostic Tool');
console.log('========================');

// Check MongoDB driver
try {
    const mongodb = require('mongodb');
    console.log('✅ MongoDB driver loaded successfully');
    console.log('📦 MongoDB version:', mongodb.version || 'Unknown');
} catch (error) {
    console.log('❌ MongoDB driver failed to load:', error.message);
}

// Check Mongoose
try {
    console.log('✅ Mongoose loaded successfully');
    console.log('📦 Mongoose version:', mongoose.version);
} catch (error) {
    console.log('❌ Mongoose failed to load:', error.message);
}

// Check operations directory
try {
    const mongodbPath = path.join(__dirname, 'node_modules', 'mongodb', 'lib', 'operations');
    const operationsExists = fs.existsSync(mongodbPath);
    console.log('📁 MongoDB operations directory exists:', operationsExists);
    
    if (operationsExists) {
        const files = fs.readdirSync(mongodbPath);
        const addUserExists = files.includes('add_user.js');
        console.log('📄 add_user.js exists:', addUserExists);
        console.log('📋 Operations files:', files.filter(f => f.endsWith('.js')).length);
    }
} catch (error) {
    console.log('❌ Could not check operations directory:', error.message);
}

// Test basic connection (without actually connecting)
console.log('🔧 Environment check:');
console.log('   Node version:', process.version);
console.log('   Platform:', process.platform);
console.log('   Architecture:', process.arch);

console.log('\n🎯 Diagnosis complete!');
