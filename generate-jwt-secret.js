#!/usr/bin/env node

// Quick script to generate a secure JWT secret
const crypto = require('crypto');

console.log('🔐 Generating secure JWT secret...');
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n✅ Your secure JWT secret:');
console.log(jwtSecret);
console.log('\n📝 Add this to your .env file as:');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('\n🔒 Keep this secret secure and never share it publicly!');
