const Booking = require('../models/Booking');
const RoomInventory = require('../models/RoomInventory');

class BookingService {
  /**
   * Initialize room cache on startup
   */
  async initializeRoomCache() {
    try {
      this.roomCache = await RoomInventory.getActiveRooms();
      console.log('✅ Room cache initialized:', this.roomCache.map(r => r.type).join(', '));
    } catch (error) {
      console.error('❌ Failed to initialize room cache:', error.message);
      this.roomCache = [];
    }
  }

  /**
   * Get room by type (from cache or database)
   */
  async getRoomByType(roomType) {
    // Try cache first
    if (this.roomCache && this.roomCache.length > 0) {
      const cachedRoom = this.roomCache.find(r => r.type === roomType);
      if (cachedRoom) return cachedRoom;
    }

    // Fallback to database
    const room = await RoomInventory.getByType(roomType);
    if (room && this.roomCache) {
      // Update cache
      const index = this.roomCache.findIndex(r => r.type === roomType);
      if (index !== -1) {
        this.roomCache[index] = room;
      } else {
        this.roomCache.push(room);
      }
    }
    return room;
  }

  /**
   * Get all active rooms
   */
  async getAllRooms() {
    if (this.roomCache && this.roomCache.length > 0) {
      return this.roomCache;
    }
    return await RoomInventory.getActiveRooms();
  }

  /**
   * Normalize room type with comprehensive mapping
   */
  normalizeRoomType(roomType) {
    if (!roomType) return null;

    let normalized = roomType.toString().trim();

    // Comprehensive room type mapping
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

    // Try direct mapping
    if (roomTypeMap[normalized]) {
      return roomTypeMap[normalized];
    }

    // Try case-insensitive search
    const lowerNormalized = normalized.toLowerCase();
    for (const [key, value] of Object.entries(roomTypeMap)) {
      if (key.toLowerCase() === lowerNormalized) {
        return value;
      }
    }

    return normalized; // Return as-is if no mapping found
  }

  /**
   * Validate guest count against room capacity
   */
  validateGuestCount(numberOfGuests, roomConfig) {
    const guests = parseInt(numberOfGuests);

    if (isNaN(guests) || guests < 1) {
      return { valid: false, message: 'Please specify at least 1 guest.' };
    }

    if (guests > roomConfig.maxGuests) {
      return {
        valid: false,
        message: `${roomConfig.name} can accommodate a maximum of ${roomConfig.maxGuests} guests. You selected ${guests} guests. Please choose a larger room type or reduce the number of guests.`
      };
    }

    return { valid: true };
  }

  /**
   * Check room availability for specific dates and room type
   */
  async checkAvailability(checkInDate, checkOutDate, roomType, excludeBookingId = null) {
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

      const roomConfig = await this.getRoomByType(roomType);
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

  /**
   * Calculate booking pricing
   */
  calculatePricing(nights, pricePerNight, roomsBooked = 1) {
    const totalPrice = nights * pricePerNight * roomsBooked;
    const depositAmount = Math.round(totalPrice * 0.5);
    const remainingAmount = totalPrice - depositAmount;

    return {
      totalPrice,
      depositAmount,
      remainingAmount,
      nights,
      pricePerNight,
      roomsBooked
    };
  }

  /**
   * Calculate nights between two dates
   */
  calculateNights(checkInDate, checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return nights;
  }

  /**
   * Validate booking dates
   */
  validateDates(checkInDate, checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return { valid: false, message: 'Invalid date format. Use YYYY-MM-DD' };
    }

    if (checkOut <= checkIn) {
      return { valid: false, message: 'Check-out date must be after check-in date' };
    }

    return { valid: true };
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData) {
    try {
      // Normalize room type
      const normalizedRoomType = this.normalizeRoomType(bookingData.roomType);

      // Validate dates
      const dateValidation = this.validateDates(bookingData.checkInDate, bookingData.checkOutDate);
      if (!dateValidation.valid) {
        return { success: false, message: dateValidation.message };
      }

      // Get room configuration
      const roomConfig = await this.getRoomByType(normalizedRoomType);
      if (!roomConfig) {
        return {
          success: false,
          message: 'Invalid room type selected',
          validRoomTypes: (await this.getAllRooms()).map(r => r.type)
        };
      }

      // Validate guest count
      const numberOfGuests = parseInt(bookingData.numberOfGuests);
      const guestValidation = this.validateGuestCount(numberOfGuests, roomConfig);
      if (!guestValidation.valid) {
        return { success: false, message: guestValidation.message };
      }

      // Check availability
      const availability = await this.checkAvailability(
        bookingData.checkInDate,
        bookingData.checkOutDate,
        normalizedRoomType
      );

      if (!availability.available) {
        return {
          success: false,
          message: `Sorry, no ${roomConfig.name} rooms available for these dates.`,
          availableRooms: 0
        };
      }

      // Calculate pricing
      const nights = this.calculateNights(bookingData.checkInDate, bookingData.checkOutDate);
      const roomsBooked = parseInt(bookingData.roomsBooked) || 1;
      const pricing = this.calculatePricing(nights, roomConfig.pricePerNight, roomsBooked);

      // Create booking document
      const booking = new Booking({
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        guestName: bookingData.guestName,
        email: bookingData.email,
        phone: bookingData.phone,
        roomType: normalizedRoomType,
        numberOfGuests: numberOfGuests,
        specialRequests: bookingData.specialRequests,
        totalPrice: pricing.totalPrice,
        depositAmount: pricing.depositAmount,
        remainingAmount: pricing.remainingAmount,
        roomsBooked: roomsBooked,
        totalNights: nights,
        status: 'pending',
        paymentStatus: 'pending',
        source: bookingData.source || 'Website',
        language: bookingData.language || 'al'
      });

      // Save to database
      await booking.save();

      return {
        success: true,
        booking: booking,
        pricing: pricing,
        roomConfig: roomConfig
      };
    } catch (error) {
      console.error('Booking creation error:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId) {
    try {
      return await Booking.findById(bookingId);
    } catch (error) {
      console.error('Error fetching booking:', error);
      return null;
    }
  }

  /**
   * Update booking
   */
  async updateBooking(bookingId, updateData) {
    try {
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        updateData,
        { new: true, runValidators: true }
      );
      return { success: true, booking };
    } catch (error) {
      console.error('Error updating booking:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId) {
    try {
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { status: 'cancelled', paymentStatus: 'refunded' },
        { new: true }
      );
      return { success: true, booking };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new BookingService();
