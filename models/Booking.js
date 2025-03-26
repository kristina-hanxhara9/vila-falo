const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  checkInDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return this.checkOutDate > value;
      },
      message: 'Check-in date must be before check-out date.'
    }
  },
  checkOutDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.checkInDate;
      },
      message: 'Check-out date must be after check-in date.'
    }
  },
  guestName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  roomType: {
    type: String,
    required: true
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: [1, 'At least one guest is required.']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add a method to check room availability
bookingSchema.statics.checkAvailability = async function(checkIn, checkOut, roomType) {
  const conflictingBookings = await this.find({
    roomType: roomType,
    status: 'confirmed',
    $or: [
      // Check if new booking overlaps with existing ones
      {
        checkInDate: { $lt: checkOut },
        checkOutDate: { $gt: checkIn }
      }
    ]
  });
  return conflictingBookings.length === 0;
};

module.exports = mongoose.model('Booking', bookingSchema);
