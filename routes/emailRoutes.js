const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const Booking = require('../models/Booking');
const authenticate = require('../middleware/authenticate');

// All email routes require admin authentication
router.use(authenticate);

// Test email configuration
router.get('/test', async (req, res) => {
    try {
        const status = emailService.getStatus();
        res.json({
            success: true,
            emailService: status,
            message: status.configured ? 'Email service is configured' : 'Email service is not configured'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking email service status',
            error: error.message
        });
    }
});

// Send test booking confirmation email
router.post('/test-booking-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
        }

        // Create a test booking object
        const testBooking = {
            _id: '000000000000000000000000',
            guestName: 'John Doe (Test)',
            email: email,
            phone: '+355 69 123 4567',
            roomType: 'Standard',
            numberOfGuests: 2,
            checkInDate: new Date(),
            checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            specialRequests: 'This is a test booking confirmation',
            status: 'confirmed',
            source: 'Test',
            createdAt: new Date()
        };

        const result = await emailService.sendBookingConfirmation(testBooking);

        res.json({
            success: result.success,
            message: result.success ? 'Test email sent successfully!' : 'Failed to send test email',
            details: result
        });

    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending test email',
            error: error.message
        });
    }
});

// Send test admin notification
router.post('/test-admin-email', async (req, res) => {
    try {
        // Create a test booking object
        const testBooking = {
            _id: '000000000000000000000000',
            guestName: 'Jane Smith (Test Admin Notification)',
            email: 'test@example.com',
            phone: '+355 69 987 6543',
            roomType: 'Deluxe',
            numberOfGuests: 3,
            checkInDate: new Date(),
            checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
            specialRequests: 'This is a test admin notification',
            status: 'pending',
            source: 'Chatbot',
            createdAt: new Date()
        };

        const result = await emailService.sendAdminNotification(testBooking);

        res.json({
            success: result.success,
            message: result.success ? 'Test admin notification sent successfully!' : 'Failed to send test admin notification',
            details: result
        });

    } catch (error) {
        console.error('Test admin email error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending test admin email',
            error: error.message
        });
    }
});

// Send custom test email
router.post('/test-custom-email', async (req, res) => {
    try {
        const { to, subject, message } = req.body;
        
        if (!to || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'to, subject, and message are required'
            });
        }

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4361ee, #560bad); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1>🏔️ Vila Falo Test Email</h1>
                <p>Email service is working correctly!</p>
            </div>
            <div style="background: white; border: 1px solid #e0e0e0; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2>${subject}</h2>
                <p>${message}</p>
                <hr>
                <p style="color: #666; font-size: 14px;">
                    This is a test email sent from Vila Falo booking system.<br>
                    Time: ${new Date().toLocaleString()}<br>
                    Server: ${process.env.BASE_URL || 'localhost'}
                </p>
            </div>
        </body>
        </html>
        `;

        const result = await emailService.sendCustomEmail(to, subject, htmlContent, message);

        res.json({
            success: result.success,
            message: result.success ? 'Custom test email sent successfully!' : 'Failed to send custom test email',
            details: result
        });

    } catch (error) {
        console.error('Custom test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending custom test email',
            error: error.message
        });
    }
});

module.exports = router;
