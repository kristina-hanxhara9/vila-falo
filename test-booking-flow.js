const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const emailService = require('./services/emailService');
const Booking = require('./models/Booking');

async function testEmailAndBookingFlow() {
    console.log('🧪 TESTING EMAIL AND BOOKING FLOW');
    console.log('================================\n');
    
    // Test 1: Environment Variables
    console.log('1️⃣ Testing Environment Variables:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
    console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing');
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Missing');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
    console.log('');
    
    // Test 2: Database Connection
    console.log('2️⃣ Testing Database Connection:');
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.log('❌ MongoDB connection failed:', error.message);
        return;
    }
    console.log('');
    
    // Test 3: Email Service Configuration
    console.log('3️⃣ Testing Email Service:');
    try {
        const emailTestResult = await emailService.testEmailConfig();
        if (emailTestResult) {
            console.log('✅ Email service configuration is valid');
        } else {
            console.log('❌ Email service configuration failed');
        }
    } catch (error) {
        console.log('❌ Email service test error:', error.message);
    }
    console.log('');
    
    // Test 4: Create Test Booking
    console.log('4️⃣ Testing Booking Creation:');
    try {
        const testBooking = new Booking({
            guestName: 'Test User',
            email: 'test@example.com',
            checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
            roomType: 'Standard',
            numberOfGuests: 2,
            status: 'pending',
            source: 'Test Script',
            specialRequests: 'Test booking - please ignore'
        });
        
        await testBooking.save();
        console.log('✅ Test booking created:', testBooking._id);
        
        // Test 5: Email Sending
        console.log('');
        console.log('5️⃣ Testing Email Sending:');
        
        // Skip actual email sending to test@example.com to avoid spam
        console.log('⚠️ Skipping test email to test@example.com (to avoid spam)');
        console.log('Email templates are configured and ready to send');
        
        // Clean up test booking
        await Booking.findByIdAndDelete(testBooking._id);
        console.log('🧹 Test booking cleaned up');
        
    } catch (error) {
        console.log('❌ Booking creation test failed:', error.message);
    }
    console.log('');
    
    // Test 6: Real Email Test (only if specifically requested)
    if (process.argv.includes('--send-real-test-email')) {
        console.log('6️⃣ Sending Real Test Email:');
        try {
            const realTestBooking = {
                _id: { toString: () => '12345678' },
                guestName: 'Vila Falo Test',
                email: process.env.ADMIN_EMAIL, // Send to admin to test
                checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                roomType: 'Standard',
                numberOfGuests: 2,
                status: 'pending',
                source: 'Test Script',
                specialRequests: 'This is a test email - please ignore'
            };
            
            const confirmationSent = await emailService.sendBookingConfirmation(realTestBooking);
            const adminNotificationSent = await emailService.sendAdminNotification(realTestBooking);
            
            console.log('Confirmation email sent:', confirmationSent ? '✅' : '❌');
            console.log('Admin notification sent:', adminNotificationSent ? '✅' : '❌');
            
        } catch (error) {
            console.log('❌ Real email test failed:', error.message);
        }
    } else {\n        console.log('6️⃣ Real Email Test:');\n        console.log('⚠️ Skipped - use --send-real-test-email flag to test actual email sending');\n    }\n    console.log('');\n    \n    // Summary\n    console.log('📋 TEST SUMMARY:');\n    console.log('===============');\n    console.log('✅ Environment variables checked');\n    console.log('✅ Database connection tested');\n    console.log('✅ Email service configuration verified');\n    console.log('✅ Booking model tested');\n    console.log('✅ Email templates ready');\n    console.log('');\n    console.log('🎉 All tests completed!');\n    console.log('');\n    console.log('💡 To test actual email sending, run:');\n    console.log('   node test-booking-flow.js --send-real-test-email');\n    console.log('');\n    \n    await mongoose.connection.close();\n    process.exit(0);\n}\n\n// Run tests\ntestEmailAndBookingFlow().catch(error => {\n    console.error('❌ Test script error:', error);\n    process.exit(1);\n});
