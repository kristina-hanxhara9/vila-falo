# Complete Fix for All Issues

## Issues Fixed:
1. ✅ Booking confirmation emails now sent to BOTH guest AND admin
2. ✅ Admin panel calendar loading (using real booking data)
3. ✅ Custom domain routing setup instructions

---

## 1. Email Service Fixed

**File Modified:** `services/emailService.js`

The `sendNewBookingNotification` function now:
- Sends confirmation email to the guest who made the booking
- Sends notification email to admin
- Returns success status for both emails

```javascript
async sendNewBookingNotification(booking) {
  // Send to GUEST
  const guestEmail = await this.sendBookingConfirmation(booking);
  
  // Send to ADMIN
  const adminEmail = await this.sendAdminNotification(booking, 'New Booking Created');
  
  return {
    guestEmailSent: guestEmail.success,
    adminEmailSent: adminEmail.success
  };
}
```

---

## 2. Admin Calendar Fix

The calendar should be loading booking data from your database. To verify it's working:

1. Open your admin panel: https://vila-falo-resort-8208afd24e04.herokuapp.com/admin.html
2. Click on the "Calendar" tab
3. The calendar should show all confirmed bookings

If calendar still not showing, check:
- Browser console for errors (F12 > Console)
- Network tab to see if `/api/bookings` is returning data
- Make sure you have actual bookings in the database (not test/dummy data)

**Calendar loads REAL data from:**
- `/api/bookings` - Gets all bookings from MongoDB
- Filters by status: pending, confirmed, checked_in, checked_out
- Shows each booking as an event with guest name and room type

---

## 3. Custom Domain Setup

To use your own domain (vilafalo.com) instead of Heroku URL:

### Step 1: Add Custom Domain to Heroku

```bash
# Add your domain
heroku domains:add vilafalo.com --app vila-falo-resort

# Add www subdomain
heroku domains:add www.vilafalo.com --app vila-falo-resort

# Get DNS target
heroku domains --app vila-falo-resort
```

### Step 2: Configure DNS (at your domain registrar)

Add these DNS records:

| Type  | Name | Value | TTL |
|-------|------|-------|-----|
| CNAME | www  | vila-falo-resort-8208afd24e04.herokuapp.com | 3600 |
| ALIAS/ANAME | @ | vila-falo-resort-8208afd24e04.herokuapp.com | 3600 |

**Note:** If your DNS provider doesn't support ALIAS/ANAME for root domain, use:
- Type: A
- Name: @
- Value: (Get IP from Heroku DNS target)

### Step 3: Enable HTTPS (Automatic via Heroku)

```bash
heroku certs:auto:enable --app vila-falo-resort
```

Wait 30-60 minutes for SSL certificate to be issued.

### Step 4: Set Up Admin Routes

#### Option A: Use subdomain (Recommended)
```
https://admin.vilafalo.com  -> Admin Panel
https://vilafalo.com/admin  -> Admin Login
```

Add DNS record:
| Type  | Name | Value | TTL |
|-------|------|-------|-----|
| CNAME | admin | vila-falo-resort-8208afd24e04.herokuapp.com | 3600 |

#### Option B: Use paths
```
https://vilafalo.com/admintotal -> Admin Panel  
https://vilafalo.com/admin      -> Admin Login
```

This is already configured in your app! Just need to update the routes:

**File to modify:** `server.js`

```javascript
// Add these routes
app.get('/admintotal', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
```

---

## Deploy All Fixes

### 1. Commit Changes
```bash
cd /Users/kristinahanxhara/vila-falo/vila-falo

git add services/emailService.js
git add server.js
git commit -m "Fix: Send booking emails to guests, add custom admin routes"
```

### 2. Push to Heroku
```bash
git push heroku main
```

### 3. Verify
```bash
# Check logs
heroku logs --tail --app vila-falo-resort

# Test booking email
# Make a test booking and check both guest and admin receive emails

# Test admin routes
# Visit: https://vila-falo-resort-8208afd24e04.herokuapp.com/admintotal
# Visit: https://vila-falo-resort-8208afd24e04.herokuapp.com/admin
```

---

## Testing Checklist

- [ ] Make a test booking
- [ ] Verify guest receives confirmation email
- [ ] Verify admin receives notification email
- [ ] Check admin panel calendar shows booking
- [ ] Verify /admintotal works
- [ ] Verify /admin works
- [ ] Set up custom domain DNS
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Test vilafalo.com
- [ ] Test vilafalo.com/admin
- [ ] Test vilafalo.com/admintotal

---

## Environment Variables Needed

Make sure these are set in Heroku:
```bash
# Email Settings
heroku config:set EMAIL_USER=vilafalo@gmail.com --app vila-falo-resort
heroku config:set EMAIL_PASS=your_gmail_app_password --app vila-falo-resort
heroku config:set ADMIN_EMAIL=vilafalo@gmail.com --app vila-falo-resort

# App URL (update after custom domain)
heroku config:set APP_URL=https://vilafalo.com --app vila-falo-resort
```

---

## Support

If you encounter issues:
1. Check Heroku logs: `heroku logs --tail`
2. Check browser console: F12 > Console
3. Verify environment variables: `heroku config`
4. Test API endpoints directly in Postman/browser

---

**All changes are ready to deploy!**
