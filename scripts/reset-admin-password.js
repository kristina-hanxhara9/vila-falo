/**
 * Reset Admin Password Script
 *
 * Usage:
 *   MONGODB_URI=your_connection_string node scripts/reset-admin-password.js
 *
 * Or on Railway:
 *   railway run node scripts/reset-admin-password.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ============ SET YOUR NEW PASSWORD HERE ============
const NEW_PASSWORD = 'VF@admin2025';
const ADMIN_EMAIL = 'vilafalo@gmail.com';
// ====================================================

async function resetPassword() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('ERROR: MONGODB_URI environment variable is not set.');
        console.log('');
        console.log('Run with:');
        console.log('  MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/vilafalo" node scripts/reset-admin-password.js');
        console.log('');
        console.log('Or on Railway:');
        console.log('  railway run node scripts/reset-admin-password.js');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
        console.log('Connected to MongoDB');

        const hash = await bcrypt.hash(NEW_PASSWORD, 10);
        console.log('Generated bcrypt hash for new password');

        const result = await mongoose.connection.db.collection('users').updateOne(
            { email: ADMIN_EMAIL },
            { $set: { password: hash } }
        );

        if (result.matchedCount === 0) {
            // User doesn't exist, create one
            console.log('No user found with that email. Creating new admin user...');
            await mongoose.connection.db.collection('users').insertOne({
                name: 'Admin',
                email: ADMIN_EMAIL,
                password: hash,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log('Admin user created!');
        } else {
            console.log('Password updated successfully!');
        }

        console.log('');
        console.log('=================================');
        console.log('  Login with:');
        console.log(`  Email:    ${ADMIN_EMAIL}`);
        console.log(`  Password: ${NEW_PASSWORD}`);
        console.log('=================================');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

resetPassword();
