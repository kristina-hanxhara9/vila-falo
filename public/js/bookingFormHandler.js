/**
 * Unified Booking Form Handler
 * Consolidates all form handling logic in one place
 * Handles form validation, submission, and response handling
 */

window.BookingFormHandler = {
  // Configuration
  config: {
    baseUrl: '/api/booking',
    languageKey: 'preferredLanguage',
    defaultLanguage: 'al'
  },

  /**
   * Initialize form handlers on page load
   */
  init: function(formSelector = '#bookingForm') {
    const form = document.querySelector(formSelector);
    if (!form) {
      console.warn('Booking form not found:', formSelector);
      return;
    }

    // Add event listeners for real-time price calculation
    form.addEventListener('change', this.handleFormChange.bind(this));
    form.addEventListener('submit', this.handleFormSubmit.bind(this));

    // Update price on initial load
    this.updatePrice();

    console.log('✅ Booking form handler initialized');
  },

  /**
   * Handle form field changes (for price updates, validation, etc.)
   */
  handleFormChange: function(event) {
    const field = event.target;

    if (['checkInDate', 'checkOutDate', 'roomType', 'roomsBooked'].includes(field.name)) {
      this.updatePrice();
    }

    // Clear error message on field change
    const errorContainer = field.closest('.form-group')?.querySelector('.error-message');
    if (errorContainer) {
      errorContainer.style.display = 'none';
    }
  },

  /**
   * Update price display based on current form values
   */
  updatePrice: function() {
    try {
      // Get form values
      const form = document.querySelector('[data-form="booking"]') || document.querySelector('form');
      if (!form) return;

      const checkIn = form.querySelector('[name="checkInDate"]')?.value;
      const checkOut = form.querySelector('[name="checkOutDate"]')?.value;
      const roomType = form.querySelector('[name="roomType"]')?.value;
      const roomsBooked = parseInt(form.querySelector('[name="roomsBooked"]')?.value) || 1;

      if (!checkIn || !checkOut || !roomType) {
        this.displayPrice(null);
        return;
      }

      // Calculate pricing
      const pricing = window.PriceCalculator.calculateFullPricing(checkIn, checkOut, roomType, roomsBooked);

      if (pricing.valid) {
        this.displayPrice(pricing);
      } else {
        this.displayPrice(null);
      }
    } catch (error) {
      console.error('Error updating price:', error);
    }
  },

  /**
   * Display price summary
   */
  displayPrice: function(pricing) {
    const priceContainer = document.getElementById('priceBreakdown') ||
                          document.querySelector('.price-summary') ||
                          document.querySelector('[data-price-display]');

    if (!priceContainer) {
      console.debug('Price container not found');
      return;
    }

    if (!pricing || !pricing.valid) {
      priceContainer.style.display = 'none';
      return;
    }

    // Build price display HTML
    const html = `
      <div class="price-breakdown" style="padding: 15px; background: #f9f9f9; border-radius: 6px; margin-top: 15px; border-left: 4px solid #2c5f2d;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Nights:</span>
          <strong>${pricing.nights}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Price per night:</span>
          <strong>${window.PriceCalculator.formatPrice(pricing.pricePerNight)}</strong>
        </div>
        ${pricing.numberOfRooms > 1 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Number of rooms:</span>
            <strong>${pricing.numberOfRooms}</strong>
          </div>
        ` : ''}
        <hr style="margin: 10px 0; border: none; border-top: 1px solid #ddd;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="font-weight: bold;">Total Price:</span>
          <strong style="font-size: 1.2em; color: #2c5f2d;">${window.PriceCalculator.formatPrice(pricing.totalPrice)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em;">
          <span>Deposit (50%):</span>
          <span>${window.PriceCalculator.formatPrice(pricing.depositAmount)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.9em;">
          <span>On arrival (50%):</span>
          <span>${window.PriceCalculator.formatPrice(pricing.remainingAmount)}</span>
        </div>
      </div>
    `;

    priceContainer.innerHTML = html;
    priceContainer.style.display = 'block';
  },

  /**
   * Validate form before submission
   */
  validateForm: function(data) {
    const errors = [];

    // Validate dates
    if (!data.checkInDate) errors.push('Check-in date is required');
    if (!data.checkOutDate) errors.push('Check-out date is required');
    if (data.checkInDate && data.checkOutDate && new Date(data.checkOutDate) <= new Date(data.checkInDate)) {
      errors.push('Check-out date must be after check-in date');
    }

    // Validate guest info
    if (!data.guestName || !data.guestName.trim()) errors.push('Guest name is required');
    if (!data.email || !data.email.trim()) errors.push('Email is required');
    if (data.email && !this.isValidEmail(data.email)) errors.push('Invalid email format');

    // Validate room selection
    if (!data.roomType) errors.push('Please select a room type');
    if (!data.numberOfGuests) errors.push('Please specify number of guests');
    if (data.numberOfGuests < 1) errors.push('At least 1 guest is required');

    return { valid: errors.length === 0, errors };
  },

  /**
   * Validate email format
   */
  isValidEmail: function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Collect form data
   */
  collectFormData: function() {
    const form = document.querySelector('[data-form="booking"]') || document.querySelector('form');
    if (!form) return null;

    const formData = new FormData(form);
    const data = {
      checkInDate: formData.get('checkInDate'),
      checkOutDate: formData.get('checkOutDate'),
      guestName: formData.get('guestName') || formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || '',
      roomType: formData.get('roomType'),
      numberOfGuests: parseInt(formData.get('numberOfGuests') || formData.get('guests') || 1),
      roomsBooked: parseInt(formData.get('roomsBooked') || 1),
      specialRequests: formData.get('specialRequests') || formData.get('requests') || '',
      source: 'Website',
      language: this.getLanguage()
    };

    return data;
  },

  /**
   * Get user's language preference
   */
  getLanguage: function() {
    return localStorage.getItem(this.config.languageKey) || this.config.defaultLanguage;
  },

  /**
   * Handle form submission
   */
  handleFormSubmit: async function(event) {
    event.preventDefault();

    try {
      // Collect and validate form data
      const data = this.collectFormData();
      const validation = this.validateForm(data);

      if (!validation.valid) {
        this.showErrors(validation.errors);
        return;
      }

      // Show loading state
      this.showLoading(true);

      // Submit booking
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      this.showLoading(false);

      if (result.success) {
        this.handleSuccess(result);
      } else {
        this.showErrors([result.message || 'Failed to create booking']);
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      this.showLoading(false);
      this.showErrors(['An error occurred while processing your booking. Please try again.']);
    }
  },

  /**
   * Handle successful booking
   */
  handleSuccess: function(result) {
    // Show success message
    this.showSuccess(`✅ Booking created successfully! Your Booking ID: ${result.booking._id}`);

    // If payment URL is available, redirect to payment
    if (result.paymentUrl) {
      setTimeout(() => {
        window.location.href = result.paymentUrl;
      }, 2000);
    } else {
      // Show booking confirmation modal
      this.showConfirmationModal(result.booking);
      // Reset form
      document.querySelector('form')?.reset();
    }
  },

  /**
   * Show success message
   */
  showSuccess: function(message) {
    // Try different success message containers
    const containers = [
      document.getElementById('successMessage'),
      document.querySelector('.success-message'),
      document.querySelector('[data-success-message]'),
      document.querySelector('.alert-success')
    ];

    const container = containers.find(el => el);
    if (container) {
      container.textContent = message;
      container.style.display = 'block';
      container.style.color = '#28a745';
      container.style.padding = '12px';
      container.style.marginBottom = '15px';
      container.style.borderRadius = '4px';
      container.style.backgroundColor = '#d4edda';
    }
  },

  /**
   * Show errors
   */
  showErrors: function(errors) {
    // Try different error message containers
    const containers = [
      document.getElementById('errorMessage'),
      document.querySelector('.error-message'),
      document.querySelector('[data-error-message]'),
      document.querySelector('.alert-danger')
    ];

    const container = containers.find(el => el);
    if (container) {
      container.innerHTML = errors.map(err => `<div>❌ ${err}</div>`).join('');
      container.style.display = 'block';
      container.style.color = '#dc3545';
      container.style.padding = '12px';
      container.style.marginBottom = '15px';
      container.style.borderRadius = '4px';
      container.style.backgroundColor = '#f8d7da';
    }

    // Scroll to error message
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  /**
   * Show loading state
   */
  showLoading: function(isLoading) {
    const form = document.querySelector('form');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Processing...';
      submitBtn.style.opacity = '0.6';
      submitBtn.style.cursor = 'not-allowed';
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Book Now';
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
    }
  },

  /**
   * Show confirmation modal
   */
  showConfirmationModal: function(booking) {
    const modal = document.getElementById('bookingModal') || document.querySelector('[data-booking-modal]');
    if (!modal) {
      console.debug('Confirmation modal not found');
      return;
    }

    // Update modal content
    const modalContent = modal.querySelector('.modal-content') || modal;
    const html = `
      <div class="booking-confirmation" style="text-align: center; padding: 30px;">
        <h2 style="color: #2c5f2d; margin-bottom: 20px;">✅ Booking Confirmed!</h2>
        <p style="font-size: 1.1em; margin-bottom: 15px;">Thank you for your booking!</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: left;">
          <p><strong>Booking ID:</strong> ${booking._id}</p>
          <p><strong>Guest:</strong> ${booking.guestName}</p>
          <p><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toLocaleDateString()}</p>
          <p><strong>Total:</strong> ${window.PriceCalculator.formatPrice(booking.totalPrice)}</p>
        </div>
        <p style="color: #666; margin: 20px 0;">A confirmation email has been sent to <strong>${booking.email}</strong></p>
        <button onclick="location.reload()" style="background: #2c5f2d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 1em;">
          Close
        </button>
      </div>
    `;

    modalContent.innerHTML = html;
    modal.style.display = 'block';

    // Close modal on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
};

console.log('✅ Booking form handler loaded');
