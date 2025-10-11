const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  checkInDate: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'deposit_paid', 'fully_paid', 'refunded', 'failed'],
    default: 'pending'
  },
  roomType: {
    type: String,
    required: [true, 'Room type is required']
  },
  roomsBooked: {
    type: Number,
    default: 1,
    min: [1, 'At least one room must be booked'],
    max: [3, 'Maximum 3 rooms per booking']
  },
  numberOfGuests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least one guest is required']
  },
  specialRequests: {
    type: String,
    trim: true
  },
  addons: {
    type: [String]
  },
  totalPrice: {
    type: Number,
    required: true
  },
  depositAmount: {
    type: Number,
    required: true
  },
  remainingAmount: {
    type: Number,
    required: true
  },
  paymentDetails: {
    payseraOrderId: String,
    payseraTransactionId: String,
    paymentMethod: String,
    depositPaidAt: Date,
    fullPaymentAt: Date
  },
  source: {
    type: String,
    enum: ['Website', 'Chatbot', 'Phone', 'Admin', 'Other'],
    default: 'Website'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate deposit and remaining amount (50% deposit)
  if (this.isModified('totalPrice')) {
    this.depositAmount = Math.round(this.totalPrice * 0.5);
    this.remainingAmount = this.totalPrice - this.depositAmount;
  }
  
  // Skip validation if dates aren't changed or set
  if (!this.isModified('checkInDate') && !this.isModified('checkOutDate')) {
    return next();
  }
  
  // Both dates need to be set to compare
  if (this.checkInDate && this.checkOutDate) {
    if (this.checkInDate >= this.checkOutDate) {
      return next(new Error('Check-in date must be before check-out date'));
    }
  }
  
  next();
});

// Add a method to check room availability
bookingSchema.statics.checkAvailability = async function(checkInDate, checkOutDate, roomType) {
  const conflictingBookings = await this.find({
    roomType: roomType,
    status: { $ne: 'cancelled' },
    $or: [
      {
        checkInDate: { $lt: checkOutDate },
        checkOutDate: { $gt: checkInDate }
      }
    ]
  });
  
  return conflictingBookings.length === 0;
};

// Virtual for totalNights
bookingSchema.virtual('totalNights').get(function() {
  if (!this.checkInDate || !this.checkOutDate) return 0;
  
  const checkIn = new Date(this.checkInDate);
  const checkOut = new Date(this.checkOutDate);
  const diffTime = Math.abs(checkOut - checkIn);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Enable virtuals in JSON
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
