# 🏦 PAYSERA PAYMENT SETUP GUIDE

## Complete Guide for Vila Falo Resort Payment Integration

---

## 📋 TABLE OF CONTENTS
1. [Creating Paysera Account](#1-creating-paysera-account)
2. [Getting API Credentials](#2-getting-api-credentials)
3. [Testing Payment Integration](#3-testing-payment-integration)
4. [Going Live](#4-going-live)
5. [Environment Variables](#5-environment-variables)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. CREATING PAYSERA ACCOUNT

### Step 1: Sign Up
1. Go to https://www.paysera.com
2. Click "Sign Up" or "Register"
3. Choose "Business Account" (for receiving payments)
4. Fill in your business details:
   - Business name: **Vila Falo Resort**
   - Business address: Your Albanian address
   - Tax ID/Business registration number
   - Contact email: **vilafalo@gmail.com**
   - Phone: **+355 68 336 9436**

### Step 2: Verify Your Account
1. Upload required documents:
   - Business registration certificate
   - ID/Passport of business owner
   - Proof of address
2. Wait for verification (usually 1-3 business days)
3. You'll receive confirmation email when approved

---

## 2. GETTING API CREDENTIALS

### Step 1: Access Merchant Area
1. Log in to https://www.paysera.com
2. Go to **Merchant** > **Projects**
3. Click **"Add New Project"**

### Step 2: Create Payment Project
1. Fill in project details:
   - **Project Name**: Vila Falo Booking System
   - **Website URL**: https://vilafalo.com
   - **Description**: Hotel booking and payment system
   - **Currency**: ALL (Albanian Lek)
   
2. Set callback URL:
   ```
   https://vilafalo.com/api/payment/callback
   ```

3. Set success/cancel URLs:
   - **Success URL**: https://vilafalo.com/payment/success
   - **Cancel URL**: https://vilafalo.com/payment/cancel

### Step 3: Get Your Credentials
After creating the project, you'll see:
- **Project ID**: A number like `123456`
- **Sign Password**: A string like `abc123def456xyz789`

**IMPORTANT**: Save these credentials securely!

---

## 3. TESTING PAYMENT INTEGRATION

### Test Mode Setup
1. In Paysera merchant area, enable **Test Mode** for your project
2. Update your `.env` file:
   ```env
   PAYSERA_PROJECT_ID=your_project_id
   PAYSERA_SIGN_PASSWORD=your_sign_password
   PAYSERA_TEST_MODE=true
   ```

### Test Cards for Payment
Use these test cards in test mode:

**Successful Payment:**
- Card Number: `4111111111111111`
- Expiry: Any future date
- CVV: Any 3 digits

**Failed Payment:**
- Card Number: `4000000000000002`
- Expiry: Any future date
- CVV: Any 3 digits

### Testing Steps
1. Run your local server:
   ```bash
   npm start
   ```

2. Go to booking page and create a test booking

3. Complete payment with test card

4. Check:
   - Email notification received at vilafalo@gmail.com
   - Booking status updated to "confirmed"
   - Payment status updated to "deposit_paid"
   - Admin panel shows real-time update

---

## 4. GOING LIVE

### Before Going Live Checklist
- [x] Test mode works perfectly
- [x] All email notifications working
- [x] Admin panel receiving real-time updates
- [x] Callback URL accessible from internet
- [x] SSL certificate installed (HTTPS)

### Activating Live Mode
1. In Paysera merchant area:
   - Disable **Test Mode**
   - Verify all URLs are correct
   - Check currency is set to ALL

2. Update `.env` on Heroku:
   ```bash
   heroku config:set PAYSERA_TEST_MODE=false
   ```

3. Paysera will review your setup (1-2 days)

4. Once approved, you can accept real payments!

---

## 5. ENVIRONMENT VARIABLES

### Required Variables in `.env`:

```env
# Paysera Configuration
PAYSERA_PROJECT_ID=123456
PAYSERA_SIGN_PASSWORD=your_sign_password_here
PAYSERA_TEST_MODE=true

# Application URL (IMPORTANT!)
APP_URL=https://vilafalo.com

# Admin Email (for notifications)
ADMIN_EMAIL=vilafalo@gmail.com

# Email SMTP (for sending notifications)
EMAIL_USER=vilafalo@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### Setting on Heroku:
```bash
# Set Paysera credentials
heroku config:set PAYSERA_PROJECT_ID=your_project_id
heroku config:set PAYSERA_SIGN_PASSWORD=your_sign_password
heroku config:set PAYSERA_TEST_MODE=true

# Update app URL after domain is connected
heroku config:set APP_URL=https://vilafalo.com

# Verify all settings
heroku config
```

---

## 6. TROUBLESHOOTING

### Payment Not Processing
**Problem**: Payment button doesn't work
**Solution**: 
- Check Paysera credentials are correct
- Verify callback URL is accessible
- Check server logs: `heroku logs --tail`

### Emails Not Sending
**Problem**: No email notifications received
**Solution**:
- Verify EMAIL_USER and EMAIL_PASS in Heroku config
- Check Gmail "Less secure app access" is enabled
- Use Gmail App Password instead of regular password

### Real-Time Updates Not Working
**Problem**: Admin panel doesn't update automatically
**Solution**:
- Check Socket.io is installed: `npm list socket.io`
- Verify WebSocket connection in browser console
- Check CORS settings allow your domain

### Callback Not Working
**Problem**: Paysera callback returns error
**Solution**:
- Ensure callback URL uses HTTPS
- Check signature verification in logs
- Verify PAYSERA_SIGN_PASSWORD is correct

### Test Mode Not Working
**Problem**: Can't test payments
**Solution**:
- Ensure PAYSERA_TEST_MODE=true
- Use correct test card numbers
- Check Paysera account has test mode enabled

---

## 💡 IMPORTANT NOTES

### Albanian Lek (ALL) Currency
- Paysera fully supports ALL currency
- No conversion fees for Albanian customers
- Customers can pay with Albanian bank cards

### Deposit System
- System automatically charges 50% deposit
- Remaining 50% can be paid later
- Both deposit and full payment trigger email notifications

### Security
- Never commit `.env` file to GitHub
- Keep Paysera credentials secret
- Use HTTPS in production
- Verify all callbacks with signature

### Support
- Paysera Support: https://www.paysera.com/v2/en-LT/contacts
- Email: info@paysera.com
- Phone: +370 5 214 3200

---

## 🎉 SUCCESS CHECKLIST

After setup, verify:
- [ ] Paysera account created and verified
- [ ] Project created with correct URLs
- [ ] Credentials added to Heroku
- [ ] Test payment successful
- [ ] Email notifications received
- [ ] Admin panel shows booking
- [ ] Real-time updates working
- [ ] Ready to go live!

---

**Your Payment System is Ready! 🚀**

Customers can now book and pay 50% deposit online, with real-time notifications to vilafalo@gmail.com
