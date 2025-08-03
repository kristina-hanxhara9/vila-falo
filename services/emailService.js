const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    async initializeTransporter() {
        try {
            // Configure email transporter
            this.transporter = nodemailer.createTransporter({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: process.env.EMAIL_SECURE === 'true', // false for 587, true for 465
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Verify connection
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                await this.transporter.verify();
                console.log('✅ Email service initialized successfully');
            } else {
                console.log('⚠️ Email credentials not configured');
            }
        } catch (error) {
            console.error('❌ Email service initialization failed:', error.message);
        }
    }

    async sendBookingConfirmation(booking) {
        if (!this.transporter || !process.env.EMAIL_USER) {
            console.log('📧 Email not configured - skipping confirmation email');
            return;
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
                    .header { background: linear-gradient(135deg, #4361ee, #560bad); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .label { font-weight: bold; color: #560bad; }
                    .value { color: #333; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                    .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                    .highlight { background: #e8f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4361ee; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">🏔️ Vila Falo</div>
                        <h1>Rezervimi Juaj u Konfirmua!</h1>
                        <p>Booking Confirmation</p>
                    </div>
                    
                    <div class="content">
                        <div class="highlight">
                            <strong>Faleminderit për rezervimin tuaj në Vila Falo!</strong><br>
                            <em>Thank you for booking with Vila Falo!</em>
                        </div>
                        
                        <div class="booking-details">
                            <h3 style="color: #4361ee; margin-top: 0;">📋 Detajet e Rezervimit / Booking Details</h3>
                            
                            <div class="detail-row">
                                <span class="label">Emri / Name:</span>
                                <span class="value">${booking.guestName}</span>
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
                                <span class="value">${booking.numberOfGuests}</span>
                            </div>
                            
                            ${booking.specialRequests ? `
                            <div class="detail-row">
                                <span class="label">Kërkesa të Veçanta / Special Requests:</span>
                                <span class="value">${booking.specialRequests}</span>
                            </div>
                            ` : ''}
                            
                            <div class="detail-row">
                                <span class="label">Status / Statusi:</span>
                                <span class="value" style="color: #28a745; font-weight: bold;">✅ ${booking.status === 'confirmed' ? 'Konfirmuar / Confirmed' : 'Në pritje / Pending'}</span>
                            </div>
                        </div>
                        
                        <div class="highlight">
                            <h4 style="margin-top: 0;">📍 Informacion Kontakti / Contact Information</h4>
                            <p><strong>Vila Falo</strong><br>
                            Voskopojë, Korçë, Albania<br>
                            📞 Phone: +355 68 336 9436<br>
                            📧 Email: vilafalo@gmail.com</p>
                        </div>
                        
                        <div class="highlight">
                            <h4 style="margin-top: 0;">🌟 Çfarë të Presni / What to Expect</h4>
                            <ul>
                                <li>🏔️ Pamje mahnitëse malore / Breathtaking mountain views</li>
                                <li>🍽️ Kuzhinë tradicionale shqiptare / Traditional Albanian cuisine</li>
                                <li>🎿 Aktivitete dimërore dhe verore / Winter and summer activities</li>
                                <li>🛏️ Dhoma komode dhe të ngrohta / Comfortable and cozy rooms</li>
                                <li>📶 WiFi falas / Free WiFi</li>
                            </ul>
                        </div>
                        
                        <div class="footer">
                            <p>Na kontaktoni nëse keni pyetje! / Contact us if you have any questions!</p>
                            <p><strong>Vila Falo - Your Mountain Adventure Awaits! 🏔️</strong></p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `;

            const mailOptions = {
                from: process.env.EMAIL_FROM || 'Vila Falo <noreply@vilafalo.com>',
                to: booking.email,
                subject: `🏔️ Konfirmim Rezervimi - Vila Falo | Booking Confirmation`,
                html: emailHtml
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Confirmation email sent to: ${booking.email}`);
        } catch (error) {
            console.error('❌ Error sending confirmation email:', error);
        }
    }

    async sendAdminNotification(booking) {
        if (!this.transporter || !process.env.EMAIL_USER || !process.env.ADMIN_EMAIL) {
            console.log('📧 Admin email not configured - skipping notification');
            return;
        }

        try {
            const checkIn = new Date(booking.checkInDate);
            const checkOut = new Date(booking.checkOutDate);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            const source = booking.source || 'Website';
            const sourceIcon = source === 'Chatbot' ? '🤖' : '🌐';
            
            const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ef476f, #f72585); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef476f; }
                    .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .label { font-weight: bold; color: #ef476f; }
                    .value { color: #333; }
                    .urgent { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
                    .actions { background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚨 Rezervim i Ri!</h1>
                        <p>New Booking Alert - Vila Falo</p>
                        <p>${sourceIcon} ${source}</p>
                    </div>
                    
                    <div class="content">
                        <div class="urgent">
                            <strong>⚡ URGENT: Reservation requires your attention!</strong><br>
                            A new booking has been submitted and needs confirmation.
                        </div>
                        
                        <div class="booking-details">
                            <h3 style="color: #ef476f; margin-top: 0;">📋 Booking Details</h3>
                            
                            <div class="detail-row">
                                <span class="label">Guest Name:</span>
                                <span class="value">${booking.guestName}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Email:</span>
                                <span class="value">${booking.email}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Phone:</span>
                                <span class="value">${booking.phone || 'Not provided'}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Room Type:</span>
                                <span class="value">${booking.roomType}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Check-in:</span>
                                <span class="value">${checkIn.toLocaleDateString('en-US')} (${checkIn.toLocaleDateString('sq-AL')})</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Check-out:</span>
                                <span class="value">${checkOut.toLocaleDateString('en-US')} (${checkOut.toLocaleDateString('sq-AL')})</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Nights:</span>
                                <span class="value">${nights}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Number of Guests:</span>
                                <span class="value">${booking.numberOfGuests}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Booking Source:</span>
                                <span class="value">${sourceIcon} ${source}</span>
                            </div>
                            
                            ${booking.specialRequests ? `
                            <div class="detail-row">
                                <span class="label">Special Requests:</span>
                                <span class="value">${booking.specialRequests}</span>
                            </div>
                            ` : ''}
                            
                            <div class="detail-row">
                                <span class="label">Status:</span>
                                <span class="value" style="color: #ffc107; font-weight: bold;">⏳ ${booking.status}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Booking ID:</span>
                                <span class="value">${booking._id}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Created:</span>
                                <span class="value">${new Date().toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div class="actions">
                            <h4 style="margin-top: 0;">📱 Next Steps</h4>
                            <ol>
                                <li><strong>Log in to Admin Panel</strong> to manage this booking</li>
                                <li><strong>Confirm room availability</strong> for the requested dates</li>
                                <li><strong>Contact the guest</strong> if needed: ${booking.email} ${booking.phone ? `/ ${booking.phone}` : ''}</li>
                                <li><strong>Update booking status</strong> to confirmed or cancelled</li>
                            </ol>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <p><strong>🏔️ Vila Falo Admin Team</strong></p>
                            <p style="font-size: 14px; color: #666;">This is an automated notification from your booking system.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `;

            const mailOptions = {
                from: process.env.EMAIL_FROM || 'Vila Falo <noreply@vilafalo.com>',
                to: process.env.ADMIN_EMAIL,
                subject: `🚨 NEW BOOKING ALERT - ${booking.roomType} | ${sourceIcon} ${source}`,
                html: emailHtml
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Admin notification sent to: ${process.env.ADMIN_EMAIL}`);
        } catch (error) {
            console.error('❌ Error sending admin notification:', error);
        }
    }

    async sendNewsletterConfirmation(email) {
        if (!this.transporter || !process.env.EMAIL_USER) {
            console.log('📧 Email not configured - skipping newsletter confirmation');
            return;
        }

        try {
            const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #06d6a0, #118ab2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏔️ Welcome to Vila Falo!</h1>
                        <p>Newsletter Subscription Confirmed</p>
                    </div>
                    <div class="content">
                        <p>Thank you for subscribing to our newsletter! You'll receive updates about:</p>
                        <ul>
                            <li>🏔️ Special mountain adventure packages</li>
                            <li>🎿 Seasonal activity updates</li>
                            <li>💰 Exclusive offers and discounts</li>
                            <li>🍽️ New restaurant menu items</li>
                        </ul>
                        <p style="text-align: center; margin-top: 30px;">
                            <strong>Vila Falo - Your Mountain Adventure Awaits!</strong>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            `;

            const mailOptions = {
                from: process.env.EMAIL_FROM || 'Vila Falo <noreply@vilafalo.com>',
                to: email,
                subject: '🏔️ Welcome to Vila Falo Newsletter!',
                html: emailHtml
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Newsletter confirmation sent to: ${email}`);
        } catch (error) {
            console.error('❌ Error sending newsletter confirmation:', error);
        }
    }
}

module.exports = new EmailService();
