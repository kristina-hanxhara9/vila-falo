const mongoose = require('mongoose');

const roomInventorySchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Room type is required'],
    unique: true,
    enum: ['Standard', 'Deluxe', 'Premium'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  albanianName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  totalRooms: {
    type: Number,
    required: [true, 'Total rooms is required'],
    min: [1, 'At least 1 room required'],
    default: 1
  },
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Minimum capacity is 1'],
    max: [10, 'Maximum capacity is 10']
  },
  minGuests: {
    type: Number,
    default: 1,
    min: [1, 'Minimum guests is 1']
  },
  maxGuests: {
    type: Number,
    required: [true, 'Max guests is required']
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative']
  },
  amenities: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
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

// Pre-save middleware to update timestamps
roomInventorySchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Ensure maxGuests >= minGuests
  if (this.maxGuests && this.minGuests && this.maxGuests < this.minGuests) {
    return next(new Error('Max guests must be >= Min guests'));
  }

  // Ensure maxGuests <= capacity
  if (this.maxGuests && this.capacity && this.maxGuests > this.capacity) {
    this.maxGuests = this.capacity;
  }

  next();
});

// Static method to get room by type
roomInventorySchema.statics.getByType = function(type) {
  return this.findOne({ type, isActive: true });
};

// Static method to get all active rooms
roomInventorySchema.statics.getActiveRooms = function() {
  return this.find({ isActive: true }).sort({ type: 1 });
};

// Static method to format for API response
roomInventorySchema.methods.toJSON = function() {
  return {
    _id: this._id,
    type: this.type,
    name: this.name,
    albanianName: this.albanianName,
    description: this.description,
    totalRooms: this.totalRooms,
    capacity: this.capacity,
    minGuests: this.minGuests,
    maxGuests: this.maxGuests,
    pricePerNight: this.pricePerNight,
    amenities: this.amenities,
    imageUrl: this.imageUrl,
    isActive: this.isActive
  };
};

module.exports = mongoose.model('RoomInventory', roomInventorySchema);
