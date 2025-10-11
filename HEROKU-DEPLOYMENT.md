# 🚀 VILA FALO - HEROKU DEPLOYMENT GUIDE

## ✅ ALL UPDATES ARE READY FOR HEROKU

---

## 🔧 WHAT WAS FIXED

### 1. **Nodemailer Issue** ✅
- **Problem:** `nodemailer.createTransporter is not a function`
- **Fix:** Updated `emailService.js` to be more defensive and handle initialization gracefully
- **Result:** Email service now works or gracefully disables if credentials missing

### 2. **Chatbot Service** ✅
- **Updated:** Removed email service dependency from chatbot
- **Result:** Chatbot can now initialize independently
- **Benefit:** Works on Heroku without email issues blocking it

### 3. **Room Configuration** ✅
- All room information updated correctly
- Works both locally and on Heroku

---

## 🚀 DEPLOY TO HEROKU (3 Options)

### **Option 1: Quick Deploy (Recommended)**

```bash
# 1. Fix dependencies
chmod +x fix-heroku.sh
./fix-heroku.sh

# 2. Commit and deploy
git commit -m "Fix nodemailer, update chatbot with Gemini API and correct room info"
git push heroku main

# 3. Check logs
heroku logs --tail
```

### **Option 2: Manual Deploy**

```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Test locally first
npm start
# (Check http://localhost:5000 works)

# 3. Commit changes
git add .
git commit -m "Fix nodemailer and update system"

# 4. Deploy to Heroku
git push heroku main

# 5. Restart dynos
heroku restart

# 6. Check logs
heroku logs --tail
```

### **Option 3: One-Command Deploy**

```bash
chmod +x fix-heroku.sh && ./fix-heroku.sh && git commit -m "Fix all issues" && git push heroku main && heroku logs --tail
```

---

## 🔍 VERIFY HEROKU DEPLOYMENT

### After Deployment, Check These:

1. **Open Your Heroku App:**
   ```
   heroku open
   ```

2. **Test Chatbot Page:**
   ```
   https://your-app.herokuapp.com/chatbot-test-live.html
   ```

3. **Test Booking Form:**
   ```
   https://your-app.herokuapp.com/booking.html
   ```

4. **Check Heroku Logs:**
   ```bash
   heroku logs --tail
   ```

   **Look for these success messages:**
   - `✅ Chatbot service initialized successfully`
   - `✅ MongoDB Connected`
   - `✅ Email service initialized successfully` (or warning if disabled)
   - `🚀 Vila Falo Resort running on port XXXX`

---

## ⚙️ HEROKU ENVIRONMENT VARIABLES

### Make sure these are set on Heroku:

```bash
# View current config
heroku config

# Set if missing:
heroku config:set GEMINI_API_KEY=AIzaSy...
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set EMAIL_USER=vilafalo@gmail.com
heroku config:set EMAIL_PASS=your_app_password
heroku config:set ADMIN_EMAIL=vilafalo@gmail.com
heroku config:set NODE_ENV=production
```

**Critical ones:**
- ✅ `GEMINI_API_KEY` - For chatbot
- ✅ `MONGODB_URI` - For database
- ✅ `EMAIL_USER` and `EMAIL_PASS` - For email notifications (optional)

---

## 📊 WHAT'S INCLUDED IN DEPLOYMENT

### Files Being Deployed:
- ✅ `chatbot/chatbotService.js` - Gemini API integration
- ✅ `routes/bookingRoutes.js` - Room availability system
- ✅ `public/booking.html` - Updated booking form
- ✅ `services/emailService.js` - Fixed email service
- ✅ `models/Booking.js` - Database schema
- ✅ All configuration files

### Features:
- ✅ Chatbot with Gemini API (gemini-2.0-flash)
- ✅ Correct room info (Standard, Premium, Deluxe)
- ✅ Correct pricing (5000, 7000, 8000 Lek)
- ✅ 12 rooms total (7, 4, 1)
- ✅ Breakfast included in all prices
- ✅ 50/50 payment split
- ✅ Real-time availability checking
- ✅ Overbooking prevention

---

## 🐛 TROUBLESHOOTING HEROKU

### Issue: Heroku build fails
```bash
# Check build logs
heroku logs --tail

# Common fix: Clear cache
heroku repo:purge_cache -a your-app-name
git commit --allow-empty -m "Rebuild"
git push heroku main
```

### Issue: Chatbot not responding on Heroku
```bash
# Check if GEMINI_API_KEY is set
heroku config:get GEMINI_API_KEY

# Set it if missing
heroku config:set GEMINI_API_KEY=AIzaSy...

# Restart
heroku restart
```

### Issue: Database connection fails
```bash
# Check MongoDB URI
heroku config:get MONGODB_URI

# Update if needed
heroku config:set MONGODB_URI=mongodb+srv://...
```

### Issue: Email errors
The email service is now optional and won't block the app if credentials are missing. If you see email warnings in logs:
```bash
⚠️ Email credentials not configured. Email service will be disabled.
```
This is OK - the app will work without emails. To enable:
```bash
heroku config:set EMAIL_USER=vilafalo@gmail.com
heroku config:set EMAIL_PASS=your_gmail_app_password
```

---

## 📱 TESTING ON HEROKU

### After Deployment:

1. **Test Main Site:**
   ```
   https://vila-falo-resort-8208afd24e04.herokuapp.com
   ```

2. **Test Chatbot:**
   - Open chatbot on main site
   - Ask: "Sa kushton një dhomë?"
   - Should respond with prices: 5000, 7000, 8000 Lek
   - Should mention breakfast included
   - Should mention 50% deposit

3. **Test Booking:**
   - Go to: `https://your-app.herokuapp.com/booking.html`
   - Select dates
   - Choose room type
   - Should see availability indicator
   - Should see price breakdown (50/50)

4. **Check Admin Panel:**
   - Go to: `https://your-app.herokuapp.com/admin.html`
   - Login with admin credentials
   - Should see dashboard

---

## 🔐 SECURITY NOTES FOR HEROKU

### Environment Variables (Already Set):
- `JWT_SECRET` - For authentication
- `GEMINI_API_KEY` - For chatbot
- `MONGODB_URI` - Database connection
- `EMAIL_USER`, `EMAIL_PASS` - Email service

**Never commit these to Git!** They're in `.env` locally and Heroku config remotely.

---

## 📈 HEROKU LOGS MONITORING

### View Logs:
```bash
# Live tail
heroku logs --tail

# Last 100 lines
heroku logs -n 100

# Filter for errors
heroku logs --tail | grep ERROR
```

### What to Look For:
- ✅ `✅ MongoDB Connected`
- ✅ `✅ Chatbot service initialized`
- ✅ `🚀 Vila Falo Resort running`
- ⚠️ `⚠️ Email service disabled` (OK if you haven't set email creds)
- ❌ Any `❌` or `ERROR` messages

---

## 🎯 POST-DEPLOYMENT CHECKLIST

After deploying to Heroku:

- [ ] App opens without errors
- [ ] Chatbot responds correctly
- [ ] Booking form loads
- [ ] Prices are correct (5000, 7000, 8000)
- [ ] Availability checking works
- [ ] Payment split shows 50/50
- [ ] Admin panel accessible
- [ ] No critical errors in logs

---

## 🔄 UPDATE HEROKU APP

### For Future Updates:

```bash
# Make changes locally
# Test locally: npm start

# Deploy to Heroku
git add .
git commit -m "Description of changes"
git push heroku main

# Check result
heroku open
heroku logs --tail
```

---

## 💡 HEROKU COMMANDS CHEAT SHEET

```bash
# Deploy
git push heroku main

# Open app
heroku open

# View logs
heroku logs --tail

# Restart app
heroku restart

# Check config
heroku config

# Set config variable
heroku config:set KEY=VALUE

# Run bash on Heroku
heroku run bash

# Check dynos
heroku ps

# Scale dynos
heroku ps:scale web=1
```

---

## ✅ YOUR APP URLS

### After Deployment:

**Main Website:**
```
https://vila-falo-resort-8208afd24e04.herokuapp.com
```

**Chatbot Test:**
```
https://vila-falo-resort-8208afd24e04.herokuapp.com/chatbot-test-live.html
```

**Booking Form:**
```
https://vila-falo-resort-8208afd24e04.herokuapp.com/booking.html
```

**Admin Panel:**
```
https://vila-falo-resort-8208afd24e04.herokuapp.com/admin.html
```

---

## 🎉 DEPLOYMENT READY!

### Quick Deploy Now:

```bash
cd /Users/kristinahanxhara/vila-falo/vila-falo
chmod +x fix-heroku.sh
./fix-heroku.sh
git commit -m "Fix nodemailer and deploy updates"
git push heroku main
```

Then visit your Heroku app and test!

---

**Last Updated:** October 11, 2025
**Status:** ✅ Ready for Heroku deployment
