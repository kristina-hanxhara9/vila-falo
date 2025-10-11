const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    try {
      // Validate environment variables
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ Email credentials not configured. Email service will be disabled.');
        this.transporter = null;
        this.enabled = false;
        return;
      }

      // Create transporter with proper configuration
      this.transporter = nodemailer.createTransport({
        service: 'gmail', // Simplified for Gmail
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false // For development/Heroku
        }
      });

      this.adminEmail = process.env.ADMIN_EMAIL || 'vilafalo@gmail.com';
      this.fromEmail = process.env.EMAIL_FROM || 'Vila Falo Resort <vilafalo@gmail.com>';
      this.enabled = true;

      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      this.transporter = null;
      this.enabled = false;
    }
  }

  async sendEmail(mailOptions) {
    if (!this.enabled || !this.transporter) {
      console.warn('⚠️ Email service disabled, skipping email send');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send booking confirmation email to guest
   */
  async sendBookingConfirmation(booking) {
    if (!this.enabled) return { success: false };

    const checkIn = new Date(booking.checkInDate).toLocaleDateString('en-GB');
    const checkOut = new Date(booking.checkOutDate).toLocaleDateString('en-GB');
    
    const mailOptions = {
      from: this.fromEmail,
      to: booking.email,
      subject: 'Konfirmim Rezervimi - Vila Falo Resort',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5f2d;">Përshëndetje ${booking.guestName},</h2>
          <p>Faleminderit për rezervimin tuaj në Vila Falo Resort!</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c5f2d; margin-top: 0;">Detajet e Rezervimit</h3>
            <p><strong>Nr. Rezervimi:</strong> ${booking._id}</p>
            <p><strong>Check-in:</strong> ${checkIn}</p>
            <p><strong>Check-out:</strong> ${checkOut}</p>
            <p><strong>Lloji i Dhomës:</strong> ${booking.roomType}</p>
            <p><strong>Numri i Dhomave:</strong> ${booking.roomsBooked}</p>
            <p><strong>Numri i Mysafirëve:</strong> ${booking.numberOfGuests}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
            <p><strong>Çmimi Total:</strong> ${booking.totalPrice.toLocaleString()} ALL</p>
            <p><strong>Depozitë (50%):</strong> ${booking.depositAmount.toLocaleString()} ALL</p>
            <p><strong>Mbetet për tu Paguar (50%):</strong> ${booking.remainingAmount.toLocaleString()} ALL</p>
          </div>
          
          <p style="color: #666;">Depozita juaj është pranuar me sukses. Ju lutemi kryeni pagesën e mbetur gjatë check-in.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
              Për çdo pyetje, na kontaktoni:<br>
              Email: ${this.adminEmail}<br>
              Tel: ${process.env.VILLA_PHONE || '+355 68 336 9436'}
            </p>
          </div>
        </div>
      `
    };
    
    return await this.sendEmail(mailOptions);
  }

  /**
   * Send admin notification email
   */
  async sendAdminNotification(booking, eventType) {
    if (!this.enabled) return { success: false };

    const checkIn = new Date(booking.checkInDate).toLocaleDateString('en-GB');
    const checkOut = new Date(booking.checkOutDate).toLocaleDateString('en-GB');
    
    const mailOptions = {
      from: this.fromEmail,
      to: this.adminEmail,
      subject: `🔔 ${eventType} - Vila Falo Booking`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5f2d;">New Event: ${eventType}</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c5f2d; margin-top: 0;">Booking Details</h3>
            <p><strong>Booking ID:</strong> ${booking._id}</p>
            <p><strong>Guest Name:</strong> ${booking.guestName}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Phone:</strong> ${booking.phone || 'N/A'}</p>
            <p><strong>Check-in:</strong> ${checkIn}</p>
            <p><strong>Check-out:</strong> ${checkOut}</p>
            <p><strong>Room Type:</strong> ${booking.roomType}</p>
            <p><strong>Rooms:</strong> ${booking.roomsBooked}</p>
            <p><strong>Guests:</strong> ${booking.numberOfGuests}</p>
            ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
            <p><strong>Total Price:</strong> ${booking.totalPrice.toLocaleString()} ALL</p>
            <p><strong>Deposit (50%):</strong> ${booking.depositAmount.toLocaleString()} ALL</p>
            <p><strong>Remaining (50%):</strong> ${booking.remainingAmount.toLocaleString()} ALL</p>
            <p><strong>Payment Status:</strong> ${booking.paymentStatus}</p>
            <p><strong>Booking Status:</strong> ${booking.status}</p>
            <p><strong>Source:</strong> ${booking.source}</p>
          </div>
          
          <p><a href="${process.env.APP_URL || 'http://localhost:5000'}/admin.html" style="background-color: #2c5f2d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View in Admin Panel</a></p>
        </div>
      `
    };
    
    return await this.sendEmail(mailOptions);
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(booking, paymentType) {
    if (!this.enabled) return { success: false };

    const amount = paymentType === 'deposit' ? booking.depositAmount : booking.remainingAmount;
    const paymentLabel = paymentType === 'deposit' ? 'Depozitë (50%)' : 'Pagesa e Plotë';
    
    const mailOptions = {
      from: this.fromEmail,
      to: booking.email,
      subject: `Konfirmim Pagese - Vila Falo Resort`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5f2d;">Pagesa e Suksesshme!</h2>
          <p>Përshëndetje ${booking.guestName},</p>
          <p>Pagesa juaj është pranuar me sukses.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Lloji i Pagesës:</strong> ${paymentLabel}</p>
            <p><strong>Shuma e Paguar:</strong> ${amount.toLocaleString()} ALL</p>
            <p><strong>Nr. Rezervimi:</strong> ${booking._id}</p>
            <p><strong>Data e Pagesës:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
          </div>
          
          ${paymentType === 'full' ? 
            '<p style="color: #2c5f2d; font-weight: bold;">Rezervimi juaj është i konfirmuar plotësisht!</p>' :
            `<p><strong>Mbetet për tu Paguar (50%):</strong> ${booking.remainingAmount.toLocaleString()} ALL</p>`
          }
          
          <p>Presim me padurim vizitën tuaj!</p>
        </div>
      `
    };
    
    return await this.sendEmail(mailOptions);
  }

  /**
   * Send payment failure notification
   */
  async sendPaymentFailureNotification(booking) {
    if (!this.enabled) return { success: false };

    const mailOptions = {
      from: this.fromEmail,
      to: booking.email,
      subject: 'Problem me Pagesën - Vila Falo Resort',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c0392b;">Problem me Pagesën</h2>
          <p>Përshëndetje ${booking.guestName},</p>
          <p>Dini një problem me pagesën tuaj. Ju lutemi provoni përsëri ose kontaktoni me ne për asistencë.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nr. Rezervimi:</strong> ${booking._id}</p>
          </div>
          
          <p>Kontakt:<br>
          Email: ${this.adminEmail}<br>
          Tel: ${process.env.VILLA_PHONE || '+355 68 336 9436'}</p>
        </div>
      `
    };
    
    return await this.sendEmail(mailOptions);
  }

  /**
   * Send new booking notification to BOTH guest and admin
   */
  async sendNewBookingNotification(booking) {
    try {
      // Send confirmation to guest
      console.log('📧 Sending confirmation email to guest:', booking.email);
      const guestEmail = await this.sendBookingConfirmation(booking);
      
      // Send notification to admin
      console.log('📧 Sending notification email to admin:', this.adminEmail);
      const adminEmail = await this.sendAdminNotification(booking, 'New Booking Created');
      
      return {
        success: true,
        guestEmailSent: guestEmail.success,
        adminEmailSent: adminEmail.success
      };
    } catch (error) {
      console.error('❌ Error sending booking notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify email configuration
   */
  async verify() {
    if (!this.enabled || !this.transporter) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
