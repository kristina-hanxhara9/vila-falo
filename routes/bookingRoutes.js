const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const emailService = require('../services/emailService');
const payseraService = require('../services/payseraService');

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

// POST create new booking with payment initiation
router.post('/', async (req, res) => {
  try {
    console.log('🏨 New booking request received');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
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
    
    // Calculate total price if not provided
    let totalPrice = req.body.totalPrice;
    if (!totalPrice) {
      const checkIn = new Date(req.body.checkInDate);
      const checkOut = new Date(req.body.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      const roomPrices = {
        'Standard': 5000,
        'Deluxe': 6000,
        'Suite': 8000,
        'Premium': 7000
      };
      
      const pricePerNight = roomPrices[req.body.roomType] || 5000;
      totalPrice = nights * pricePerNight * (req.body.roomsBooked || 1);
    }
    
    // Create new booking
    console.log('💾 Creating booking object...');
    const bookingData = {
      ...req.body,
      totalPrice: totalPrice,
      roomsBooked: req.body.roomsBooked || 1,
      status: 'pending',
      paymentStatus: 'pending'
    };
    
    const booking = new Booking(bookingData);
    
    // Save to database
    console.log('💾 Saving booking to database...');
    await booking.save();
    console.log('✅ Booking saved successfully with ID:', booking._id);
    
    // Generate payment URL for 50% deposit
    const paymentUrl = payseraService.generatePaymentUrl(booking, 'deposit');
    
    // Send notification emails
    console.log('📧 Sending notification emails...');
    try {
      await emailService.sendNewBookingNotification(booking);
      console.log('✅ Notification emails sent');
    } catch (emailError) {
      console.error('❌ Error sending emails:', emailError.message);
    }
    
    console.log('✅ Booking creation process completed');
    
    // Emit Socket.io event for real-time admin updates
    if (global.io) {
      global.io.emit('newBooking', {
        booking: booking,
        message: 'New booking created'
      });
      console.log('📡 Real-time event emitted to admin panel');
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully', 
      data: booking,
      paymentUrl: paymentUrl,
      depositAmount: booking.depositAmount
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
    
    // Send update notification to admin
    if (updateData.status && updateData.status !== booking.status) {
      try {
        await emailService.sendAdminNotification(booking, `Booking Updated - Status: ${booking.status}`);
        console.log('✅ Update notification email sent');
      } catch (emailError) {
        console.error('❌ Error sending update email:', emailError);
      }
    }
    
    // Emit Socket.io event for real-time admin updates
    if (global.io) {
      global.io.emit('bookingUpdated', {
        booking: booking,
        message: 'Booking updated'
      });
      console.log('📡 Real-time update event emitted to admin panel');
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
