const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const emailService = require('../services/emailService');

// Room inventory configuration
const ROOM_INVENTORY = {
  'Standard': {
    name: 'Dhomë Standart Malore',
    capacity: 3,
    minGuests: 1,
    maxGuests: 3,
    totalRooms: 7,
    price: 5000
  },
  'Premium': {
    name: 'Dhomë Premium Familjare',
    capacity: 4,
    minGuests: 1,
    maxGuests: 4,
    totalRooms: 4,
    price: 7000
  },
  'Deluxe': {
    name: 'Suitë Familjare Deluxe',
    capacity: 5,
    minGuests: 1,
    maxGuests: 5,
    totalRooms: 1,
    price: 8000
  }
};

// Check if Paysera is configured
const isPayseraConfigured = () => {
  return process.env.PAYSERA_PROJECT_ID && 
         process.env.PAYSERA_SIGN_PASSWORD &&
         process.env.PAYSERA_PROJECT_ID !== 'your_project_id_here' &&
         process.env.PAYSERA_SIGN_PASSWORD !== 'your_sign_password_here';
};

// Import Paysera service only if configured
let payseraService = null;
try {
  if (isPayseraConfigured()) {
    payseraService = require('../services/payseraService');
    console.log('✅ Paysera payment service loaded and ready');
  } else {
    console.log('⚠️  Paysera not configured - bookings will use manual payment');
    console.log('   Set PAYSERA_PROJECT_ID and PAYSERA_SIGN_PASSWORD in environment variables');
  }
} catch (error) {
  console.log('⚠️  Paysera service not available:', error.message);
}

// Check room availability for specific dates and room type
async function checkRoomAvailability(checkInDate, checkOutDate, roomType, excludeBookingId = null) {
  try {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
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
    
    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }
    
    const overlappingBookings = await Booking.find(query);
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
      const availability = await checkRoomAvailability(checkInDate, checkOutDate, roomType);
      return res.json({
        success: true,
        roomType: roomType,
        ...availability
      });
    } else {
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

// POST create new booking - PRODUCTION READY with field normalization
router.post('/', async (req, res) => {
  try {
    console.log('\n🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨');
    console.log('🏨 NEW BOOKING REQUEST');
    console.log('🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨🏨');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Body received:', JSON.stringify(req.body, null, 2));
    
    // NORMALIZE FIELD NAMES - Handle both camelCase and snake_case
    const bodyData = req.body || {};
    const data = {
      checkInDate: bodyData.checkInDate || bodyData.check_in_date || bodyData.checkin || bodyData.checkIn,
      checkOutDate: bodyData.checkOutDate || bodyData.check_out_date || bodyData.checkout || bodyData.checkOut,
      guestName: bodyData.guestName || bodyData.guest_name || bodyData.name,
      email: bodyData.email,
      phone: bodyData.phone || bodyData.phoneNumber || bodyData.phone_number || '',
      roomType: bodyData.roomType || bodyData.room_type || bodyData.roomtype,
      numberOfGuests: bodyData.numberOfGuests || bodyData.number_of_guests || bodyData.guests || bodyData.numGuests,
      specialRequests: bodyData.specialRequests || bodyData.special_requests || bodyData.requests || '',
      roomsBooked: bodyData.roomsBooked || bodyData.rooms_booked || bodyData.rooms || 1,
      source: bodyData.source || 'Website'
    };
    
    console.log('Normalized data:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    const required = ['checkInDate', 'checkOutDate', 'guestName', 'email', 'roomType', 'numberOfGuests'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      console.log('❌ Missing fields:', missing);
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missing.join(', ')}`,
        missingFields: missing,
        receivedBody: req.body
      });
    }
    
    // CRITICAL: Normalize room type - handle ALL variations
    console.log('🔍 Original room type:', data.roomType);
    
    // Trim whitespace and normalize
    let normalizedRoomType = (data.roomType || '').toString().trim();
    
    // Room type mapping - COMPREHENSIVE
    const roomTypeMap = {
      // Standard variations
      'Standard': 'Standard',
      'standard': 'Standard',
      'Standard Mountain Room': 'Standard',
      'standard mountain room': 'Standard',
      'Dhomë Standart Malore': 'Standard',
      'Dhomë Standard Malore': 'Standard',
      'dhomë standart malore': 'Standard',
      'dhomë standard malore': 'Standard',
      'Dhome Standart Malore': 'Standard',
      'Dhome Standard Malore': 'Standard',
      
      // Premium variations
      'Premium': 'Premium',
      'premium': 'Premium',
      'Premium Panorama Suite': 'Premium',
      'premium panorama suite': 'Premium',
      'Premium Family Room': 'Premium',
      'Dhomë Premium Familjare': 'Premium',
      'dhomë premium familjare': 'Premium',
      'Dhome Premium Familjare': 'Premium',
      'Suitë Premium Panoramike': 'Premium',
      'suite premium panoramike': 'Premium',
      
      // Deluxe variations
      'Deluxe': 'Deluxe',
      'deluxe': 'Deluxe',
      'Deluxe Family Suite': 'Deluxe',
      'deluxe family suite': 'Deluxe',
      'Suitë Familjare Deluxe': 'Deluxe',
      'suitë familjare deluxe': 'Deluxe',
      'Suite Familjare Deluxe': 'Deluxe',
      'suite familjare deluxe': 'Deluxe'
    };
    
    // Try direct mapping first
    if (roomTypeMap[normalizedRoomType]) {
      normalizedRoomType = roomTypeMap[normalizedRoomType];
      console.log('✅ Room type mapped to:', normalizedRoomType);
    } else {
      // Try case-insensitive search
      const lowerRoomType = normalizedRoomType.toLowerCase();
      for (const [key, value] of Object.entries(roomTypeMap)) {
        if (key.toLowerCase() === lowerRoomType) {
          normalizedRoomType = value;
          console.log('✅ Room type mapped (case-insensitive) to:', normalizedRoomType);
          break;
        }
      }
    }
    
    // Update data IMMEDIATELY
    data.roomType = normalizedRoomType;
    
    console.log('🎯 Final normalized room type:', normalizedRoomType);
    
    // Validate room type
    const roomConfig = ROOM_INVENTORY[normalizedRoomType];
    
    if (!roomConfig) {
      console.log('❌ Invalid room type after normalization:', normalizedRoomType);
      console.log('Valid types are:', Object.keys(ROOM_INVENTORY));
      return res.status(400).json({
        success: false,
        message: 'Invalid room type selected',
        validRoomTypes: Object.keys(ROOM_INVENTORY)
      });
    }
    
    // Validate number of guests - Allow ANY number UP TO maximum capacity
    const numberOfGuests = parseInt(data.numberOfGuests);
    if (isNaN(numberOfGuests) || numberOfGuests < 1) {
      console.log('❌ Invalid number of guests: must be at least 1');
      return res.status(400).json({
        success: false,
        message: `Please specify at least 1 guest.`
      });
    }
    
    if (numberOfGuests > roomConfig.maxGuests) {
      console.log('❌ Too many guests for room type');
      return res.status(400).json({
        success: false,
        message: `${roomConfig.name} can accommodate a maximum of ${roomConfig.maxGuests} guests. You selected ${numberOfGuests} guests. Please choose a larger room type or reduce the number of guests.`
      });
    }
    
    console.log(`✅ Guest count valid: ${numberOfGuests} guests (Room capacity: ${roomConfig.maxGuests})`);
    
    // Validate dates
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);
    
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }
    
    // Check availability
    console.log('🔍 Checking availability...');
    const availability = await checkRoomAvailability(data.checkInDate, data.checkOutDate, data.roomType);
    
    if (!availability.available) {
      console.log('❌ No rooms available');
      return res.status(400).json({
        success: false,
        message: `Sorry, no ${roomConfig.name} rooms available for these dates.`,
        availableRooms: 0
      });
    }
    
    console.log('✅ Room available');
    
    // Calculate pricing
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const roomsBooked = parseInt(data.roomsBooked) || 1;
    const totalPrice = nights * roomConfig.price * roomsBooked;
    const depositAmount = Math.round(totalPrice * 0.5);
    const remainingAmount = totalPrice - depositAmount;
    
    console.log('💰 Pricing:');
    console.log('  Nights:', nights);
    console.log('  Total:', totalPrice, 'Lek');
    console.log('  Deposit:', depositAmount, 'Lek');
    console.log('  On arrival:', remainingAmount, 'Lek');
    
    // Create booking
    const booking = new Booking({
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      guestName: data.guestName,
      email: data.email,
      phone: data.phone,
      roomType: data.roomType,
      numberOfGuests: numberOfGuests,
      specialRequests: data.specialRequests,
      totalPrice: totalPrice,
      depositAmount: depositAmount,
      remainingAmount: remainingAmount,
      roomsBooked: roomsBooked,
      totalNights: nights,
      status: 'pending',
      paymentStatus: 'pending',
      source: data.source
    });
    
    // Save to database
    console.log('💾 Saving to database...');
    await booking.save();
    console.log('✅ Booking saved:', booking._id);
    
    // Generate payment URL if Paysera is configured
    let paymentUrl = null;
    if (payseraService) {
      try {
        console.log('💳 Generating Paysera payment URL...');
        paymentUrl = payseraService.generatePaymentUrl(booking, 'deposit');
        console.log('✅ Payment URL generated');
      } catch (paymentError) {
        console.error('⚠️  Payment URL generation failed:', paymentError.message);
      }
    }
    
    // Send notification emails
    try {
      console.log('📧 Sending notification emails...');
      await emailService.sendNewBookingNotification(booking);
      console.log('✅ Emails sent');
    } catch (emailError) {
      console.error('⚠️  Email send failed:', emailError.message);
      // Don't fail booking if email fails
    }
    
    // Emit Socket.io event
    if (global.io) {
      global.io.emit('newBooking', {
        booking: booking,
        message: 'New booking created'
      });
      console.log('📡 Real-time event emitted');
    }
    
    console.log('✅ BOOKING COMPLETED SUCCESSFULLY\n');
    
    // Send response
    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully', 
      data: booking,
      reference: '#' + booking._id.toString().slice(-8).toUpperCase(),
      paymentUrl: paymentUrl,
      depositAmount: booking.depositAmount,
      remainingAmount: booking.remainingAmount,
      paymentInfo: {
        depositPercentage: 50,
        depositAmount: booking.depositAmount,
        remainingAmount: booking.remainingAmount,
        totalPrice: booking.totalPrice,
        paymentInstructions: paymentUrl 
          ? 'Pay 50% deposit now through secure payment link, 50% on arrival'
          : 'We will contact you with payment instructions. 50% deposit required, 50% on arrival',
        payseraConfigured: !!payseraService
      }
    });
    
  } catch (error) {
    console.error('\n❌ ERROR CREATING BOOKING');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
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
      message: 'Server error creating booking', 
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

// PUT update booking
router.put('/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const updateData = req.body;
    
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    
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
    
    if (updateData.status && updateData.status !== booking.status) {
      try {
        await emailService.sendAdminNotification(booking, `Booking Updated - Status: ${booking.status}`);
      } catch (emailError) {
        console.error('Error sending update email:', emailError);
      }
    }
    
    if (global.io) {
      global.io.emit('bookingUpdated', {
        booking: booking,
        message: 'Booking updated'
      });
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

// POST test endpoint
router.post('/test-body-parser', (req, res) => {
  console.log('🧪 Test endpoint hit');
  console.log('Body:', req.body);
  
  res.json({
    success: true,
    message: 'Body received',
    body: req.body,
    bodyType: typeof req.body,
    bodyKeys: Object.keys(req.body || {})
  });
});

module.exports = router;
