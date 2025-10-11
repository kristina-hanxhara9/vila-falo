const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const emailService = require('../services/emailService');
const payseraService = require('../services/payseraService');

// Room inventory configuration
const ROOM_INVENTORY = {
  'Standard': {
    name: 'Dhomë Standart Malore',
    capacity: 3,
    minGuests: 2,
    maxGuests: 3,
    totalRooms: 7,
    price: 5000
  },
  'Premium': {
    name: 'Dhomë Premium Familjare',
    capacity: 4,
    minGuests: 4,
    maxGuests: 4,
    totalRooms: 4,
    price: 7000
  },
  'Deluxe': {
    name: 'Suitë Familjare Deluxe',
    capacity: 5,
    minGuests: 4,
    maxGuests: 5,
    totalRooms: 1,
    price: 8000
  }
};

// Check room availability for specific dates and room type
async function checkRoomAvailability(checkInDate, checkOutDate, roomType, excludeBookingId = null) {
  try {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    // Find all confirmed/pending bookings for this room type that overlap with requested dates
    const query = {
      roomType: roomType,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn }
        }
      ]
    };
    
    // Exclude a specific booking (useful for updates)
    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }
    
    const overlappingBookings = await Booking.find(query);
    
    // Count total rooms booked for overlapping dates
    const totalRoomsBooked = overlappingBookings.reduce((sum, booking) => sum + (booking.roomsBooked || 1), 0);
    
    const roomConfig = ROOM_INVENTORY[roomType];
    if (!roomConfig) {
      return { available: false, message: 'Invalid room type' };
    }
    
    const availableRooms = roomConfig.totalRooms - totalRoomsBooked;
    
    return {
      available: availableRooms > 0,
      availableRooms: Math.max(0, availableRooms),
      totalRooms: roomConfig.totalRooms,
      bookedRooms: totalRoomsBooked,
      message: availableRooms > 0 
        ? `${availableRooms} room(s) available` 
        : 'No rooms available for these dates'
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    return { available: false, message: 'Error checking availability' };
  }
}

// GET room availability for specific dates
router.get('/availability', async (req, res) => {
  try {
    const { checkInDate, checkOutDate, roomType } = req.query;
    
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
    }
    
    if (roomType) {
      // Check specific room type
      const availability = await checkRoomAvailability(checkInDate, checkOutDate, roomType);
      return res.json({
        success: true,
        roomType: roomType,
        ...availability
      });
    } else {
      // Check all room types
      const availabilityResults = {};
      for (const [type, config] of Object.entries(ROOM_INVENTORY)) {
        availabilityResults[type] = await checkRoomAvailability(checkInDate, checkOutDate, type);
      }
      return res.json({
        success: true,
        availability: availabilityResults
      });
    }
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking availability'
    });
  }
});

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
    
    // Validate room type
    const roomConfig = ROOM_INVENTORY[req.body.roomType];
    if (!roomConfig) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room type selected'
      });
    }
    
    // Validate number of guests
    const numberOfGuests = parseInt(req.body.numberOfGuests);
    if (numberOfGuests < roomConfig.minGuests || numberOfGuests > roomConfig.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `${roomConfig.name} accommodates ${roomConfig.minGuests}-${roomConfig.maxGuests} guests. You selected ${numberOfGuests} guests.`
      });
    }
    
    // Check room availability
    console.log('🔍 Checking room availability...');
    const availability = await checkRoomAvailability(
      req.body.checkInDate, 
      req.body.checkOutDate, 
      req.body.roomType
    );
    
    if (!availability.available) {
      console.log('❌ No rooms available');
      return res.status(400).json({
        success: false,
        message: `Sorry, no ${roomConfig.name} rooms available for these dates. Please try different dates or a different room type.`,
        availableRooms: 0
      });
    }
    
    console.log(`✅ Room available: ${availability.availableRooms} rooms`);
    
    // Calculate total price
    const checkIn = new Date(req.body.checkInDate);
    const checkOut = new Date(req.body.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    const roomsBooked = req.body.roomsBooked || 1;
    const totalPrice = nights * roomConfig.price * roomsBooked;
    
    // Create new booking
    console.log('💾 Creating booking object...');
    const bookingData = {
      ...req.body,
      totalPrice: totalPrice,
      roomsBooked: roomsBooked,
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
      depositAmount: booking.depositAmount,
      remainingAmount: booking.remainingAmount,
      paymentInfo: {
        depositPercentage: 50,
        depositAmount: booking.depositAmount,
        remainingAmount: booking.remainingAmount,
        paymentInstructions: 'Pay 50% deposit now, 50% on arrival'
      }
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
    
    // If updating room type or dates, check availability
    if (updateData.roomType || updateData.checkInDate || updateData.checkOutDate) {
      const currentBooking = await Booking.findById(bookingId);
      if (!currentBooking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      
      const roomType = updateData.roomType || currentBooking.roomType;
      const checkInDate = updateData.checkInDate || currentBooking.checkInDate;
      const checkOutDate = updateData.checkOutDate || currentBooking.checkOutDate;
      
      const availability = await checkRoomAvailability(checkInDate, checkOutDate, roomType, bookingId);
      if (!availability.available) {
        return res.status(400).json({
          success: false,
          message: 'No rooms available for the selected dates and room type'
        });
      }
    }
    
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
