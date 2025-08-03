# Vila Falo - Email & Chatbot Booking Setup

## 🎉 New Features Added

### 📧 Email Service
- **Automatic booking confirmations** sent to customers
- **Admin notifications** for new bookings
- **Beautiful HTML email templates** in Albanian
- **Update notifications** when booking status changes

### 🤖 Chatbot Booking System
- **Smart booking creation** directly through chat
- **Natural language processing** to extract booking information
- **Automatic availability checking** before booking
- **Seamless integration** with existing booking system

## 🚀 Quick Setup

### 1. Email Configuration

Update your `.env` file with your email credentials:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Vila Falo <noreply@vilafalo.com>
ADMIN_EMAIL=admin@vilafalo.com
```

#### For Gmail Users:
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use the generated 16-character password as `EMAIL_PASS`

#### For Other Email Providers:
- **Outlook/Hotmail**: `smtp-mail.outlook.com`, port 587
- **Yahoo**: `smtp.mail.yahoo.com`, port 587
- **Custom SMTP**: Contact your email provider for settings

### 2. Restart the Server

```bash
npm start
# or
node server.js
```

## 📋 How It Works

### Email Notifications

#### Customer Emails
- 📬 **Booking Confirmation**: Sent immediately when booking is created
- 📝 **Booking Updates**: Sent when status changes (pending → confirmed, etc.)
- 🎨 **Beautiful Templates**: Professional HTML emails with Vila Falo branding

#### Admin Notifications
- 🚨 **New Booking Alert**: Instant notification with all booking details
- 🏷️ **Source Tracking**: Shows if booking came from Website or Chatbot
- 📊 **Quick Actions**: Direct links to admin panel

### Chatbot Booking Process

The chatbot can now create bookings by extracting information from natural conversations:

#### Required Information:
- ✅ Guest name
- ✅ Email address
- ✅ Room type (Standard/Deluxe/Suite)
- ✅ Check-in date
- ✅ Check-out date
- ✅ Number of guests

#### Optional Information:
- 📞 Phone number
- 📝 Special requests

#### Example Conversation:
```
Customer: "I want to book a deluxe room for 2 people"
Chatbot: "I'd be happy to help you book a Deluxe room! May I have your name please?"

Customer: "My name is John Smith"
Chatbot: "Thank you John! What dates would you like to stay?"

Customer: "January 15 to January 18, email is john@email.com"
Chatbot: "Perfect! Let me create your booking..."
[Booking automatically created]
```

## 🛠️ Admin Panel Enhancements

### New Features:
- 🏷️ **Source badges** showing booking origin (Website/Chatbot)
- 📊 **Enhanced booking details** with source information
- 🤖 **Visual indicators** for chatbot-created bookings

### Admin Panel URLs:
- **Modern Panel**: `http://localhost:5000/admin-panel`
- **Full Dashboard**: `http://localhost:5000/admin.html`

## 🔧 Troubleshooting

### Email Issues

#### "Authentication failed"
- ✅ Check EMAIL_USER and EMAIL_PASS are correct
- ✅ For Gmail, ensure you're using an App Password (not your regular password)
- ✅ Enable "Less secure app access" if not using App Password

#### "Connection timeout"
- ✅ Check EMAIL_HOST and EMAIL_PORT
- ✅ Verify your firewall allows outbound SMTP connections
- ✅ Try different ports (25, 465, 587)

#### Emails not received
- ✅ Check spam/junk folders
- ✅ Verify EMAIL_FROM address
- ✅ Test with different email providers

### Chatbot Issues

#### Booking not created
- ✅ Check server logs for error details
- ✅ Ensure all required fields are provided
- ✅ Verify dates are valid and in the future
- ✅ Check room availability for selected dates

#### Information not extracted
- ✅ Chatbot uses pattern matching - be specific
- ✅ Use clear date formats (DD/MM/YYYY)
- ✅ Mention room types explicitly (Standard, Deluxe, Suite)

## 📝 Email Templates

The system includes professionally designed email templates:

### Customer Confirmation Email:
- 🎨 Vila Falo branded header
- 📋 Complete booking details
- 📞 Contact information
- 🏔️ Information about resort amenities
- 📱 Mobile-responsive design

### Admin Notification Email:
- 🚨 Eye-catching alert design
- 📊 Comprehensive booking information
- 🏷️ Source identification
- 🔗 Quick links to admin panel
- ⚡ Action buttons for immediate management

## 🌟 Features Summary

### ✅ Working Features:
- 📧 Email confirmations for all bookings
- 🤖 Chatbot booking creation
- 🏷️ Source tracking (Website vs Chatbot)
- 📊 Enhanced admin panels
- 🎨 Professional email templates
- 📱 Mobile-responsive emails
- 🔔 Admin notifications
- ✨ Automatic availability checking

### 🔄 Integration Points:
- 🗄️ Booking model updated with source field
- 🛣️ Booking routes enhanced with email sending
- 🤖 Chatbot service with booking creation
- 📧 Complete email service with templates
- 🎨 Admin panels updated with source display

## 📞 Support

If you encounter any issues:
1. Check the server logs for error messages
2. Verify your `.env` configuration
3. Test email settings with a simple test
4. Ensure the database is connected
5. Check that all required npm packages are installed

## 🎯 Next Steps

Consider adding:
- 📊 Email analytics and tracking
- 🔔 SMS notifications
- 💳 Payment integration with email receipts
- 📅 Calendar integration
- 🌐 Multi-language email templates
- 📈 Booking analytics dashboard

---

🏔️ **Vila Falo - Mountain Resort Management System**
*Providing exceptional guest experiences with modern technology*
