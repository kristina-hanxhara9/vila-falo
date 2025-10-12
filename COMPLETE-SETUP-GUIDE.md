# 🏔️ VILA FALO COMPLETE SETUP GUIDE

## Date: October 11, 2025

---

## 📋 TABLE OF CONTENTS
1. [Custom Domain Setup](#custom-domain-setup)
2. [Admin Access Setup](#admin-access-setup)
3. [Booking Logic & Pricing](#booking-logic--pricing)
4. [Breakfast Policy](#breakfast-policy)
5. [Room Inventory](#room-inventory)

---

## 🌐 CUSTOM DOMAIN SETUP

### Current URLs
- **Herokuapp URL**: https://vila-falo-resort-8208afd24e04.herokuapp.com
- **Custom Domain**: vilafalo.com (to be configured)

### Step 1: Add Domain to Heroku

```bash
# Login to Heroku
heroku login

# Navigate to your app directory
cd /Users/kristinahanxhara/vila-falo/vila-falo

# Add your custom domains
heroku domains:add vilafalo.com
heroku domains:add www.vilafalo.com

# Get DNS targets (SAVE THESE!)
heroku domains
```

**Expected Output:**
```
Domain Name          DNS Target
───────────────────  ─────────────────────────────────────
vilafalo.com         mighty-lake-1234.herokudns.com
www.vilafalo.com     mighty-lake-1234.herokudns.com
```

### Step 2: Configure DNS at Your Domain Registrar

Go to where you bought **vilafalo.com** and add these DNS records:

#### For Root Domain (vilafalo.com):
```
Type: ALIAS or ANAME or CNAME (with flattening)
Host: @ (or leave blank)
Value: [paste DNS target from Step 1]
TTL: 3600 or Automatic
```

#### For WWW Subdomain (www.vilafalo.com):
```
Type: CNAME
Host: www
Value: [paste DNS target from Step 1]
TTL: 3600 or Automatic
```

### Step 3: Wait for SSL Certificate (Automatic)

Heroku will automatically provision an SSL certificate for your domain. This usually takes 10-60 minutes after DNS propagates.

```bash
# Check SSL status
heroku certs:auto

# Should show:
# === Automatic Certificate Management is enabled
```

### Step 4: Verify Everything Works

After 10-60 minutes, test your URLs:

```bash
# Test main domain
curl -I https://vilafalo.com

# Test www subdomain
curl -I https://www.vilafalo.com

# Test admin access
curl -I https://vilafalo.com/admin
```

### Your Final Working URLs

Once DNS propagates, these URLs will work:

✅ **Main Website**
- https://vilafalo.com
- https://www.vilafalo.com

✅ **Admin Panel**
- https://vilafalo.com/admin (login page)
- https://vilafalo.com/admintotal (admin dashboard after login)

✅ **Booking**
- https://vilafalo.com/booking.html

✅ **API Endpoints**
- https://vilafalo.com/api/booking
- https://vilafalo.com/api/chatbot/message

**Note:** The old herokuapp URL will continue to work but will be your "backup" URL.

---

## 🔐 ADMIN ACCESS SETUP

### Admin URLs Explained

Your application has TWO admin routes configured:

1. **`/admin`** → Login page (`login.html`)
   - This is where you enter your admin credentials
   - URL: https://vilafalo.com/admin

2. **`/admintotal`** → Admin dashboard (`admin.html`)
   - This is the actual admin panel with all features
   - You're redirected here after successful login
   - URL: https://vilafalo.com/admintotal

### How to Access Admin Panel

**Option 1: Through Login (Recommended)**
1. Go to https://vilafalo.com/admin
2. Enter your credentials
3. Click login
4. You'll be redirected to the admin dashboard

**Option 2: Direct Access (If Already Logged In)**
1. Go directly to https://vilafalo.com/admintotal
2. If you have a valid session, you'll see the dashboard
3. If not logged in, you'll be redirected to login

### Server Configuration

The admin routes are already configured in `server.js`:

```javascript
// Admin Panel Routes
app.get('/admintotal', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
```

### Admin Files Location

All admin files are in `/public/`:
- `/public/admin.html` - Main admin dashboard
- `/public/admin-panel.html` - Alternative admin interface
- `/public/login.html` - Admin login page

---

## 💰 BOOKING LOGIC & PRICING

### Room Inventory & Prices

| Room Type | Albanian Name | Price/Night | Max Guests | Total Rooms | Breakfast |
|-----------|---------------|-------------|------------|-------------|-----------|
| **Standard** | Dhomë Standart Malore | 5000 Lek | 2 | 7 | ✅ Included |
| **Deluxe** | Suitë Familjare Deluxe | 6000 Lek | 4 | 4 | ✅ Included |
| **Premium** | Suitë Premium Panoramike | 7000 Lek | 5 | 1 | ❌ Not Included |

### Price Calculation Formula

```javascript
// Basic formula:
Total Price = Price per Night × Number of Nights × Rooms Booked

// Example:
Standard Room, 3 nights, 1 room:
= 5000 Lek × 3 nights × 1 room
= 15,000 Lek total
```

### Payment Split

All bookings require a 50% deposit:

```javascript
Deposit (Pay Now) = Total Price × 50%
Remaining (Pay on Arrival) = Total Price × 50%

// Example:
Total: 15,000 Lek
Deposit: 7,500 Lek (pay via Paysera)
On Arrival: 7,500 Lek (pay at hotel)
```

### Guest Count Validation

The system validates guest count based on room capacity:

**Standard Room (2 guests max)**
- ✅ Valid: 1-2 guests
- ❌ Invalid: 3+ guests

**Deluxe Suite (4 guests max)**
- ✅ Valid: 1-4 guests
- ❌ Invalid: 5+ guests

**Premium Suite (5 guests max)**
- ✅ Valid: 1-5 guests
- ❌ Invalid: 6+ guests

### What Affects Price

✅ **Price is affected by:**
- Room type selected
- Number of nights
- Number of rooms booked

❌ **Price is NOT affected by:**
- Number of guests (price is per room, not per person)
- Day of week (no weekend surcharge)
- Season (no seasonal pricing)
- Special requests

---

## 🍳 BREAKFAST POLICY

### Current Policy (UPDATED)

**All rooms include breakfast in the base price. There is no additional breakfast charge.**

### Breakfast Inclusion by Room Type

- **Standard Mountain Room (5000 Lek)**: ✅ Breakfast INCLUDED
- **Deluxe Family Suite (6000 Lek)**: ✅ Breakfast INCLUDED  
- **Premium Panorama Suite (7000 Lek)**: ❌ Breakfast NOT INCLUDED

### What's Included in Breakfast

All rooms with included breakfast receive:
- Traditional Albanian breakfast
- Petulla (Albanian fried dough)
- Mountain honey (produced on-site!)
- Homemade jam
- Local cheese
- Village eggs
- Coffee and mountain tea

### Changes Made to Booking Form

The booking form has been updated to:
1. ✅ Show "Breakfast Included: YES" in price summary for Standard and Deluxe
2. ✅ Show "Breakfast NOT Included" for Premium suite
3. ❌ Removed the confusing 700 Lek breakfast addon checkbox
4. ✅ Clarified in info boxes what's included

### Backend Pricing Logic

The backend (bookingRoutes.js) calculates prices as:
- Room price per night (includes breakfast for Standard/Deluxe)
- Number of nights
- Number of rooms
- **NO additional breakfast charges**

---

## 🏨 ROOM INVENTORY

### Backend Configuration (bookingRoutes.js)

```javascript
const ROOM_INVENTORY = {
  'Standard': {
    name: 'Standard Mountain Room',
    albanianName: 'Dhomë Standart Malore',
    price: 5000,
    maxGuests: 2,
    totalRooms: 7,
    breakfast: true  // Included
  },
  'Deluxe': {
    name: 'Deluxe Family Suite',
    albanianName: 'Suitë Familjare Deluxe',
    price: 6000,
    maxGuests: 4,
    totalRooms: 4,
    breakfast: true  // Included
  },
  'Premium': {
    name: 'Premium Panorama Suite',
    albanianName: 'Suitë Premium Panoramike',
    price: 7000,
    maxGuests: 5,
    totalRooms: 1,
    breakfast: false  // NOT Included
  }
};
```

### Frontend Configuration (booking.html)

The booking form dropdown should match backend exactly:
- Standard: 5000 Lek, 2 guests, "with breakfast"
- Deluxe: 6000 Lek, 4 guests, "with breakfast"
- Premium: 7000 Lek, 5 guests, "(breakfast not included)"

---

## 📊 PRICING EXAMPLES

### Example 1: Weekend Getaway (Standard Room)

```
Guest: 2 people
Room: Standard Mountain Room
Dates: Friday to Sunday (2 nights)

Calculation:
5000 Lek/night × 2 nights = 10,000 Lek

Payment:
Deposit (50%): 5,000 Lek
On Arrival: 5,000 Lek

Included:
✅ 2 nights accommodation
✅ Breakfast for 2 people (2 days)
✅ WiFi, parking, all amenities
```

### Example 2: Family Vacation (Deluxe Suite)

```
Guest: 4 people (2 adults, 2 children)
Room: Deluxe Family Suite
Dates: Monday to Friday (4 nights)

Calculation:
6000 Lek/night × 4 nights = 24,000 Lek

Payment:
Deposit (50%): 12,000 Lek
On Arrival: 12,000 Lek

Included:
✅ 4 nights accommodation
✅ Breakfast for 4 people (4 days)
✅ Spacious family room
✅ All amenities
```

### Example 3: Large Family (Premium Suite)

```
Guest: 5 people
Room: Premium Panorama Suite
Dates: Saturday to Wednesday (4 nights)

Calculation:
7000 Lek/night × 4 nights = 28,000 Lek

Payment:
Deposit (50%): 14,000 Lek
On Arrival: 14,000 Lek

Included:
✅ 4 nights accommodation
✅ Panoramic mountain views
✅ Separate living area
✅ Premium amenities

NOT Included:
❌ Breakfast (can be added separately)
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Before Going Live

- [ ] Custom domain DNS configured
- [ ] SSL certificate active
- [ ] Admin login working at vilafalo.com/admin
- [ ] Booking form prices match backend (5000/6000/7000)
- [ ] Breakfast policy clear to customers
- [ ] Payment integration tested (Paysera)
- [ ] Email notifications working
- [ ] All room inventory correct (7/4/1 rooms)

### Testing URLs

After deployment, test these URLs:
- [ ] https://vilafalo.com (homepage)
- [ ] https://vilafalo.com/booking.html (booking form)
- [ ] https://vilafalo.com/admin (admin login)
- [ ] https://vilafalo.com/admintotal (admin dashboard)
- [ ] https://vilafalo.com/api/booking/availability (API)

---

## 📞 SUPPORT

### Common Issues

**Q: Admin page shows 404**
A: Make sure you're using `/admin` (for login) or `/admintotal` (for dashboard)

**Q: Can't access admin at vilafalo.com/admin**
A: Check DNS propagation and SSL certificate status

**Q: Prices don't match**
A: booking.html must match ROOM_INVENTORY in bookingRoutes.js exactly

**Q: Breakfast addon shows in form**
A: This has been removed - breakfast is included in base price for Standard/Deluxe

### Contact

For questions about this setup:
- Check server logs: `heroku logs --tail`
- Verify environment: `heroku config`
- Test health: https://vilafalo.com/health

---

**Last Updated:** October 11, 2025  
**Status:** ✅ Complete - Ready for Deployment
