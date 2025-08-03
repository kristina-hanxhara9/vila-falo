const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const emailService = require('../services/emailService');

// GET all bookings (for admin)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred' 
    });
  }
});

// POST create new booking
router.post('/', async (req, res) => {
  try {
    console.log('Received booking data:', req.body);
    
    // Validate required fields
    const requiredFields = ['checkInDate', 'checkOutDate', 'guestName', 'email', 'roomType', 'numberOfGuests'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ 
          success: false, 
          message: `Missing required field: ${field}` 
        });
      }
    }
    
    // Create new booking
    const booking = new Booking(req.body);
    
    // Save to database
    await booking.save();
    
    // Send confirmation emails
    try {
      await emailService.sendBookingConfirmation(booking);
      await emailService.sendAdminNotification(booking);
      console.log('✅ Confirmation emails sent for booking:', booking._id);
    } catch (emailError) {
      console.error('❌ Error sending emails for booking:', emailError);
      // Don't fail the booking if email fails
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully', 
      data: booking 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation Error', 
        errors: messages 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred' 
    });
  }
});

// GET specific booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred' 
    });
  }
});

// PUT update booking status and data
router.put('/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const updateData = req.body;
    
    // Remove any fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    
    const booking = await Booking.findByIdAndUpdate(
      bookingId, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Send update confirmation email if status changed
    if (updateData.status && updateData.status !== booking.status) {
      try {
        await emailService.sendBookingConfirmation(booking, true);
        console.log('✅ Update confirmation email sent for booking:', booking._id);
      } catch (emailError) {
        console.error('❌ Error sending update email for booking:', emailError);
        // Don't fail the update if email fails
      }
    }
    
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation Error', 
        errors: messages 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred' 
    });
  }
});

// DELETE booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred' 
    });
  }
});

module.exports = router;