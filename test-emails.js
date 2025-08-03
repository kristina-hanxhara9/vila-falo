const emailService = require('./services/emailService');

// Test email functionality
async function testEmails() {
    console.log('🧪 Testing email functionality...\n');
    
    // Test booking confirmation email
    const testBooking = {
        _id: 'test-booking-id',
        guestName: 'Test Guest',
        email: process.env.ADMIN_EMAIL || 'test@example.com',
        phone: '+355 XX XXX XXXX',
        roomType: 'Standard',
        numberOfGuests: 2,
        checkInDate: new Date(),
        checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        specialRequests: 'This is a test booking',
        status: 'confirmed',
        source: 'Test'
    };
    
    console.log('📧 Sending test booking confirmation...');
    try {
        await emailService.sendBookingConfirmation(testBooking);
        console.log('✅ Booking confirmation test successful!');
    } catch (error) {
        console.error('❌ Booking confirmation test failed:', error.message);
    }
    
    console.log('\n📧 Sending test admin notification...');
    try {
        await emailService.sendAdminNotification(testBooking);
        console.log('✅ Admin notification test successful!');
    } catch (error) {
        console.error('❌ Admin notification test failed:', error.message);
    }
    
    console.log('\n📧 Sending test newsletter confirmation...');
    try {
        await emailService.sendNewsletterConfirmation(process.env.ADMIN_EMAIL || 'test@example.com');
        console.log('✅ Newsletter confirmation test successful!');
    } catch (error) {
        console.error('❌ Newsletter confirmation test failed:', error.message);
    }
    
    console.log('\n🎉 Email testing complete!');
    console.log('Check your email inbox for test messages.');
}

// Load environment variables
require('dotenv').config();

// Run tests
testEmails().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
