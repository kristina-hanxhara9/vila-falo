// EMAIL SERVICE FIX for Vila Falo
// This fixes the email functionality for booking confirmations

const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    async initializeTransporter() {
        try {
            // Configure email transporter with better error handling
            this.transporter = nodemailer.createTransporter({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: process.env.EMAIL_SECURE === 'true', // false for 587, true for 465
                auth: {
                    user: process.env.EMAIL_USER || 'vilafalo@gmail.com',
                    pass: process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Verify connection
            if (process.env.EMAIL_USER && (process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD)) {
                try {
                    await this.transporter.verify();
                    console.log('✅ Email service initialized successfully');
                } catch (verifyError) {
                    console.error('❌ Email verification failed:', verifyError.message);
                    console.log('⚠️ Will attempt to send emails without verification');
                }
            } else {
                console.log('⚠️ Email credentials not configured properly');
                console.log('Required: EMAIL_USER and EMAIL_PASS (or GMAIL_APP_PASSWORD)');
            }
        } catch (error) {
            console.error('❌ Email service initialization failed:', error.message);
        }
    }

    async sendBookingConfirmation(booking) {
        if (!this.transporter) {
            console.log('📧 Email not configured - skipping confirmation email');
            return false;
        }

        try {
            const checkIn = new Date(booking.checkInDate);
            const checkOut = new Date(booking.checkOutDate);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            
            const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #2a6d4e, #3a8e6a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .label { font-weight: bold; color: #2a6d4e; }
                    .value { color: #333; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                    .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                    .highlight { background: #e8f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2a6d4e; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">🏔️ Vila Falo</div>
                        <h1>Rezervimi Juaj u Konfirmua!</h1>
                        <p>Your Booking is Confirmed!</p>
                    </div>
                    
                    <div class="content">
                        <div class="highlight">
                            <strong>Faleminderit për rezervimin tuaj në Vila Falo!</strong><br>
                            <em>Thank you for booking with Vila Falo!</em>
                        </div>
                        
                        <div class="booking-details">
                            <h3 style="color: #2a6d4e; margin-top: 0;">📋 Detajet e Rezervimit / Booking Details</h3>
                            
                            <div class="detail-row">
                                <span class="label">Emri / Name:</span>
                                <span class="value">${booking.guestName || booking.name}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Email:</span>
                                <span class="value">${booking.email}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Dhomë / Room:</span>
                                <span class="value">${booking.roomType}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Check-in:</span>
                                <span class="value">${checkIn.toLocaleDateString('sq-AL')}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Check-out:</span>
                                <span class="value">${checkOut.toLocaleDateString('sq-AL')}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Netë / Nights:</span>
                                <span class="value">${nights}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Mysafirë / Guests:</span>
                                <span class="value">${booking.numberOfGuests || booking.adults || 2}</span>
                            </div>
                            
                            ${booking.phone ? `
                            <div class="detail-row">
                                <span class="label">Telefon / Phone:</span>
                                <span class="value">${booking.phone}</span>
                            </div>
                            ` : ''}
                            
                            ${booking.specialRequests || booking.special ? `
                            <div class="detail-row">
                                <span class="label">Kërkesa të Veçanta / Special Requests:</span>
                                <span class="value">${booking.specialRequests || booking.special}</span>
                            </div>
                            ` : ''}
                        </div>
                        
                        <div class="highlight">
                            <h4>📞 Kontakti / Contact Information:</h4>
                            <p>
                                📧 Email: vilafalo@gmail.com<br>
                                📱 Phone: +355 68 336 9436<br>
                                📍 Address: Voskopoje Village, Korçë, Albania
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p>Vila Falo - Mountain Adventure Retreat</p>
                            <p>Voskopoje, Korçë, Albania</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `;

            const mailOptions = {
                from: `"Vila Falo Resort" <${process.env.EMAIL_USER || 'vilafalo@gmail.com'}>`,
                to: booking.email,
                subject: '✅ Konfirmim Rezervimi - Vila Falo / Booking Confirmation',
                html: emailHtml,
                text: `
                Rezervimi Juaj u Konfirmua - Vila Falo
                
                Emri: ${booking.guestName || booking.name}
                Dhomë: ${booking.roomType}
                Check-in: ${checkIn.toLocaleDateString()}
                Check-out: ${checkOut.toLocaleDateString()}
                Mysafirë: ${booking.numberOfGuests || booking.adults || 2}
                
                Faleminderit për rezervimin tuaj!
                
                Vila Falo
                Voskopoje, Korçë, Albania
                Phone: +355 68 336 9436
                Email: vilafalo@gmail.com
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Booking confirmation email sent to:', booking.email);
            console.log('Message ID:', result.messageId);
            return true;

        } catch (error) {
            console.error('❌ Error sending booking confirmation email:', error);
            throw error;
        }
    }

    async sendAdminNotification(booking) {
        if (!this.transporter) {
            console.log('📧 Email not configured - skipping admin notification');
            return false;
        }

        try {
            const checkIn = new Date(booking.checkInDate);
            const checkOut = new Date(booking.checkOutDate);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

            const adminEmailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .detail-row { margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .label { font-weight: bold; color: #dc3545; }
                    .source { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🆕 Rezervim i Ri - Vila Falo</h1>
                        <p>New Booking Received</p>
                    </div>
                    
                    <div class="content">
                        <div class="source">
                            <strong>Burimi: ${booking.source || 'Website'}</strong>
                            <br>
                            <small>Data: ${new Date().toLocaleString('sq-AL')}</small>
                        </div>
                        
                        <div class="booking-details">
                            <h3>Detajet e Rezervimit:</h3>
                            
                            <div class="detail-row">
                                <span class="label">Emri:</span>
                                ${booking.guestName || booking.name}
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Email:</span>
                                ${booking.email}
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Telefon:</span>
                                ${booking.phone || 'N/A'}
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Dhomë:</span>
                                ${booking.roomType}
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Check-in:</span>
                                ${checkIn.toLocaleDateString('sq-AL')}
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Check-out:</span>
                                ${checkOut.toLocaleDateString('sq-AL')}
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Netë:</span>
                                ${nights}
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Mysafirë:</span>
                                ${booking.numberOfGuests || booking.adults || 2}
                            </div>
                            
                            ${booking.specialRequests || booking.special ? `
                            <div class="detail-row">
                                <span class="label">Kërkesa të Veçanta:</span>
                                ${booking.specialRequests || booking.special}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `;

            const adminMailOptions = {
                from: `"Vila Falo System" <${process.env.EMAIL_USER || 'vilafalo@gmail.com'}>`,
                to: 'vilafalo@gmail.com', // Admin email
                subject: `🆕 Rezervim i Ri nga ${booking.source || 'Website'} - ${booking.guestName || booking.name}`,
                html: adminEmailHtml
            };

            const result = await this.transporter.sendMail(adminMailOptions);
            console.log('✅ Admin notification email sent');
            console.log('Message ID:', result.messageId);
            return true;

        } catch (error) {
            console.error('❌ Error sending admin notification email:', error);
            throw error;
        }
    }

    async testEmail() {
        if (!this.transporter) {
            throw new Error('Email service not initialized');
        }

        try {
            const testMailOptions = {
                from: `"Vila Falo Test" <${process.env.EMAIL_USER || 'vilafalo@gmail.com'}>`,
                to: 'vilafalo@gmail.com',
                subject: '🧪 Email Test - Vila Falo',
                html: `
                <h2>Email Test Successful</h2>
                <p>This is a test email from Vila Falo email service.</p>
                <p>Timestamp: ${new Date().toISOString()}</p>
                `
            };

            const result = await this.transporter.sendMail(testMailOptions);
            console.log('✅ Test email sent successfully');
            console.log('Message ID:', result.messageId);
            return true;
        } catch (error) {
            console.error('❌ Test email failed:', error);
            throw error;
        }
    }
}

module.exports = EmailService;
