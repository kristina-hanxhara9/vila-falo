const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const nodemailer = require('nodemailer');

// Create transporter for sending emails
let transporter;
if (process.env.NODE_ENV === 'production') {
    // Configure production email service
    transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
} else {
    // Use ethereal for development
    nodemailer.createTestAccount().then(account => {
        transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: {
                user: account.user,
                pass: account.pass
            }
        });
    });
}

// Send confirmation email
const sendConfirmationEmail = async (booking) => {
    // Format dates
    const checkIn = new Date(booking.checkIn).toLocaleDateString();
    const checkOut = new Date(booking.checkOut).toLocaleDateString();
    
    // Calculate nights
    const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));
    
    // Build addons text
    let addonsText = '';
    if (booking.addons.length > 0) {
        addonsText = 'Additional Services: ' + booking.addons.join(', ');
    }
    
    // Send email
    const info = await transporter.sendMail({
        from: '"Vila Falo" <reservations@vilafalo.com>',
        to: booking.email,
        subject: 'Booking Confirmation - Vila Falo',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #2a6d4e; color: white; padding: 20px; text-align: center;">
                    <h1>Thank You for Your Booking</h1>
                </div>
                <div style="padding: 20px; border: 1px solid #ddd;">
                    <p>Dear ${booking.name},</p>
                    <p>We are pleased to confirm your reservation at Vila Falo. Here are your booking details:</p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px;">
                        <p><strong>Booking Reference:</strong> #${booking._id.toString().slice(-6).toUpperCase()}</p>
                        <p><strong>Room Type:</strong> ${booking.roomType}</p>
                        <p><strong>Check-in Date:</strong> ${checkIn}</p>
                        <p><strong>Check-out Date:</strong> ${checkOut}</p>
                        <p><strong>Duration:</strong> ${nights} night(s)</p>
                        <p><strong>Guests:</strong> ${booking.adults} adult(s), ${booking.children} child(ren)</p>
                        ${addonsText ? `<p><strong>${addonsText}</strong></p>` : ''}
                        <p><strong>Total Price:</strong> €${booking.totalPrice}</p>
                    </div>
                    
                    <p>If you have any questions or need to make changes to your reservation, please don't hesitate to contact us.</p>
                    <p>We look forward to welcoming you to Vila Falo!</p>
                    
                    <p>Best Regards,<br>The Vila Falo Team</p>
                </div>
                <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
                    <p>Vila Falo, Voskopoje Village, Korçë, Albania</p>
                    <p>Email: info@vilafalo.com | Phone: +355 XX XXX XXXX</p>
                </div>
            </div>
        `
    });
    
    if (process.env.NODE_ENV !== 'production') {
        console.log('Email preview URL: ' + nodemailer.getTestMessageUrl(info));
    }
    
    return info;
};

// POST - Create a new booking
router.post('/', async (req, res) => {
    try {
        // Create new booking
        const booking = new Booking(req.body);
        
        // Validate dates
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        
        if (checkIn >= checkOut) {
            return res.status(400).json({
                success: false,
                message: 'Check-out date must be after check-in date'
            });
        }
        
        // Save booking
        await booking.save();
        
        // Send confirmation email
        try {
            await sendConfirmationEmail(booking);
        } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Continue with booking confirmation even if email fails
        }
        
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error creating booking',
            error: err.message
        });
    }
});

// GET - Check room availability
router.get('/availability', async (req, res) => {
    try {
        const { checkIn, checkOut, roomType } = req.query;
        
        // If dates are not provided, return error
        if (!checkIn || !checkOut) {
            return res.status(400).json({
                success: false,
                message: 'Please provide check-in and check-out dates'
            });
        }
        
        // Find bookings that overlap with the requested dates
        const overlappingBookings = await Booking.find({
            $and: [
                { status: { $ne: 'cancelled' } },
                { checkIn: { $lt: new Date(checkOut) } },
                { checkOut: { $gt: new Date(checkIn) } }
            ]
        });
        
        // If roomType is specified, filter available rooms
        if (roomType) {
            const isRoomAvailable = !overlappingBookings.some(booking => booking.roomType === roomType);
            
            return res.status(200).json({
                success: true,
                available: isRoomAvailable
            });
        }
        
        // Otherwise, return all booked room types for the period
        const bookedRoomTypes = overlappingBookings.map(booking => booking.roomType);
        const allRoomTypes = ['Standard Mountain Room', 'Deluxe Family Suite', 'Premium Panorama Suite'];
        const availableRoomTypes = allRoomTypes.filter(type => !bookedRoomTypes.includes(type));
        
        res.status(200).json({
            success: true,
            availableRoomTypes
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error checking availability',
            error: err.message
        });
    }
});

// Protected routes for admin
router.get('/', async (req, res) => {
    // Typically would include authentication middleware
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error retrieving bookings',
            error: err.message
        });
    }
});

// GET - Get a single booking by ID
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error retrieving booking',
            error: err.message
        });
    }
});

// PUT - Update booking status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error updating booking status',
            error: err.message
        });
    }
});

// DELETE - Cancel a booking
router.delete('/:id', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled' },
            { new: true }
        );
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error cancelling booking',
            error: err.message
        });
    }
});

module.exports = router;