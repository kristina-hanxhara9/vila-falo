const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  guestName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
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
    required: true
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
        checkInDate: { $lte: checkOut },
        checkOutDate: { $gte: checkIn }
      }
    ]
  });
  return conflictingBookings.length === 0;
};

module.exports = mongoose.model('Booking', bookingSchema);
