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
    console.log('🏨 New booking request received');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Request headers:', req.headers);
    
    // Validate required fields
    const requiredFields = ['checkInDate', 'checkOutDate', 'guestName', 'email', 'roomType', 'numberOfGuests'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields: missingFields
      });
    }
    
    console.log('✅ All required fields present');
    
    // Create new booking
    console.log('💾 Creating booking object...');
    const bookingData = {
      ...req.body,
      roomsBooked: req.body.roomsBooked || 1 // Default to 1 room
    };
    
    const booking = new Booking(bookingData);
    
    // Save to database
    console.log('💾 Saving booking to database...');
    await booking.save();
    console.log('✅ Booking saved successfully with ID:', booking._id);
    
    // Send confirmation emails
    console.log('📧 Attempting to send confirmation emails...');
    let emailResults = {
      confirmation: false,
      adminNotification: false
    };
    
    try {
      console.log('📧 Sending customer confirmation email...');
      emailResults.confirmation = await emailService.sendBookingConfirmation(booking);
      console.log('Customer confirmation result:', emailResults.confirmation ? '✅ Sent' : '❌ Failed');
    } catch (emailError) {
      console.error('❌ Error sending customer confirmation:', emailError.message);
    }
    
    try {
      console.log('📧 Sending admin notification email...');
      emailResults.adminNotification = await emailService.sendAdminNotification(booking);
      console.log('Admin notification result:', emailResults.adminNotification ? '✅ Sent' : '❌ Failed');
    } catch (emailError) {
      console.error('❌ Error sending admin notification:', emailError.message);
    }
    
    console.log('✅ Booking creation process completed');
    
    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully', 
      data: booking,
      emailResults: emailResults
    });
  } catch (error) {
    console.error('❌ Error creating booking:', error.message);
    console.error('Full error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.log('❌ Validation errors:', messages);
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