const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const payseraService = require('../services/payseraService');
const emailService = require('../services/emailService');

/**
 * POST /api/payment/initiate
 * Initiate payment for a booking
 */
router.post('/initiate', async (req, res) => {
  try {
    const { bookingId, paymentType } = req.body;
    
    // Validate payment type
    if (!['deposit', 'full'].includes(paymentType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment type' 
      });
    }
    
    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    // Check if deposit is already paid for full payment
    if (paymentType === 'full' && booking.paymentStatus !== 'deposit_paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Deposit must be paid first' 
      });
    }
    
    // Generate payment URL
    const paymentUrl = payseraService.generatePaymentUrl(booking, paymentType);
    
    res.json({
      success: true,
      paymentUrl,
      amount: paymentType === 'deposit' ? booking.depositAmount : booking.remainingAmount
    });
    
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initiate payment' 
    });
  }
});

/**
 * GET /api/payment/callback
 * Paysera payment callback
 */
router.get('/callback', async (req, res) => {
  try {
    const { data, ss1, ss2 } = req.query;
    
    // Verify signature
    if (!payseraService.verifyCallback(data, ss1)) {
      console.error('Invalid payment signature');
      return res.status(400).send('Invalid signature');
    }
    
    // Decode payment data
    const paymentData = payseraService.decodeCallbackData(data);
    
    // Extract booking ID from order ID (format: bookingId-type-timestamp)
    const [bookingId, paymentType] = paymentData.orderid.split('-');
    
    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error('Booking not found:', bookingId);
      return res.status(404).send('Booking not found');
    }
    
    // Update booking based on payment status
    if (paymentData.status === '1') { // Payment successful
      if (paymentType === 'deposit') {
        booking.paymentStatus = 'deposit_paid';
        booking.status = 'confirmed';
        booking.paymentDetails = {
          ...booking.paymentDetails,
          payseraOrderId: paymentData.orderid,
          payseraTransactionId: paymentData.requestid,
          depositPaidAt: new Date()
        };
        
        // Send confirmation email
        await emailService.sendBookingConfirmation(booking);
        await emailService.sendAdminNotification(booking, 'Deposit Paid');
        
      } else if (paymentType === 'full') {
        booking.paymentStatus = 'fully_paid';
        booking.paymentDetails = {
          ...booking.paymentDetails,
          fullPaymentAt: new Date()
        };
        
        // Send full payment confirmation
        await emailService.sendPaymentConfirmation(booking, 'full');
        await emailService.sendAdminNotification(booking, 'Full Payment Received');
      }
      
      await booking.save();
      
      // Emit Socket.io event for real-time admin updates
      if (global.io) {
        global.io.emit('paymentReceived', {
          booking: booking,
          paymentType: paymentType,
          message: `Payment received: ${paymentType}`
        });
        console.log('📡 Real-time payment event emitted to admin panel');
      }
      
    } else {
      // Payment failed or cancelled
      booking.paymentStatus = 'failed';
      await booking.save();
      
      // Send failure notification
      await emailService.sendPaymentFailureNotification(booking);
      
      // Emit Socket.io event for failed payment
      if (global.io) {
        global.io.emit('paymentFailed', {
          booking: booking,
          message: 'Payment failed'
        });
        console.log('📡 Real-time payment failure event emitted to admin panel');
      }
    }
    
    // Return OK to Paysera
    res.send('OK');
    
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).send('Error processing payment');
  }
});

/**
 * GET /api/payment/status/:bookingId
 * Check payment status
 */
router.get('/status/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    res.json({
      success: true,
      bookingId: booking._id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.totalPrice,
      depositAmount: booking.depositAmount,
      remainingAmount: booking.remainingAmount,
      paymentDetails: booking.paymentDetails
    });
    
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment status' 
    });
  }
});

module.exports = router;
