const crypto = require('crypto');

class PaymentService {
    constructor() {
        this.projectId = process.env.PAYSERA_PROJECT_ID;
        this.signPassword = process.env.PAYSERA_SIGN_PASSWORD;
        this.paymentUrl = process.env.PAYSERA_PAYMENT_URL || 'https://bank.paysera.com/pay/';
        
        if (!this.projectId || !this.signPassword) {
            console.warn('⚠️ PAYSERA credentials not configured - payment functionality will not work');
            console.warn('Required: PAYSERA_PROJECT_ID and PAYSERA_SIGN_PASSWORD');
        } else {
            console.log('✅ Paysera payment service initialized');
            console.log('Project ID:', this.projectId);
        }
    }

    /**
     * Calculate booking total based on room type and nights
     */
    calculateBookingTotal(roomType, nights, numberOfGuests) {
        // Room prices in Lek (per night)
        const roomPrices = {
            'Standard': 5000,  // Includes breakfast for 2
            'Deluxe': 6000,    // Includes breakfast for 3
            'Suite': 8000,      // Family Suite for 4
            'Premium': 7000,    // Premium Panoramic Suite
            'Premium Panorama Suite': 7000,
            'Standard Mountain Room': 5000,
            'Deluxe Family Suite': 6000
        };

        // Find matching room price
        let roomPrice = roomPrices[roomType] || 5000;
        
        // Check for partial matches
        if (!roomPrices[roomType]) {
            for (const [key, value] of Object.entries(roomPrices)) {
                if (roomType.includes(key) || key.includes(roomType)) {
                    roomPrice = value;
                    break;
                }
            }
        }

        // Calculate base price
        const basePrice = roomPrice * nights;

        // Breakfast is included in Standard (5000) and Deluxe (6000) rooms
        let breakfastCost = 0;

        const total = basePrice + breakfastCost;

        return {
            roomPrice,
            nights,
            basePrice,
            breakfastCost,
            total,
            deposit: Math.ceil(total * 0.5), // 50% deposit, rounded up
            currency: 'EUR' // Paysera works with EUR, we'll convert from ALL
        };
    }

    /**
     * Convert Albanian Lek to Euro
     */
    convertLekToEuro(amountInLek) {
        // Approximate conversion rate (update as needed)
        const conversionRate = 0.0093; // 1 ALL ≈ 0.0093 EUR
        return Math.ceil(amountInLek * conversionRate * 100) / 100; // Round to 2 decimals
    }

    /**
     * Create Paysera payment request
     */
    createPaymentRequest(booking, customerEmail) {
        try {
            if (!this.projectId || !this.signPassword) {
                throw new Error('Paysera is not configured');
            }

            const checkIn = new Date(booking.checkInDate);
            const checkOut = new Date(booking.checkOutDate);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

            const pricing = this.calculateBookingTotal(
                booking.roomType,
                nights,
                booking.numberOfGuests || 2
            );

            // Convert to EUR (cents)
            const amountInCents = Math.ceil(this.convertLekToEuro(pricing.deposit) * 100);

            // Prepare payment request data
            const paymentData = {
                projectid: this.projectId,
                orderid: booking._id ? booking._id.toString() : `TEMP-${Date.now()}`,
                amount: amountInCents, // Amount in cents
                currency: 'EUR',
                accepturl: `${process.env.APP_URL || 'https://vilafalo.com'}/payment-success`,
                cancelurl: `${process.env.APP_URL || 'https://vilafalo.com'}/payment-cancel`,
                callbackurl: `${process.env.APP_URL || 'https://vilafalo.com'}/api/booking/paysera-callback`,
                country: 'AL', // Albania
                p_firstname: booking.guestName.split(' ')[0] || '',
                p_lastname: booking.guestName.split(' ').slice(1).join(' ') || booking.guestName,
                p_email: customerEmail,
                test: process.env.NODE_ENV !== 'production' ? 1 : 0,
                version: '1.6',
                lang: 'ALB'
            };

            console.log('💳 Creating Paysera payment request:', {
                orderid: paymentData.orderid,
                amount: amountInCents,
                amountEUR: amountInCents / 100,
                depositALL: pricing.deposit
            });

            // Encode data
            const encodedData = Buffer.from(JSON.stringify(paymentData)).toString('base64');
            
            // Generate signature
            const signature = this.generateSignature(encodedData);

            // Create payment URL
            const paymentUrl = `${this.paymentUrl}?data=${encodeURIComponent(encodedData)}&sign=${encodeURIComponent(signature)}`;

            console.log('✅ Paysera payment request created');

            return {
                paymentUrl: paymentUrl,
                orderId: paymentData.orderid,
                amount: amountInCents,
                amountEUR: amountInCents / 100,
                currency: 'EUR',
                pricing: {
                    ...pricing,
                    depositEUR: this.convertLekToEuro(pricing.deposit),
                    totalEUR: this.convertLekToEuro(pricing.total)
                }
            };

        } catch (error) {
            console.error('❌ Error creating Paysera payment:', error);
            throw error;
        }
    }

    /**
     * Generate MD5 signature for Paysera
     */
    generateSignature(data) {
        const signString = data + this.signPassword;
        return crypto.createHash('md5').update(signString).digest('hex');
    }

    /**
     * Verify callback from Paysera
     */
    verifyCallback(data, signature) {
        try {
            const expectedSignature = this.generateSignature(data);
            
            if (signature !== expectedSignature) {
                console.error('❌ Invalid Paysera signature');
                return { success: false, error: 'Invalid signature' };
            }

            // Decode and parse data
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const paymentData = JSON.parse(decodedData);

            console.log('✅ Paysera callback verified:', {
                orderid: paymentData.orderid,
                status: paymentData.status
            });

            return {
                success: true,
                data: paymentData,
                isPaid: paymentData.status === '1' // 1 = payment successful
            };

        } catch (error) {
            console.error('❌ Error verifying Paysera callback:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verify payment was successful
     */
    async verifyPayment(orderId) {
        try {
            // For Paysera, verification is done via callback
            // This method is for manual checks if needed
            console.log('ℹ️ Paysera payment verification via callback');
            
            return {
                success: true,
                status: 'pending',
                message: 'Payment verification pending callback'
            };
        } catch (error) {
            console.error('❌ Error verifying payment:', error);
            throw error;
        }
    }

    /**
     * Process refund for cancellation (manual process with Paysera)
     */
    async processRefund(orderId, reason = 'Booking cancelled') {
        try {
            console.log('⚠️ Paysera refunds must be processed manually');
            console.log('Order ID:', orderId);
            console.log('Reason:', reason);
            console.log('Please process refund in Paysera dashboard');

            return {
                success: false,
                message: 'Paysera refunds must be processed manually in the Paysera dashboard',
                orderId: orderId
            };
        } catch (error) {
            console.error('❌ Error processing refund:', error);
            throw error;
        }
    }

    /**
     * Get payment details
     */
    async getPaymentDetails(orderId) {
        try {
            console.log('ℹ️ Fetching payment details for order:', orderId);
            
            // For Paysera, details are stored in booking
            return {
                orderId: orderId,
                status: 'Check booking for payment status',
                message: 'Payment details available in booking record'
            };
        } catch (error) {
            console.error('❌ Error getting payment details:', error);
            throw error;
        }
    }
}

module.exports = new PaymentService();
