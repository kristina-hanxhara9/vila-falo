# 🔐 PAYSERA SETUP - COMPLETE STEP-BY-STEP GUIDE

## What is Paysera?

Paysera is a European payment processor that allows you to accept online payments. For Vila Falo, it will enable guests to pay their 50% deposit online when booking.

---

## ✅ STEP-BY-STEP PAYSERA SETUP

### Step 1: Create Paysera Account

1. **Go to Paysera website:**
   - Visit: https://www.paysera.com/v2/en-GB/index

2. **Click "Sign Up" or "Register"**
   - Look for the registration button (usually top right)

3. **Choose account type:**
   - Select **"Business Account"** or **"Merchant Account"**
   - This is NOT a personal account

4. **Fill in your business details:**
   ```
   Company Name: Vila Falo Resort (or your registered business name)
   Country: Albania
   Email: your-business-email@vilafalo.com
   Phone: +355 XX XXX XXXX
   ```

5. **Complete registration:**
   - Verify your email address
   - Complete identity verification (KYC)
   - This may require uploading business documents

### Step 2: Create Payment Project

1. **Log in to Paysera Dashboard**
   - Go to: https://bank.paysera.com

2. **Navigate to "Services" or "Payment Services"**
   - Look for "Payment Gateway" or "E-commerce"

3. **Click "Create New Project" or "Add Website"**

4. **Fill in project details:**
   ```
   Project Name: Vila Falo Bookings
   Website URL: https://vilafalo.com
   Description: Hotel booking system for Vila Falo Resort
   Currency: ALL (Albanian Lek)
   ```

5. **Select payment methods:**
   - Credit/Debit Cards ✅
   - Bank Transfer ✅
   - Paysera Wallet ✅
   - (Select all that you want to offer)

### Step 3: Get Your Credentials

After creating the project, you'll get:

1. **Project ID (projectid)**
   - This is a number like: 123456
   - You'll see it in the project settings

2. **Sign Password (sign password)**
   - This is a secret string for signing payments
   - Look for "Sign Password" or "Security Settings"
   - **Keep this SECRET! Never share it publicly**

Example of what you'll see:
```
Project ID: 123456
Sign Password: abc123def456ghi789
```

### Step 4: Configure Return URLs

In your Paysera project settings, configure:

1. **Success URL (accepturl):**
   ```
   https://vilafalo.com/payment/success
   ```

2. **Cancel URL (cancelurl):**
   ```
   https://vilafalo.com/payment/cancel
   ```

3. **Callback URL (callbackurl):**
   ```
   https://vilafalo.com/api/payment/callback
   ```

These URLs are ALREADY configured in your code - just make sure Paysera knows about them!

### Step 5: Configure Heroku Environment Variables

Once you have your credentials, set them in Heroku:

```bash
# Set your Paysera Project ID
heroku config:set PAYSERA_PROJECT_ID=123456

# Set your Paysera Sign Password (replace with your actual password)
heroku config:set PAYSERA_SIGN_PASSWORD=abc123def456ghi789

# Set to false for production (true for testing)
heroku config:set PAYSERA_TEST_MODE=false

# Set your app URL
heroku config:set APP_URL=https://vilafalo.com
```

**IMPORTANT:** Replace `123456` and `abc123def456ghi789` with your ACTUAL credentials from Paysera!

### Step 6: Test Mode (Optional but Recommended)

Before going live, test with test mode:

1. **Enable test mode in Heroku:**
   ```bash
   heroku config:set PAYSERA_TEST_MODE=true
   ```

2. **Create a test booking**
   - The system will use Paysera's test environment
   - Use test card numbers from Paysera documentation
   - No real money will be charged

3. **Verify the flow works:**
   - Booking created ✅
   - Payment URL generated ✅
   - Test payment completes ✅
   - Booking status updates ✅

4. **Switch to production when ready:**
   ```bash
   heroku config:set PAYSERA_TEST_MODE=false
   ```

---

## 📋 QUICK REFERENCE: Where to Find What

| What You Need | Where to Find It |
|---------------|------------------|
| Paysera Dashboard | https://bank.paysera.com |
| Create Account | https://www.paysera.com |
| Project ID | Dashboard → Projects → Your Project → Settings |
| Sign Password | Dashboard → Projects → Your Project → Security Settings |
| Test Cards | Paysera Documentation → Testing |
| Help/Support | support@paysera.com |

---

## 💳 How Payment Flow Works

### With Paysera Configured:

1. **Guest fills booking form** on vilafalo.com
2. **System creates booking** in database
3. **System generates Paysera payment URL**
4. **Guest redirected to Paysera** to pay 50% deposit
5. **Guest pays** using credit card/bank transfer/Paysera wallet
6. **Paysera sends callback** to your server
7. **System updates booking** status to "confirmed" + "paid"
8. **Guest receives confirmation email**
9. **Guest pays remaining 50%** when arriving at Vila Falo

### Without Paysera (Current Setup):

1. **Guest fills booking form** on vilafalo.com
2. **System creates booking** in database  
3. **System shows manual payment instructions**
4. **Admin contacts guest** via email/phone
5. **Guest pays via bank transfer** or other method
6. **Admin manually updates** booking status
7. **Guest pays remaining 50%** on arrival

---

## 🧪 TESTING YOUR PAYSERA INTEGRATION

### Test 1: Check Configuration
```bash
heroku config | grep PAYSERA
```

Should show:
```
PAYSERA_PROJECT_ID=123456
PAYSERA_SIGN_PASSWORD=abc123...
PAYSERA_TEST_MODE=true
```

### Test 2: Create Test Booking

1. Go to: https://vilafalo.com/booking.html
2. Fill in the form
3. Submit booking
4. You should see a payment URL
5. Click the payment URL
6. You should be on Paysera payment page

### Test 3: Complete Test Payment

Use Paysera test cards (from their documentation):
- Card Number: 4111111111111111 (Visa test card)
- Expiry: Any future date
- CVV: 123

### Test 4: Verify Callback

After test payment:
- Check your Heroku logs: `heroku logs --tail`
- Should see callback received
- Booking status should update to "paid"

---

## ❓ FREQUENTLY ASKED QUESTIONS

### Q: Do I need Paysera to accept bookings?
**A:** No! Your system works WITHOUT Paysera. Bookings are created and you can handle payment manually. Paysera just makes online payment easier.

### Q: How much does Paysera cost?
**A:** Check current fees at Paysera website. Usually:
- Transaction fee: ~1.5-2.5% + small fixed fee
- No monthly fees for basic account

### Q: What if guest doesn't complete payment?
**A:** Booking is still created as "pending". You can contact the guest to complete payment or cancel the booking.

### Q: Can I accept other payment methods?
**A:** Yes! Paysera supports:
- Credit/Debit Cards
- Bank Transfers
- Paysera Wallet
- Other European payment methods

### Q: Is it secure?
**A:** Yes! Paysera is PCI-DSS compliant and used by thousands of European businesses.

### Q: What about refunds?
**A:** You can issue refunds through Paysera dashboard. Refund policies are set by you.

---

## 🆘 TROUBLESHOOTING

### Issue: "Paysera not configured" in logs
**Solution:** Set environment variables in Heroku (see Step 5)

### Issue: Payment URL not generated
**Solution:** 
1. Check `heroku config | grep PAYSERA`
2. Verify Project ID and Sign Password are correct
3. Check Heroku logs for error messages

### Issue: Callback not working
**Solution:**
1. Verify callback URL is set in Paysera dashboard
2. Check it matches: `https://vilafalo.com/api/payment/callback`
3. Check Heroku logs when callback should arrive

### Issue: "Invalid signature" error
**Solution:** Your Sign Password is incorrect. Get the correct one from Paysera dashboard.

---

## 📞 SUPPORT

- **Paysera Support:** support@paysera.com
- **Paysera Help Center:** https://www.paysera.com/v2/en-GB/help
- **Your System Logs:** `heroku logs --tail`

---

## ✅ CHECKLIST

Use this checklist to track your Paysera setup:

- [ ] Created Paysera business account
- [ ] Verified email and completed KYC
- [ ] Created payment project in Paysera
- [ ] Got Project ID
- [ ] Got Sign Password
- [ ] Configured return URLs in Paysera
- [ ] Set PAYSERA_PROJECT_ID in Heroku
- [ ] Set PAYSERA_SIGN_PASSWORD in Heroku
- [ ] Set PAYSERA_TEST_MODE=true in Heroku
- [ ] Created test booking
- [ ] Tested payment with test card
- [ ] Verified callback works
- [ ] Switched to production mode
- [ ] Tested with small real payment
- [ ] Ready for production! 🎉

---

**Remember:** Your booking system works PERFECTLY without Paysera! Set it up when you're ready for online payments.
