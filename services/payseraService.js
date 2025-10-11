const crypto = require('crypto');

class PayseraService {
  constructor() {
    this.projectId = process.env.PAYSERA_PROJECT_ID;
    this.signPassword = process.env.PAYSERA_SIGN_PASSWORD;
    this.testMode = process.env.PAYSERA_TEST_MODE === 'true';
    
    // Paysera payment URLs
    this.paymentUrl = this.testMode 
      ? 'https://bank.paysera.com/pay/' 
      : 'https://www.paysera.com/pay/';
  }

  /**
   * Generate payment URL for Paysera
   * @param {Object} booking - Booking object
   * @param {string} type - 'deposit' or 'full'
   * @returns {string} Payment URL
   */
  generatePaymentUrl(booking, type = 'deposit') {
    const amount = type === 'deposit' ? booking.depositAmount : booking.remainingAmount;
    const orderId = `${booking._id}-${type}-${Date.now()}`;
    
    // Prepare payment data
    const paymentData = {
      projectid: this.projectId,
      orderid: orderId,
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'ALL', // Albanian Lek
      accepturl: `${process.env.APP_URL}/payment/success`,
      cancelurl: `${process.env.APP_URL}/payment/cancel`,
      callbackurl: `${process.env.APP_URL}/api/payment/callback`,
      country: 'AL',
      p_firstname: booking.guestName.split(' ')[0],
      p_lastname: booking.guestName.split(' ').slice(1).join(' ') || booking.guestName,
      p_email: booking.email,
      test: this.testMode ? '1' : '0',
      version: '1.6',
      lang: 'ALB'
    };

    // Encode payment data
    const encodedData = Buffer.from(JSON.stringify(paymentData)).toString('base64');
    
    // Generate signature
    const signature = this.generateSignature(encodedData);
    
    // Create payment URL
    return `${this.paymentUrl}?data=${encodedData}&sign=${signature}`;
  }

  /**
   * Generate signature for Paysera payment
   * @param {string} data - Encoded payment data
   * @returns {string} MD5 signature
   */
  generateSignature(data) {
    const signString = data + this.signPassword;
    return crypto.createHash('md5').update(signString).digest('hex');
  }

  /**
   * Verify callback signature from Paysera
   * @param {string} data - Encoded callback data
   * @param {string} sign - Signature from Paysera
   * @returns {boolean} Valid or not
   */
  verifyCallback(data, sign) {
    const expectedSign = this.generateSignature(data);
    return expectedSign === sign;
  }

  /**
   * Decode callback data from Paysera
   * @param {string} data - Encoded callback data
   * @returns {Object} Decoded data
   */
  decodeCallbackData(data) {
    const decodedString = Buffer.from(data, 'base64').toString('utf-8');
    return JSON.parse(decodedString);
  }
}

module.exports = new PayseraService();
