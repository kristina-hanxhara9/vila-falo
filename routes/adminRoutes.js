const express = require('express');
const Booking = require('../models/Booking'); // Assuming you have a Booking model
const Newsletter = require('../models/Newsletter'); // Assuming you have a Newsletter model
const { adminLogin, getAdminDashboard } = require('../controllers/adminController');
const router = express.Router();

// Middleware for admin authentication (optional)
router.use((req, res, next) => {
    // Example: Check if the user is an admin
    if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    next();
});

// Admin login route
router.post('/login', adminLogin);

// Admin dashboard route
router.get('/dashboard', getAdminDashboard);

// Get all bookings
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
});

// Delete a booking by ID
router.delete('/bookings/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        await Booking.findByIdAndDelete(bookingId);
        res.status(200).json({ success: true, message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ success: false, message: 'Failed to delete booking' });
    }
});

// Get all newsletter subscriptions
router.get('/newsletters', async (req, res) => {
    try {
        const newsletters = await Newsletter.find();
        res.status(200).json({ success: true, newsletters });
    } catch (error) {
        console.error('Error fetching newsletters:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch newsletters' });
    }
});

// Delete a newsletter subscription by ID
router.delete('/newsletters/:id', async (req, res) => {
    try {
        const newsletterId = req.params.id;
        await Newsletter.findByIdAndDelete(newsletterId);
        res.status(200).json({ success: true, message: 'Newsletter subscription deleted successfully' });
    } catch (error) {
        console.error('Error deleting newsletter subscription:', error);
        res.status(500).json({ success: false, message: 'Failed to delete newsletter subscription' });
    }
});

module.exports = router; // Ensure this is exporting the router