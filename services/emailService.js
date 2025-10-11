const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    this.adminEmail = process.env.ADMIN_EMAIL || 'vilafalo@gmail.com';
    this.fromEmail = process.env.EMAIL_FROM || 'Vila Falo Resort <vilafalo@gmail.com>';
  }

  /**
   * Send booking confirmation email to guest
   */
  async sendBookingConfirmation(booking) {
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
            <p><strong>Depozitë e Paguar (50%):</strong> ${booking.depositAmount.toLocaleString()} ALL</p>
            <p><strong>Mbetet për tu Paguar:</strong> ${booking.remainingAmount.toLocaleString()} ALL</p>
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
    
    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send admin notification email
   */
  async sendAdminNotification(booking, eventType) {
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
            <p><strong>Deposit Paid:</strong> ${booking.depositAmount.toLocaleString()} ALL</p>
            <p><strong>Remaining:</strong> ${booking.remainingAmount.toLocaleString()} ALL</p>
            <p><strong>Payment Status:</strong> ${booking.paymentStatus}</p>
            <p><strong>Booking Status:</strong> ${booking.status}</p>
            <p><strong>Source:</strong> ${booking.source}</p>
          </div>
          
          <p><a href="${process.env.APP_URL}/admin/bookings.html" style="background-color: #2c5f2d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View in Admin Panel</a></p>
        </div>
      `
    };
    
    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(booking, paymentType) {
    const amount = paymentType === 'deposit' ? booking.depositAmount : booking.remainingAmount;
    const paymentLabel = paymentType === 'deposit' ? 'Depozitë' : 'Pagesa e Plotë';
    
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
            `<p><strong>Mbetet për tu Paguar:</strong> ${booking.remainingAmount.toLocaleString()} ALL</p>`
          }
          
          <p>Presim me padurim vizitën tuaj!</p>
        </div>
      `
    };
    
    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send payment failure notification
   */
  async sendPaymentFailureNotification(booking) {
    const mailOptions = {
      from: this.fromEmail,
      to: booking.email,
      subject: 'Problem me Pagesën - Vila Falo Resort',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c0392b;">Problem me Pagesën</h2>
          <p>Përshëndetje ${booking.guestName},</p>
          <p>Din një problem me pagesën tuaj. Ju lutemi provoni përsëri ose kontaktoni me ne për asistencë.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nr. Rezervimi:</strong> ${booking._id}</p>
          </div>
          
          <p>Kontakt:<br>
          Email: ${this.adminEmail}<br>
          Tel: ${process.env.VILLA_PHONE || '+355 68 336 9436'}</p>
        </div>
      `
    };
    
    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send new booking notification (without payment)
   */
  async sendNewBookingNotification(booking) {
    await this.sendAdminNotification(booking, 'New Booking Created');
  }
}

module.exports = new EmailService();
