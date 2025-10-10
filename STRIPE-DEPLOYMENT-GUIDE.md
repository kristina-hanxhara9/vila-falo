# 🚀 Vila Falo - Stripe Payment Integration & Deployment Guide

## 📋 Table of Contents
1. [Stripe Setup](#stripe-setup)
2. [Environment Variables](#environment-variables)
3. [Installing Dependencies](#installing-dependencies)
4. [Testing Locally](#testing-locally)
5. [Deploying to Heroku](#deploying-to-heroku)
6. [Adding GoDaddy Domain](#adding-godaddy-domain)
7. [Real-time Admin Updates](#real-time-admin-updates)

---

## 🎯 Stripe Setup

### Step 1: Create Stripe Account
1. Go to https://stripe.com
2. Click "Start now" and create an account
3. Complete business verification

### Step 2: Get API Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_...`)
3. Copy your **Secret key** (starts with `sk_test_...`)
4. **IMPORTANT**: Keep these keys secret!

### Step 3: Set Up Webhook (for production)
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "+ Add endpoint"
3. Set endpoint URL: `https://vilafalo.com/api/booking/webhook`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret (starts with `whsec_...`)

---

## 🔐 Environment Variables

### Update your `.env` file:

```bash
# ==============================================
# VILA FALO - ENVIRONMENT CONFIGURATION
# ==============================================

# ==============================================
# DATABASE CONFIGURATION
# ==============================================
MONGODB_URI=mongodb+srv://kristinazhi97:Deon2020.@falo.nxe5orf.mongodb.net/vilafalo?retryWrites=true&w=majority&appName=Falo

# ==============================================
# SERVER CONFIGURATION
# ==============================================
PORT=5000
NODE_ENV=production

# ==============================================
# SECURITY CONFIGURATION  
# ==============================================
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c0c9b0c43c7e1b7c6f7f6f8f9f1e2d3c4b5a6978899001234567890abcdef1234567890fedcba0987654321

# ==============================================
# STRIPE PAYMENT CONFIGURATION (NEW!)
# ==============================================
# Get these from https://dashboard.stripe.com/test/apikeys
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# ==============================================
# AI CHATBOT CONFIGURATION
# ==============================================
GEMINI_API_KEY=AIzaSyAZlkkhrHpvNXHpwokv9o4W7B9-b2QF_qk

# ==============================================
# ADMIN & EMAIL CONFIGURATION
# ==============================================
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Email configuration for Vila Falo (ALREADY CONFIGURED!)
ADMIN_EMAIL=vilafalo@gmail.com
EMAIL_USER=vilafalo@gmail.com
EMAIL_PASS=rpdr hjzf zpag ofrg
GMAIL_APP_PASSWORD=rpdr hjzf zpag ofrg
EMAIL_FROM=Vila Falo Resort <vilafalo@gmail.com>
EMAIL_FROM_NAME=Vila Falo Resort

# Email SMTP settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# ==============================================
# CONTACT INFORMATION
# ==============================================
VILLA_PHONE=+355 68 336 9436
VILLA_EMAIL=vilafalo@gmail.com
```

---

## 📦 Installing Dependencies

Run these commands in your project directory:

```bash
# Install Stripe and all dependencies
npm install

# Verify Stripe is installed
npm list stripe

# Should show: stripe@17.5.0
```

---

## 🧪 Testing Locally

### 1. Update booking.html with your test keys:

Open `public/booking.html` and replace:
```javascript
const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');
```

With your actual test key:
```javascript
const stripe = Stripe('pk_test_YOUR_ACTUAL_KEY');
```

### 2. Start the server:
```bash
npm run dev
```

### 3. Test the booking flow:
1. Go to http://localhost:5000/booking.html
2. Fill in the booking form
3. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
4. Complete the booking

### 4. Check results:
- ✅ Email should be sent to guest
- ✅ Email should be sent to vilafalo@gmail.com
- ✅ Payment should appear in Stripe Dashboard
- ✅ Booking should appear in admin panel

---

## 🚀 Deploying to Heroku

### Method 1: Using Heroku CLI

```bash
# 1. Login to Heroku
heroku login

# 2. Add all changes
git add .
git commit -m "Added Stripe payment integration"

# 3. Push to Heroku
git push heroku main

# 4. Set environment variables on Heroku
heroku config:set STRIPE_SECRET_KEY=sk_test_YOUR_KEY
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

# 5. Verify deployment
heroku open

# 6. Check logs
heroku logs --tail
```

### Method 2: Via Heroku Dashboard

1. Go to https://dashboard.heroku.com/apps/vila-falo-resort-8208afd24e04
2. Click "Deploy" tab
3. Connect to GitHub repository
4. Enable automatic deploys (optional)
5. Click "Deploy Branch" to deploy manually
6. Go to "Settings" > "Config Vars"
7. Add these variables:
   - `STRIPE_SECRET_KEY`: sk_test_YOUR_KEY
   - `STRIPE_PUBLISHABLE_KEY`: pk_test_YOUR_KEY
   - `STRIPE_WEBHOOK_SECRET`: whsec_YOUR_SECRET

### Important: Update booking.html for production

Before deploying, update the Stripe key in `public/booking.html`:

For **PRODUCTION**, use your **LIVE** keys:
```javascript
const stripe = Stripe('pk_live_YOUR_LIVE_KEY');
```

**NEVER commit live keys to GitHub!** Use environment variables instead.

---

## 🌐 Adding GoDaddy Domain (vilafalo.com)

### Step 1: Add Domain to Heroku

```bash
# Add domain via CLI
heroku domains:add vilafalo.com
heroku domains:add www.vilafalo.com

# Get DNS targets
heroku domains
```

You'll see something like:
```
vilafalo.com           CNAME  ancient-lake-12345.herokudns.com
www.vilafalo.com       CNAME  ancient-lake-12345.herokudns.com
```

### Step 2: Configure DNS in GoDaddy

1. **Login to GoDaddy**
   - Go to https://dcc.godaddy.com/domains
   - Find vilafalo.com and click "DNS"

2. **Add/Update DNS Records**

   **For ROOT domain (vilafalo.com):**
   - Type: `A` or `ALIAS` (if available)
   - Name: `@`
   - Value: Copy from Heroku (or use Heroku IP: check with `dig`)
   - TTL: 600 seconds

   If ALIAS not available, use CNAME forwarding:
   - Type: `CNAME`
   - Name: `@`
   - Value: `ancient-lake-12345.herokudns.com` (your Heroku DNS target)
   
   **For WWW subdomain:**
   - Type: `CNAME`
   - Name: `www`
   - Value: `ancient-lake-12345.herokudns.com` (your Heroku DNS target)
   - TTL: 600 seconds

3. **Remove conflicting records**
   - Delete any existing A records pointing to GoDaddy servers
   - Delete any existing CNAME records for @ or www
   - Keep MX records (for email) if you have any

### Step 3: Add SSL Certificate (Automated with Heroku)

```bash
# Enable automated SSL
heroku certs:auto:enable

# Check SSL status
heroku certs:auto
```

Heroku will automatically provision a free SSL certificate from Let's Encrypt!

### Step 4: Update CORS in server.js

Update your server.js to allow the new domain:

```javascript
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://vila-falo-resort-8208afd24e04.herokuapp.com',
            'https://vilafalo.com',
            'https://www.vilafalo.com'
          ]
        : ['http://localhost:5000', 'http://127.0.0.1:5000'],
    credentials: true
}));
```

### Step 5: Verify Domain Setup

Wait 10-30 minutes for DNS propagation, then check:

```bash
# Check DNS propagation
nslookup vilafalo.com
nslookup www.vilafalo.com

# Test in browser
curl -I https://vilafalo.com
curl -I https://www.vilafalo.com
```

### Step 6: Update Stripe Webhook URL

Go to Stripe Dashboard and update webhook URL to:
```
https://vilafalo.com/api/booking/webhook
```

---

## 🔄 Real-time Admin Updates

### How it works:
1. When a booking is made, the system sends an email to **vilafalo@gmail.com**
2. Admin panel auto-refreshes every 30 seconds to show new bookings
3. Admins receive instant email notifications with all booking details

### Admin Panel Features:
- ✅ Real-time booking list
- ✅ Payment status indicators
- ✅ Email notifications to vilafalo@gmail.com
- ✅ Booking status management
- ✅ Guest contact information

### Accessing Admin Panel:
```
https://vilafalo.com/admin-panel.html

Username: admin
Password: admin123
```

**IMPORTANT**: Change the admin password after first login!

---

## 📧 Email Notifications

### Emails are sent to vilafalo@gmail.com when:
1. ✅ New booking is created
2. ✅ Payment is successful
3. ✅ Booking status changes
4. ✅ Booking is cancelled

### Email includes:
- Guest information
- Booking details (dates, room type, guests)
- Payment information (deposit paid, remaining amount)
- Booking source (Website, Chatbot, etc.)
- Special requests

---

## 🧪 Testing Stripe Payments

### Test Cards (Use in Test Mode):

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Payment Declined:**
- Card: `4000 0000 0000 0002`

**3D Secure Authentication:**
- Card: `4000 0025 0000 3155`

More test cards: https://stripe.com/docs/testing

---

## 📊 Monitoring & Logs

```bash
# View real-time logs
heroku logs --tail

# View specific logs
heroku logs --tail --app vila-falo-resort-8208afd24e04

# View Stripe logs
# Go to https://dashboard.stripe.com/test/logs
```

---

## ✅ Deployment Checklist

- [ ] Stripe account created
- [ ] API keys added to .env
- [ ] Dependencies installed (`npm install`)
- [ ] Tested locally with test cards
- [ ] Updated booking.html with Stripe key
- [ ] Committed changes to git
- [ ] Pushed to Heroku
- [ ] Added Stripe env vars to Heroku
- [ ] Configured GoDaddy DNS
- [ ] Enabled Heroku SSL
- [ ] Updated Stripe webhook URL
- [ ] Tested production booking
- [ ] Verified email notifications work

---

## 🆘 Troubleshooting

### Payment not working:
1. Check Stripe keys are correct
2. Verify webhook secret is set
3. Check Heroku logs: `heroku logs --tail`
4. Verify card details are correct
5. Check Stripe dashboard for errors

### Emails not sending:
1. Verify EMAIL_USER and EMAIL_PASS in Heroku config
2. Check ADMIN_EMAIL is vilafalo@gmail.com
3. Test email service: `npm run test-emails`
4. Check spam folder

### Domain not working:
1. Wait 24-48 hours for DNS propagation
2. Verify DNS records in GoDaddy
3. Check Heroku domains: `heroku domains`
4. Clear browser cache
5. Try incognito mode

---

## 📞 Support

Need help? Contact:
- Email: vilafalo@gmail.com
- Phone: +355 68 336 9436

---

**🎉 Congratulations!** Your Vila Falo booking system is now live with Stripe payments and vilafalo.com domain!
