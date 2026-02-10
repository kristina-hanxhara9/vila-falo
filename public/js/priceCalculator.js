/**
 * Centralized Price Calculator
 * Single source of truth for all pricing calculations
 */

window.PriceCalculator = {
  /**
   * Calculate number of nights between two dates
   */
  calculateNights: function(checkInDate, checkOutDate) {
    if (!checkInDate || !checkOutDate) return 0;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Check for invalid dates
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 0;

    const diffTime = Math.abs(checkOut - checkIn);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, nights);
  },

  /**
   * Get price per night for a room type
   */
  getPricePerNight: function(roomType) {
    return window.getRoomPrice ? window.getRoomPrice(roomType) : 0;
  },

  /**
   * Calculate total price (without deposit split)
   */
  calculateTotal: function(nights, pricePerNight, numberOfRooms = 1) {
    if (!nights || !pricePerNight) return 0;

    const total = nights * pricePerNight * numberOfRooms;
    return Math.round(total);
  },

  /**
   * Calculate deposit amount (50% of total)
   */
  calculateDeposit: function(totalPrice) {
    if (!totalPrice) return 0;

    const deposit = Math.round(totalPrice * 0.5);
    return deposit;
  },

  /**
   * Calculate remaining amount (50% of total)
   */
  calculateRemaining: function(totalPrice) {
    if (!totalPrice) return 0;

    const deposit = this.calculateDeposit(totalPrice);
    const remaining = totalPrice - deposit;
    return remaining;
  },

  /**
   * Calculate full pricing breakdown
   * Returns: { nights, pricePerNight, totalPrice, depositAmount, remainingAmount }
   */
  calculateFullPricing: function(checkInDate, checkOutDate, roomType, numberOfRooms = 1) {
    const nights = this.calculateNights(checkInDate, checkOutDate);
    const pricePerNight = this.getPricePerNight(roomType);
    const totalPrice = this.calculateTotal(nights, pricePerNight, numberOfRooms);
    const depositAmount = this.calculateDeposit(totalPrice);
    const remainingAmount = this.calculateRemaining(totalPrice);

    return {
      nights,
      pricePerNight,
      numberOfRooms,
      totalPrice,
      depositAmount,
      remainingAmount,
      valid: nights > 0 && totalPrice > 0
    };
  },

  /**
   * Format currency (Albanian Lek)
   */
  formatCurrency: function(amount) {
    if (!amount && amount !== 0) return '0 ALL';
    return amount.toLocaleString('sq-AL') + ' ALL';
  },

  /**
   * Format price for display
   */
  formatPrice: function(amount) {
    return this.formatCurrency(amount);
  },

  /**
   * Validate pricing
   */
  validatePricing: function(checkInDate, checkOutDate, roomType) {
    const nights = this.calculateNights(checkInDate, checkOutDate);
    const roomCapacity = window.getRoomCapacity ? window.getRoomCapacity(roomType) : 0;

    const errors = [];

    if (!checkInDate) errors.push('Check-in date is required');
    if (!checkOutDate) errors.push('Check-out date is required');
    if (nights <= 0) errors.push('Check-out must be after check-in');
    if (!roomType) errors.push('Room type is required');
    if (roomCapacity <= 0) errors.push('Invalid room type');

    return {
      valid: errors.length === 0,
      errors,
      nights,
      roomCapacity
    };
  }
};

console.log('✅ Price calculator loaded');
