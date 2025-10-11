# 🚀 DEPLOYMENT GUIDE: Heroku + GoDaddy Domain Setup

## Complete Guide for Vila Falo Resort

---

## 📋 TABLE OF CONTENTS
1. [Prerequisites](#prerequisites)
2. [Installing Dependencies](#installing-dependencies)
3. [Deploying to Heroku](#deploying-to-heroku)
4. [Connecting GoDaddy Domain](#connecting-godaddy-domain)
5. [Configuring Environment Variables](#configuring-environment-variables)
6. [Testing Everything](#testing-everything)
7. [Troubleshooting](#troubleshooting)

---

## PREREQUISITES

Before starting, ensure you have:
- [x] Heroku account (https://heroku.com)
- [x] Heroku CLI installed
- [x] Git installed
- [x] GoDaddy account with vilafalo.com purchased
- [x] MongoDB Atlas account (already configured)
- [x] Paysera account setup (see PAYSERA_SETUP_GUIDE.md)

---

## 1. INSTALLING DEPENDENCIES

### Step 1: Navigate to project directory
```bash
cd /Users/kristinahanxhara/vila-falo/vila-falo
```

### Step 2: Install new dependencies (Socket.io)
```bash
npm install
```

This will install:
- socket.io@^4.7.2 (for real-time admin updates)
- All other existing dependencies

### Step 3: Verify installation
```bash
npm list socket.io
```

You should see: `socket.io@4.7.2`

---

## 2. DEPLOYING TO HEROKU

### Step 1: Login to Heroku
```bash
heroku login
```

This will open your browser for authentication.

### Step 2: Check your existing Heroku app
```bash
heroku apps
```

You should see: `vila-falo-resort-8208afd24e04`

### Step 3: Add Heroku remote (if not already added)
```bash
heroku git:remote -a vila-falo-resort-8208afd24e04
```

### Step 4: Commit all changes
```bash
git add .
git commit -m "Add Paysera payment integration and real-time admin updates"
```

### Step 5: Deploy to Heroku
```bash
git push heroku main
```

Wait for deployment to complete (usually 2-3 minutes).

### Step 6: Verify deployment
```bash
heroku open
```

This opens your app in browser.

### Step 7: Check logs
```bash
heroku logs --tail
```

You should see:
- ✅ MongoDB Connected
- ✅ Server running on port
- No error messages

---

## 3. CONNECTING GODADDY DOMAIN

### Step 1: Get your Heroku app URL
```bash
heroku info -a vila-falo-resort-8208afd24e04
```

Note the "Web URL"

### Step 2: Add custom domain to Heroku
```bash
heroku domains:add vilafalo.com -a vila-falo-resort-8208afd24e04
heroku domains:add www.vilafalo.com -a vila-falo-resort-8208afd24e04
```

You'll get DNS targets like:
```
vilafalo.com -> DNS Target: xxx.herokudns.com
www.vilafalo.com -> DNS Target: yyy.herokudns.com
```

**IMPORTANT**: Save these DNS targets!

### Step 3: Configure DNS in GoDaddy

1. **Login to GoDaddy**
   - Go to https://godaddy.com
   - Login with your account
   - Go to "My Products" → "Domains"
   - Click "DNS" next to vilafalo.com

2. **Add CNAME for root domain**
   - Click "Add" button
   - Type: `CNAME`
   - Name: `@`
   - Value: `vila-falo-resort-8208afd24e04.herokuapp.com`
   - TTL: `600` (or default)
   - Click "Save"

3. **Add CNAME for www subdomain**
   - Click "Add" button
   - Type: `CNAME`
   - Name: `www`
   - Value: `vila-falo-resort-8208afd24e04.herokuapp.com`
   - TTL: `600` (or default)
   - Click "Save"

**Note:** Some registrars don't allow CNAME for root domain (@). If this fails, you can use:
- Type: `A`
- Name: `@`
- Value: Get Heroku IP by running `dig vila-falo-resort-8208afd24e04.herokuapp.com`
- TTL: `600`

### Step 4: Wait for DNS propagation
DNS changes can take 10 minutes to 48 hours. Usually ready in 1-2 hours.

Check status:
```bash
# Check root domain
dig vilafalo.com

# Check www subdomain
dig www.vilafalo.com
```

### Step 5: Enable HTTPS (SSL)
Heroku automatically provides SSL certificates:

```bash
heroku certs:auto:enable -a vila-falo-resort-8208afd24e04
```

Wait 10-20 minutes for SSL certificate to be issued.

### Step 6: Verify SSL
```bash
heroku certs -a vila-falo-resort-8208afd24e04
```

You should see certificates for both:
- vilafalo.com
- www.vilafalo.com

---

## 4. CONFIGURING ENVIRONMENT VARIABLES

### Step 1: Update APP_URL
```bash
heroku config:set APP_URL=https://vilafalo.com -a vila-falo-resort-8208afd24e04
```

### Step 2: Set Paysera credentials
```bash
heroku config:set PAYSERA_PROJECT_ID=your_project_id -a vila-falo-resort-8208afd24e04
heroku config:set PAYSERA_SIGN_PASSWORD=your_sign_password -a vila-falo-resort-8208afd24e04
heroku config:set PAYSERA_TEST_MODE=true -a vila-falo-resort-8208afd24e04
```

### Step 3: Verify all environment variables
```bash
heroku config -a vila-falo-resort-8208afd24e04
```

Should see:
- MONGODB_URI
- APP_URL (https://vilafalo.com)
- ADMIN_EMAIL (vilafalo@gmail.com)
- EMAIL_USER
- EMAIL_PASS
- PAYSERA_PROJECT_ID
- PAYSERA_SIGN_PASSWORD
- PAYSERA_TEST_MODE
- GEMINI_API_KEY
- All other existing variables

### Step 4: Update Paysera callback URLs
In Paysera merchant area, update:
- Callback URL: `https://vilafalo.com/api/payment/callback`
- Success URL: `https://vilafalo.com/payment/success`
- Cancel URL: `https://vilafalo.com/payment/cancel`

### Step 5: Restart app
```bash
heroku restart -a vila-falo-resort-8208afd24e04
```

---

## 5. TESTING EVERYTHING

### Test 1: Website Access
```bash
# Test different URLs
curl -I https://vilafalo.com
curl -I https://www.vilafalo.com
curl -I https://vilafalo.com/health
```

All should return `200 OK`

### Test 2: Admin Panel
1. Open: https://vilafalo.com/admin
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. Check real-time updates work

### Test 3: Booking System
1. Go to: https://vilafalo.com
2. Navigate to booking section
3. Create a test booking
4. Complete payment with test card
5. Check:
   - Email received at vilafalo@gmail.com
   - Admin panel updated in real-time
   - Booking appears in database

### Test 4: Real-Time Updates
1. Open admin panel in one browser
2. Create booking in another browser
3. Admin panel should update automatically without refresh
4. Check browser console for Socket.io connection

### Test 5: Payment Flow
1. Create booking
2. Click pay deposit
3. Redirected to Paysera
4. Use test card: `4111111111111111`
5. Should redirect to success page
6. Check vilafalo@gmail.com for confirmation

---

## 6. TROUBLESHOOTING

### Domain Not Working

**Problem**: vilafalo.com shows error
**Solution**:
```bash
# Check DNS
dig vilafalo.com

# Check Heroku domains
heroku domains -a vila-falo-resort-8208afd24e04

# Check if domain is verified
heroku domains:wait vilafalo.com -a vila-falo-resort-8208afd24e04
```

### SSL Certificate Not Issued

**Problem**: HTTPS doesn't work
**Solution**:
```bash
# Check certificates
heroku certs -a vila-falo-resort-8208afd24e04

# Force refresh
heroku certs:auto:refresh -a vila-falo-resort-8208afd24e04

# Wait 10-20 minutes and check again
```

### Real-Time Updates Not Working

**Problem**: Admin panel doesn't update automatically
**Solution**:
- Check browser console for errors
- Verify Socket.io installed: `npm list socket.io`
- Check server logs: `heroku logs --tail -a vila-falo-resort-8208afd24e04`
- Look for: "👤 New client connected"

### Payment Callback Fails

**Problem**: Payment completes but booking not updated
**Solution**:
- Check Paysera callback URL is correct
- Verify PAYSERA_SIGN_PASSWORD in Heroku config
- Check server logs during payment
- Test signature verification

### Emails Not Sending

**Problem**: No emails received at vilafalo@gmail.com
**Solution**:
```bash
# Check email config
heroku config:get EMAIL_USER -a vila-falo-resort-8208afd24e04
heroku config:get EMAIL_PASS -a vila-falo-resort-8208afd24e04
```

### App Crashes

**Problem**: App won't start
**Solution**:
```bash
# Check logs
heroku logs --tail -a vila-falo-resort-8208afd24e04

# Check dyno status
heroku ps -a vila-falo-resort-8208afd24e04

# Restart app
heroku restart -a vila-falo-resort-8208afd24e04

# If still failing, check config
heroku config -a vila-falo-resort-8208afd24e04
```

---

## 🎯 QUICK DEPLOYMENT CHECKLIST

Use this for future updates:

```bash
# 1. Make changes to code
git add .
git commit -m "Your change description"

# 2. Deploy
git push heroku main

# 3. Check deployment
heroku logs --tail -a vila-falo-resort-8208afd24e04

# 4. Test
curl https://vilafalo.com/health

# 5. Done!
```

---

## 📱 USEFUL COMMANDS

### View logs in real-time
```bash
heroku logs --tail -a vila-falo-resort-8208afd24e04
```

### Open app in browser
```bash
heroku open -a vila-falo-resort-8208afd24e04
```

### Run console commands
```bash
heroku run bash -a vila-falo-resort-8208afd24e04
```

### Check app info
```bash
heroku info -a vila-falo-resort-8208afd24e04
```

### Scale dynos
```bash
heroku ps:scale web=1 -a vila-falo-resort-8208afd24e04
```

### Restart app
```bash
heroku restart -a vila-falo-resort-8208afd24e04
```

---

## 🎉 SUCCESS!

Your Vila Falo Resort website is now live at:
- **Main URL**: https://vilafalo.com
- **Alternative**: https://www.vilafalo.com
- **Admin Panel**: https://vilafalo.com/admin
- **Heroku URL**: https://vila-falo-resort-8208afd24e04.herokuapp.com

Features working:
- ✅ Booking system
- ✅ Payment integration (Paysera)
- ✅ Email notifications to vilafalo@gmail.com
- ✅ Real-time admin panel updates
- ✅ SSL certificate (HTTPS)
- ✅ Custom domain (vilafalo.com)
- ✅ 50% deposit system
- ✅ Albanian Lek (ALL) support

**Your booking system is ready for customers! 🎊**
