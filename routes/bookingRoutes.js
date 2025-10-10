const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const emailService = require('../services/emailService');
const paymentService = require('../services/paymentService');

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

// POST create payment request (step 1 - before redirect to Paysera)
router.post('/create-payment', async (req, res) => {
  try {
    console.log('💳 Creating Paysera payment request...');
    
    const { guestName, email, roomType, checkInDate, checkOutDate, numberOfGuests, phone, specialRequests } = req.body;
    
    // Validate required fields
    if (!email || !roomType || !checkInDate || !checkOutDate || !guestName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for payment'
      });
    }

    // Create temporary booking first
    const bookingData = {
      guestName,
      email,
      phone: phone || '',
      roomType,
      checkInDate,
      checkOutDate,
      numberOfGuests: numberOfGuests || 2,
      specialRequests: specialRequests || '',
      status: 'pending',
      paymentStatus: 'pending',
      source: 'Website'
    };

    // Calculate pricing
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const pricing = paymentService.calculateBookingTotal(roomType, nights, numberOfGuests);
    
    bookingData.totalPrice = pricing.total;
    bookingData.depositAmount = pricing.deposit;

    // Save booking
    const booking = new Booking(bookingData);
    await booking.save();

    console.log('✅ Booking created with ID:', booking._id);

    // Create Paysera payment request
    const paymentData = await paymentService.createPaymentRequest(booking, email);
    
    console.log('✅ Paysera payment URL created');
    
    res.json({
      success: true,
      paymentUrl: paymentData.paymentUrl,
      orderId: paymentData.orderId,
      bookingId: booking._id,
      pricing: paymentData.pricing
    });

  } catch (error) {
    console.error('❌ Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Payment error'
    });
  }
});

// POST Paysera callback (step 2 - after payment on Paysera)
router.post('/paysera-callback', async (req, res) => {
  try {
    console.log('📥 Paysera callback received');
    
    const { data, ss1, ss2 } = req.query;
    
    if (!data || !ss1) {
      console.error('❌ Missing callback parameters');
      return res.status(400).send('Missing parameters');
    }

    // Verify callback signature
    const verification = paymentService.verifyCallback(data, ss1);
    
    if (!verification.success) {
      console.error('❌ Invalid callback signature');
      return res.status(400).send('Invalid signature');
    }

    const paymentData = verification.data;
    const orderId = paymentData.orderid;
    const isPaid = verification.isPaid;

    console.log('✅ Callback verified for order:', orderId);
    console.log('Payment status:', isPaid ? 'PAID' : 'PENDING');

    // Find and update booking
    const booking = await Booking.findById(orderId);
    
    if (!booking) {
      console.error('❌ Booking not found:', orderId);
      return res.status(404).send('Booking not found');
    }

    // Update booking with payment info
    if (isPaid) {
      booking.paymentStatus = 'paid_deposit';
      booking.depositPaid = true;
      booking.status = 'confirmed';
      booking.paymentDate = new Date();
      booking.paymentIntentId = paymentData.requestid || orderId;
      
      await booking.save();
      
      console.log('✅ Booking updated: payment confirmed');
      
      // Send confirmation emails
      try {
        await emailService.sendBookingConfirmation(booking);
        await emailService.sendAdminNotification(booking);
        console.log('✅ Confirmation emails sent');
      } catch (emailError) {
        console.error('❌ Error sending emails:', emailError);
      }
    } else {
      booking.paymentStatus = 'pending';
      await booking.save();
      console.log('⏳ Payment still pending');
    }

    // Respond with OK to Paysera
    res.send('OK');

  } catch (error) {
    console.error('❌ Error processing callback:', error);
    res.status(500).send('Error');
  }
});

// GET payment success page (redirect from Paysera)
router.get('/payment-success', async (req, res) => {
  try {
    const { data } = req.query;
    
    if (data) {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const paymentData = JSON.parse(decodedData);
      const bookingId = paymentData.orderid;
      
      res.redirect(`/booking-confirmation.html?bookingId=${bookingId}&status=success`);
    } else {
      res.redirect('/booking-confirmation.html?status=success');
    }
  } catch (error) {
    res.redirect('/booking-confirmation.html?status=success');
  }
});

// GET payment cancel page (redirect from Paysera)
router.get('/payment-cancel', async (req, res) => {
  res.redirect('/booking-confirmation.html?status=cancelled');
});

// POST create new booking (legacy endpoint, now redirects to payment)
router.post('/', async (req, res) => {
  try {
    console.log('🏨 New booking request received (legacy)');
    
    // For chatbot or direct bookings without payment
    const bookingData = {
      ...req.body,
      roomsBooked: req.body.roomsBooked || 1,
      paymentStatus: 'pending',
      depositPaid: false
    };
    
    const booking = new Booking(bookingData);
    await booking.save();
    
    console.log('✅ Booking saved:', booking._id);
    
    // Send emails
    try {
      await emailService.sendBookingConfirmation(booking);
      await emailService.sendAdminNotification(booking);
    } catch (emailError) {
      console.error('❌ Error sending emails:', emailError);
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully', 
      data: booking
    });
  } catch (error) {
    console.error('❌ Error creating booking:', error);
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
        console.error('❌ Error sending update email:', emailError);
      }
    }
    
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error updating booking:', error);
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
