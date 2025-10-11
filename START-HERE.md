# 🚀 VILA FALO - START HERE!

## ⚡ Quick Start (3 Steps)

### Step 1: Install Dependencies (if not already done)
```bash
npm install
```

### Step 2: Start the Server
```bash
npm start
```

### Step 3: Test Everything
Open these pages in your browser:

1. **Chatbot Test Page:**
   ```
   http://localhost:5000/chatbot-test-live.html
   ```
   - Test Gemini API integration
   - Try sample questions in Albanian & English
   - Verify room information is correct

2. **Booking Form:**
   ```
   http://localhost:5000/booking.html
   ```
   - Test real-time availability checking
   - See price breakdown (50% deposit + 50% arrival)
   - Verify room types and pricing

3. **Main Website:**
   ```
   http://localhost:5000
   ```
   - Full website with chatbot integrated

---

## ✅ What to Check

### ✓ Chatbot (Gemini API)
- [ ] Opens and responds
- [ ] Knows all 3 room types (Standard, Premium, Deluxe)
- [ ] States correct prices (5000, 7000, 8000 Lek)
- [ ] Says breakfast is included
- [ ] Explains 50/50 payment policy
- [ ] Mentions 12 rooms total
- [ ] Works in Albanian and English

### ✓ Booking Form
- [ ] Shows all 3 room types correctly
- [ ] Displays availability indicator
- [ ] Calculates price correctly
- [ ] Shows 50% deposit amount
- [ ] Shows 50% arrival amount
- [ ] Validates guest numbers per room type
- [ ] Prevents overbooking

### ✓ Room Information
- [ ] Standard: 2-3 people, 5000 Lek, 7 rooms
- [ ] Premium: 4 people, 7000 Lek, 4 rooms
- [ ] Deluxe: 4-5 people, 8000 Lek, 1 room
- [ ] Total: 12 rooms
- [ ] Breakfast included in all

---

## 🧪 Run Automated Tests

### Option 1: Quick Verification
```bash
chmod +x verify-system.sh
./verify-system.sh
```

### Option 2: Complete Test Suite
```bash
node test-complete-system.js
```

This tests:
- ✅ Chatbot Gemini API connection
- ✅ Room configuration accuracy
- ✅ Booking availability system
- ✅ Payment calculations (50/50)
- ✅ Overbooking prevention

---

## 📱 Test Scenarios

### Scenario 1: Standard Room Booking
1. Go to booking form
2. Select dates (e.g., today + 7 days to today + 10 days)
3. Choose "Dhomë Standart Malore"
4. Enter 2 guests
5. Check price: Should be 5000 Lek × 3 nights = 15,000 Lek
   - Deposit: 7,500 Lek
   - Arrival: 7,500 Lek

### Scenario 2: Chatbot Questions (Albanian)
Ask the chatbot:
```
"Sa kushton një dhomë për natë?"
```
Expected: Should list all 3 room types with correct prices

### Scenario 3: Chatbot Questions (English)
Ask the chatbot:
```
"How many rooms do you have available?"
```
Expected: Should say 12 rooms total (7 Standard, 4 Premium, 1 Deluxe)

### Scenario 4: Check Overbooking Prevention
1. Open booking form
2. Select dates
3. Choose "Suitë Familjare Deluxe"
4. If already 1 booking exists for those dates, should show "No rooms available"

---

## 🐛 Troubleshooting

### Server won't start?
```bash
# Check if port 5000 is already in use
lsof -i :5000

# Kill the process if needed
kill -9 <PID>

# Or use a different port
PORT=3000 npm start
```

### Chatbot not responding?
1. Check `.env` file has `GEMINI_API_KEY=AIza...`
2. Make sure API key is valid
3. Check server logs for errors
4. Restart server: `npm start`

### Booking form not loading?
1. Make sure server is running
2. Check browser console for errors (F12)
3. Try clearing browser cache

### Database connection issues?
1. Check `.env` has correct `MONGODB_URI`
2. Make sure you have internet connection
3. Verify MongoDB Atlas is accessible

---

## 📊 What Each File Does

```
chatbot/
  chatbotService.js          → Gemini API integration + room info
  
routes/
  bookingRoutes.js           → Availability checking + booking logic
  
public/
  booking.html               → Booking form with prices
  chatbot-test-live.html     → Chatbot test page
  
models/
  Booking.js                 → Database schema
  
test-complete-system.js      → Run all tests
verify-system.sh             → Quick verification
```

---

## 🎯 Success Criteria

Your system is working correctly if:

✅ Chatbot responds with accurate room information
✅ Booking form shows all 3 room types
✅ Prices are correct (5000, 7000, 8000 Lek)
✅ Payment split shows 50% + 50%
✅ Breakfast is mentioned as included
✅ Availability checking prevents overbooking
✅ System knows there are 12 rooms total

---

## 📞 Need Help?

All documentation:
- `SYSTEM-UPDATE-COMPLETE.md` - Full details of all changes
- `QUICK-REFERENCE.md` - Quick lookup guide
- This file - Getting started guide

Test pages:
- http://localhost:5000/chatbot-test-live.html
- http://localhost:5000/booking.html

---

## 🎉 You're Ready!

Everything is set up and ready to use. Just run:

```bash
npm start
```

Then visit the test pages to verify everything works!

**Last Updated:** October 11, 2025
