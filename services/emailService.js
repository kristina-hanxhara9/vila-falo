const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.isConfigured = false;
        this.initializeTransporter();
    }

    async initializeTransporter() {
        try {
            const emailPassword = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
            const isProduction = process.env.NODE_ENV === 'production';
            
            if (!isProduction) {
                console.log('🔧 Initializing email service...');
                console.log('📧 Email User:', process.env.EMAIL_USER);
                console.log('🔐 Password configured:', emailPassword ? 'Yes' : 'No');
                console.log('📮 Admin Email:', process.env.ADMIN_EMAIL);
            }
            
            // Configure email transporter
            this.transporter = nodemailer.createTransporter({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: process.env.EMAIL_SECURE === 'true', // false for 587, true for 465
                auth: {
                    user: process.env.EMAIL_USER || 'vilafalo@gmail.com',
                    pass: emailPassword
                },
                tls: {
                    rejectUnauthorized: false
                },
                debug: !isProduction // Only debug in development
            });

            // Verify connection
            if (process.env.EMAIL_USER && emailPassword) {
                try {
                    await this.transporter.verify();
                    this.isConfigured = true;
                    console.log('✅ Email service initialized and verified successfully');
                    if (!isProduction) {
                        console.log('📬 Ready to send booking confirmations and admin notifications');
                    }
                } catch (verifyError) {
                    console.error('❌ Email verification failed:', verifyError.message);
                    if (!isProduction) {
                        console.error('📧 SMTP Error Details:', {
                            code: verifyError.code,
                            command: verifyError.command,
                            response: verifyError.response,
                            responseCode: verifyError.responseCode
                        });
                    }
                    console.log('⚠️ Will attempt to send emails without verification');
                    this.isConfigured = false;
                }
            } else {
                console.log('⚠️ Email credentials not configured properly');
                if (!isProduction) {
                    console.log('Required: EMAIL_USER and EMAIL_PASS (or GMAIL_APP_PASSWORD)');
                    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
                    console.log('EMAIL_PASS:', emailPassword ? 'Set' : 'Missing');
                }
                this.isConfigured = false;
            }
        } catch (error) {
            console.error('❌ Email service initialization failed:', error.message);
            if (process.env.NODE_ENV !== 'production') {
                console.error('Full error:', error);
            }
            this.isConfigured = false;
        }
    }

    async sendBookingConfirmation(booking) {
        const emailPassword = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
        const isProduction = process.env.NODE_ENV === 'production';
        
        if (!this.transporter || !process.env.EMAIL_USER || !emailPassword) {
            if (!isProduction) {
                console.log('📧 Email not configured - skipping confirmation email');
                console.log('Transporter:', !!this.transporter);
                console.log('Email User:', !!process.env.EMAIL_USER);
                console.log('Email Password:', !!emailPassword);
            }
            return false;
        }
        
        if (!isProduction) {
            console.log('📧 Attempting to send booking confirmation to:', booking.email);
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
                                <span class="label">Booking ID:</span>
                                <span class="value">#${booking._id.toString().slice(-8).toUpperCase()}</span>
                            </div>
                            
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
                from: process.env.EMAIL_FROM || '"Vila Falo Resort" <vilafalo@gmail.com>',
                to: booking.email,
                subject: `🏔️ Konfirmim Rezervimi #${booking._id.toString().slice(-8).toUpperCase()} - Vila Falo`,
                html: emailHtml
            };

            const result = await this.transporter.sendMail(mailOptions);
            if (!isProduction) {
                console.log(`✅ Confirmation email sent successfully to: ${booking.email}`);
                console.log('Message ID:', result.messageId);
            }
            return true;
        } catch (error) {
            console.error('❌ Error sending confirmation email:', error.message);
            if (!isProduction) {
                console.error('Email details:', error.response || error.message);
            }
            return false;
        }
    }

    async sendAdminNotification(booking) {
        const emailPassword = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
        const isProduction = process.env.NODE_ENV === 'production';
        
        if (!this.transporter || !process.env.EMAIL_USER || !emailPassword || !process.env.ADMIN_EMAIL) {
            if (!isProduction) {
                console.log('📧 Admin email not configured - skipping notification');
                console.log('Transporter:', !!this.transporter);
                console.log('Email User:', !!process.env.EMAIL_USER);
                console.log('Email Password:', !!emailPassword);
                console.log('Admin Email:', !!process.env.ADMIN_EMAIL);
            }
            return false;
        }
        
        if (!isProduction) {
            console.log('📧 Attempting to send admin notification to:', process.env.ADMIN_EMAIL);
        }

        try {
            const checkIn = new Date(booking.checkInDate);
            const checkOut = new Date(booking.checkOutDate);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            const source = booking.source || 'Website';
            const sourceIcon = source === 'Chatbot' ? '🤖' : '🌐';
            const bookingId = booking._id.toString().slice(-8).toUpperCase();
            
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
                        <p>${sourceIcon} ${source} | ID: #${bookingId}</p>
                    </div>
                    
                    <div class="content">
                        <div class="urgent">
                            <strong>⚡ URGENT: New ${source} booking requires attention!</strong><br>
                            A booking has been submitted and needs confirmation.
                        </div>
                        
                        <div class="booking-details">
                            <h3 style="color: #ef476f; margin-top: 0;">📋 Booking Details</h3>
                            
                            <div class="detail-row">
                                <span class="label">Booking ID:</span>
                                <span class="value">#${bookingId}</span>
                            </div>
                            
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
                from: process.env.EMAIL_FROM || '"Vila Falo Resort" <vilafalo@gmail.com>',
                to: process.env.ADMIN_EMAIL,
                subject: `🚨 NEW BOOKING ALERT #${bookingId} - ${booking.roomType} | ${sourceIcon} ${source}`,
                html: emailHtml
            };

            const result = await this.transporter.sendMail(mailOptions);
            if (!isProduction) {
                console.log(`✅ Admin notification sent successfully to: ${process.env.ADMIN_EMAIL}`);
                console.log('Message ID:', result.messageId);
            }
            return true;
        } catch (error) {
            console.error('❌ Error sending admin notification:', error.message);
            if (!isProduction) {
                console.error('Email details:', error.response || error.message);
            }
            return false;
        }
    }

    async sendNewsletterConfirmation(email) {
        if (!this.transporter || !process.env.EMAIL_USER) {
            console.log('📧 Email not configured - skipping newsletter confirmation');
            return false;
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
                from: process.env.EMAIL_FROM || '"Vila Falo Resort" <vilafalo@gmail.com>',
                to: email,
                subject: '🏔️ Welcome to Vila Falo Newsletter!',
                html: emailHtml
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Newsletter confirmation sent to: ${email}`);
            return true;
        } catch (error) {
            console.error('❌ Error sending newsletter confirmation:', error);
            return false;
        }
    }

    // Method to test email configuration
    async testEmailConfig() {
        console.log('🧪 Testing email configuration...');
        
        if (!this.isConfigured) {
            console.log('❌ Email service not properly configured');
            return false;
        }

        try {
            await this.transporter.verify();
            console.log('✅ Email configuration test passed');
            return true;
        } catch (error) {
            console.error('❌ Email configuration test failed:', error);
            return false;
        }
    }
}

module.exports = new EmailService();
