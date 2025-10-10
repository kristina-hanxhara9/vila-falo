# 🚀 QUICK START - Vila Falo Stripe Integration

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Stripe Keys
- Go to: https://dashboard.stripe.com/test/apikeys
- Copy **Publishable key** (pk_test_...)
- Copy **Secret key** (sk_test_...)

### 3. Run Setup Script
```bash
chmod +x setup-stripe.sh
./setup-stripe.sh
```

OR manually update `.env`:
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
```

### 4. Update booking.html
Replace in `public/booking.html`:
```javascript
const stripe = Stripe('pk_test_YOUR_ACTUAL_KEY');
```

### 5. Test Locally
```bash
npm run dev
```
Go to: http://localhost:5000/booking.html

Use test card: **4242 4242 4242 4242**

### 6. Deploy to Heroku
```bash
git add .
git commit -m "Added Stripe payments"
git push heroku main

# Set environment variables
heroku config:set STRIPE_SECRET_KEY=sk_test_YOUR_KEY
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
```

---

## 🌐 Add vilafalo.com Domain

### 1. Add to Heroku
```bash
heroku domains:add vilafalo.com
heroku domains:add www.vilafalo.com
heroku domains
```

### 2. Update GoDaddy DNS

Login to GoDaddy > DNS Management > Add:

**Type:** CNAME  
**Name:** @  
**Value:** (copy from heroku domains output)  
**TTL:** 600

**Type:** CNAME  
**Name:** www  
**Value:** (copy from heroku domains output)  
**TTL:** 600

### 3. Enable SSL
```bash
heroku certs:auto:enable
```

### 4. Update server.js CORS
```javascript
origin: [
    'https://vila-falo-resort-8208afd24e04.herokuapp.com',
    'https://vilafalo.com',
    'https://www.vilafalo.com'
]
```

### 5. Wait & Test
Wait 10-30 minutes, then visit:
- https://vilafalo.com
- https://www.vilafalo.com

---

## 📧 Email Notifications

**Already configured!** Emails go to: **vilafalo@gmail.com**

Sent when:
- ✅ New booking created
- ✅ Payment successful
- ✅ Status changed
- ✅ Booking cancelled

---

## 🔄 Real-time Admin Updates

**Features:**
- ✅ Auto-refresh every 30 seconds
- ✅ Browser notifications for new bookings
- ✅ Payment status indicators
- ✅ Deposit & remaining amount tracking

**Access:**
```
https://vilafalo.com/admin-panel.html

Username: admin
Password: admin123
```

---

## 💳 Test Cards

**Successful:** 4242 4242 4242 4242  
**Declined:** 4000 0000 0000 0002  
**3D Secure:** 4000 0025 0000 3155

More: https://stripe.com/docs/testing

---

## 🔧 Common Commands

```bash
# View logs
heroku logs --tail

# Restart app
heroku restart

# Check config
heroku config

# Set env var
heroku config:set KEY=VALUE

# Check domains
heroku domains

# Enable SSL
heroku certs:auto:enable
```

---

## 📞 Need Help?

Email: vilafalo@gmail.com  
Phone: +355 68 336 9436

Full guide: `STRIPE-DEPLOYMENT-GUIDE.md`

---

## ✅ Deployment Checklist

- [ ] npm install
- [ ] Stripe keys in .env
- [ ] Test locally
- [ ] booking.html updated
- [ ] git commit & push
- [ ] heroku config set
- [ ] GoDaddy DNS configured
- [ ] SSL enabled
- [ ] Test production
- [ ] Verify emails work

🎉 **Done!** Your booking system is live!
