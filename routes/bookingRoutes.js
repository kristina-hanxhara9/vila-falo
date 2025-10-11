const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const emailService = require('../services/emailService');

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

// Check if Paysera is configured
const isPayseraConfigured = () => {
  return process.env.PAYSERA_PROJECT_ID && 
         process.env.PAYSERA_SIGN_PASSWORD &&
         process.env.PAYSERA_PROJECT_ID !== 'your_project_id_here' &&
         process.env.PAYSERA_SIGN_PASSWORD !== 'your_sign_password_here';
};

// Import Paysera service only if configured
let payseraService = null;
if (isPayseraConfigured()) {
  payseraService = require('../services/payseraService');
  console.log('✅ Paysera payment service loaded');
} else {
  console.log('⚠️  Paysera not configured - bookings will be manual payment');
}

// Middleware to ensure request body is properly parsed
const ensureBodyParsed = (req, res, next) => {
  // Log raw body if available
  console.log('🔍 Body Parser Check:');
  console.log('   Content-Type:', req.get('Content-Type'));
  console.log('   Body exists:', !!req.body);
  console.log('   Body type:', typeof req.body);
  console.log('   Body keys:', Object.keys(req.body || {}));
  console.log('   Body values:', req.body);
  
  // If body is empty or not an object, try to parse it
  if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
    console.log('⚠️  Empty or invalid body detected, attempting manual parse');
    
    // Check if we have raw body data
    if (req.rawBody) {
      try {
        req.body = JSON.parse(req.rawBody);
        console.log('✅ Successfully parsed rawBody');
      } catch (e) {
        console.error('❌ Failed to parse rawBody:', e.message);
      }
    }
  }
  
  next();
};

// Apply body parser middleware to all routes
router.use(ensureBodyParsed);

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

// POST create new booking with payment initiation - PRODUCTION READY
router.post('/', express.json(), express.urlencoded({ extended: true }), async (req, res) => {
  try {
    console.log('\n' + '🏨'.repeat(40));
    console.log('🏨 NEW BOOKING REQUEST RECEIVED');
    console.log('🏨'.repeat(40));
    console.log('📋 Timestamp:', new Date().toISOString());
    console.log('📋 IP Address:', req.ip);
    console.log('📋 User Agent:', req.get('User-Agent'));
    console.log('📋 Content-Type:', req.get('Content-Type'));
    console.log('📋 Request Method:', req.method);
    console.log('📋 Request URL:', req.originalUrl);
    console.log('');
    console.log('📦 Request Headers:');
    console.log(JSON.stringify(req.headers, null, 2));
    console.log('');
    console.log('📦 Request Body (parsed):');
    console.log('   Body Type:', typeof req.body);
    console.log('   Body Constructor:', req.body?.constructor?.name);
    console.log('   Body Keys:', Object.keys(req.body || {}));
    console.log('   Body Content:', JSON.stringify(req.body, null, 2));
    console.log('');
    
    // Extract body data - handle both parsed and unparsed scenarios
    let bodyData = req.body;
    
    // If body is a string, try to parse it
    if (typeof bodyData === 'string') {
      console.log('⚠️  Body is a string, attempting to parse...');
      try {
        bodyData = JSON.parse(bodyData);
        console.log('✅ Successfully parsed string body');
      } catch (e) {
        console.error('❌ Failed to parse string body:', e.message);
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in request body',
          error: 'Request body must be valid JSON'
        });
      }
    }
    
    // Validate that we have an object
    if (!bodyData || typeof bodyData !== 'object') {
      console.error('❌ Invalid body data type:', typeof bodyData);
      return res.status(400).json({
        success: false,
        message: 'Request body must be a JSON object',
        receivedType: typeof bodyData,
        hint: 'Make sure Content-Type header is set to application/json'
      });
    }
    
    console.log('✅ Body data validated as object');
    console.log('');
    
    // Normalize field names (handle both camelCase and snake_case)
    const normalizedBody = {
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
    
    console.log('📝 Normalized field values:');
    Object.entries(normalizedBody).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    console.log('');
    
    // Validate required fields with detailed logging
    const requiredFields = {
      checkInDate: 'Check-in date',
      checkOutDate: 'Check-out date', 
      guestName: 'Guest name',
      email: 'Email address',
      roomType: 'Room type',
      numberOfGuests: 'Number of guests'
    };
    
    const missingFields = [];
    const fieldStatus = {};
    
    for (const [field, label] of Object.entries(requiredFields)) {
      const value = normalizedBody[field];
      const isPresent = value !== undefined && value !== null && value !== '';
      fieldStatus[field] = {
        label,
        present: isPresent,
        value: value,
        type: typeof value
      };
      
      if (!isPresent) {
        missingFields.push(field);
        console.log(`❌ MISSING: ${field} (${label})`);
      } else {
        console.log(`✅ PRESENT: ${field} (${label}) = ${value}`);
      }
    }
    
    console.log('');
    
    if (missingFields.length > 0) {
      console.log('❌ VALIDATION FAILED');
      console.log('❌ Missing required fields:', missingFields);
      console.log('');
      console.log('📊 Field Status Summary:');
      console.log(JSON.stringify(fieldStatus, null, 2));
      console.log('');
      console.log('💡 DEBUGGING HINTS:');
      console.log('   1. Check that your request includes all required fields');
      console.log('   2. Verify Content-Type header is "application/json"');
      console.log('   3. Ensure field names match exactly (case-sensitive)');
      console.log('   4. Check that field values are not empty strings');
      console.log('   5. Accepted field name variations:');
      console.log('      - checkInDate / check_in_date / checkin / checkIn');
      console.log('      - checkOutDate / check_out_date / checkout / checkOut');
      console.log('      - guestName / guest_name / name');
      console.log('      - numberOfGuests / number_of_guests / guests / numGuests');
      console.log('      - roomType / room_type / roomtype');
      console.log('');
      
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.map(f => requiredFields[f]).join(', ')}`,
        missingFields: missingFields,
        fieldStatus: fieldStatus,
        receivedFields: Object.keys(bodyData),
        hint: 'All required fields must be present and non-empty. Check the field names match exactly.'
      });
    }
    
    console.log('✅ All required fields present and validated');
    console.log('');
    
    // Validate room type
    const roomConfig = ROOM_INVENTORY[normalizedBody.roomType];
    if (!roomConfig) {
      console.log('❌ Invalid room type:', normalizedBody.roomType);
      console.log('   Valid room types:', Object.keys(ROOM_INVENTORY));
      return res.status(400).json({
        success: false,
        message: 'Invalid room type selected',
        validRoomTypes: Object.keys(ROOM_INVENTORY),
        receivedRoomType: normalizedBody.roomType
      });
    }
    
    console.log('✅ Room type valid:', normalizedBody.roomType);
    console.log('   Room name:', roomConfig.name);
    console.log('   Price per night:', roomConfig.price, 'Lek');
    console.log('   Capacity:', roomConfig.minGuests, '-', roomConfig.maxGuests, 'guests');
    console.log('');
    
    // Validate number of guests
    const numberOfGuests = parseInt(normalizedBody.numberOfGuests);
    console.log('👥 Validating number of guests...');
    console.log('   Requested:', numberOfGuests);
    console.log('   Allowed range:', roomConfig.minGuests, '-', roomConfig.maxGuests);
    
    if (isNaN(numberOfGuests) || numberOfGuests < roomConfig.minGuests || numberOfGuests > roomConfig.maxGuests) {
      console.log('❌ Invalid number of guests');
      return res.status(400).json({
        success: false,
        message: `${roomConfig.name} accommodates ${roomConfig.minGuests}-${roomConfig.maxGuests} guests. You selected ${numberOfGuests} guests.`,
        validRange: {
          min: roomConfig.minGuests,
          max: roomConfig.maxGuests
        },
        requestedGuests: numberOfGuests
      });
    }
    
    console.log('✅ Number of guests valid');
    console.log('');
    
    // Validate dates
    console.log('📅 Validating dates...');
    const checkIn = new Date(normalizedBody.checkInDate);
    const checkOut = new Date(normalizedBody.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('   Check-in:', checkIn.toISOString());
    console.log('   Check-out:', checkOut.toISOString());
    console.log('   Today:', today.toISOString());
    
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      console.log('❌ Invalid date format');
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use YYYY-MM-DD format.',
        receivedCheckIn: normalizedBody.checkInDate,
        receivedCheckOut: normalizedBody.checkOutDate
      });
    }
    
    if (checkOut <= checkIn) {
      console.log('❌ Check-out date must be after check-in date');
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }
    
    console.log('✅ Dates are valid');
    console.log('');
    
    // Check room availability
    console.log('🔍 Checking room availability...');
    const availability = await checkRoomAvailability(
      normalizedBody.checkInDate, 
      normalizedBody.checkOutDate, 
      normalizedBody.roomType
    );
    
    console.log('📊 Availability result:', JSON.stringify(availability, null, 2));
    
    if (!availability.available) {
      console.log('❌ No rooms available for selected dates');
      return res.status(400).json({
        success: false,
        message: `Sorry, no ${roomConfig.name} rooms available for these dates. Please try different dates or a different room type.`,
        availableRooms: 0,
        availability: availability
      });
    }
    
    console.log(`✅ Room available: ${availability.availableRooms} rooms of ${availability.totalRooms} total`);
    console.log('');
    
    // Calculate pricing
    console.log('💰 Calculating pricing...');
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const roomsBooked = parseInt(normalizedBody.roomsBooked) || 1;
    const totalPrice = nights * roomConfig.price * roomsBooked;
    const depositAmount = Math.round(totalPrice * 0.5);
    const remainingAmount = totalPrice - depositAmount;
    
    console.log('   Nights:', nights);
    console.log('   Rooms booked:', roomsBooked);
    console.log('   Price per night:', roomConfig.price, 'Lek');
    console.log('   Total price:', totalPrice, 'Lek');
    console.log('   Deposit (50%):', depositAmount, 'Lek');
    console.log('   Remaining (50%):', remainingAmount, 'Lek');
    console.log('');
    
    // Create booking object
    console.log('💾 Creating booking object...');
    const bookingData = {
      checkInDate: normalizedBody.checkInDate,
      checkOutDate: normalizedBody.checkOutDate,
      guestName: normalizedBody.guestName,
      email: normalizedBody.email,
      phone: normalizedBody.phone || '',
      roomType: normalizedBody.roomType,
      numberOfGuests: numberOfGuests,
      specialRequests: normalizedBody.specialRequests || '',
      totalPrice: totalPrice,
      depositAmount: depositAmount,
      remainingAmount: remainingAmount,
      roomsBooked: roomsBooked,
      totalNights: nights,
      status: 'pending',
      paymentStatus: 'pending',
      source: normalizedBody.source || 'Website'
    };
    
    console.log('📦 Booking data:');
    console.log(JSON.stringify(bookingData, null, 2));
    console.log('');
    
    const booking = new Booking(bookingData);
    
    // Save to database
    console.log('💾 Saving booking to database...');
    await booking.save();
    console.log('✅ Booking saved successfully');
    console.log('   Booking ID:', booking._id);
    console.log('   Reference:', '#' + booking._id.toString().slice(-8).toUpperCase());
    console.log('');
    
    // Generate payment URL if Paysera is configured
    let paymentUrl = null;
    if (payseraService) {
      try {
        console.log('💳 Generating Paysera payment URL...');
        paymentUrl = payseraService.generatePaymentUrl(booking, 'deposit');
        console.log('✅ Payment URL generated:', paymentUrl);
      } catch (paymentError) {
        console.error('⚠️  Could not generate payment URL:', paymentError.message);
      }
    } else {
      console.log('⚠️  Paysera not configured - manual payment required');
    }
    console.log('');
    
    // Send notification emails
    console.log('📧 Sending notification emails...');
    try {
      await emailService.sendNewBookingNotification(booking);
      console.log('✅ Notification emails sent successfully');
    } catch (emailError) {
      console.error('⚠️  Error sending emails:', emailError.message);
      console.error('   Email error details:', emailError.stack);
      // Don't fail the booking if email fails
    }
    console.log('');
    
    // Emit Socket.io event for real-time admin updates
    if (global.io) {
      global.io.emit('newBooking', {
        booking: booking,
        message: 'New booking created'
      });
      console.log('📡 Real-time event emitted to admin panel');
    }
    
    console.log('');
    console.log('✅ BOOKING CREATION COMPLETED SUCCESSFULLY');
    console.log('🏨'.repeat(40) + '\n');
    
    // Build response
    const responseData = { 
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
        paymentInstructions: paymentUrl 
          ? 'Pay 50% deposit now through secure payment link, 50% on arrival'
          : 'We will contact you with payment instructions. 50% deposit required, 50% on arrival',
        payseraConfigured: !!payseraService
      }
    };
    
    console.log('📤 Sending successful response');
    res.status(201).json(responseData);
    
  } catch (error) {
    console.error('\n' + '❌'.repeat(40));
    console.error('❌ ERROR CREATING BOOKING');
    console.error('❌'.repeat(40));
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('❌'.repeat(40) + '\n');
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.log('❌ Mongoose validation errors:', messages);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation Error', 
        errors: messages,
        validationDetails: error.errors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      console.log('❌ Duplicate key error:', error.keyValue);
      return res.status(400).json({
        success: false,
        message: 'Duplicate booking detected',
        duplicateFields: error.keyValue
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating booking', 
      error: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : 'An error occurred while processing your booking. Please try again or contact us.' 
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
        console.log('✅ Update notification email sent');
      } catch (emailError) {
        console.error('❌ Error sending update email:', emailError);
      }
    }
    
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

// POST test endpoint to verify body parsing
router.post('/test-body-parser', (req, res) => {
  console.log('\n🧪 TEST ENDPOINT - Body Parser Verification');
  console.log('═'.repeat(60));
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Body Type:', typeof req.body);
  console.log('Body Constructor:', req.body?.constructor?.name);
  console.log('Body Keys:', Object.keys(req.body || {}));
  console.log('Body Content:', JSON.stringify(req.body, null, 2));
  console.log('═'.repeat(60) + '\n');
  
  res.json({
    success: true,
    message: 'Body parser test successful',
    received: {
      contentType: req.get('Content-Type'),
      bodyType: typeof req.body,
      bodyConstructor: req.body?.constructor?.name,
      bodyKeys: Object.keys(req.body || {}),
      body: req.body
    }
  });
});

module.exports = router;
