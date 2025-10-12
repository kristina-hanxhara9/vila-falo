# 📚 VILA FALO BOOKING LOGIC - COMPLETE DOCUMENTATION

## Date: January 22, 2025

---

## 🏨 ROOM INVENTORY & PRICING

### Current Room Configuration

| Room Type | Rooms | Max Guests | Base Price | Breakfast Included? |
|-----------|-------|------------|------------|---------------------|
| **Standard Mountain Room** | 7 | 2 | 5000 Lek/night | ✅ YES |
| **Deluxe Family Suite** | 4 | 4 | 6000 Lek/night | ✅ YES |
| **Premium Panorama Suite** | 1 | 5 | 7000 Lek/night | ❌ NO |

---

## 💰 PRICING LOGIC

### How Prices Are Calculated

```javascript
// Price calculation formula:
TotalPrice = (PricePerNight × NumberOfNights × RoomsBooked)

// Breakdown:
1. Get room type price from ROOM_INVENTORY
2. Calculate number of nights: (CheckOut - CheckIn)
3. Multiply: Price × Nights × Rooms

// Example:
Standard Room, 3 nights, 1 room:
= 5000 Lek × 3 nights × 1 room
= 15,000 Lek total
```

### Deposit & Payment

```javascript
// Payment split:
DepositAmount = TotalPrice × 50% (0.5)
RemainingAmount = TotalPrice × 50%

// Example:
Total: 15,000 Lek
Deposit (50%): 7,500 Lek (pay now)
On arrival (50%): 7,500 Lek (pay at check-in)
```

---

## 🍳 BREAKFAST ADDON - CURRENT ISSUE

### Problem
The form currently shows:
```html
<div class="addon-price">700 Lek <span>per person</span></div>
```

This suggests breakfast costs 700 Lek per person per night, which would be added to the total.

### Solution Needed
Since breakfast is **INCLUDED** in Standard and Deluxe rooms:

**Option 1: Remove Breakfast Addon Completely**
- Delete the breakfast checkbox
- Update room descriptions to say "Breakfast Included"

**Option 2: Update to Informational Only**
- Keep checkbox disabled/checked by default
- Change text to say "Included in price"
- Remove the 700 Lek price

---

## 📊 GUEST COUNT LOGIC

### How Guest Validation Works

```javascript
// From bookingRoutes.js:
const numberOfGuests = parseInt(adults) + parseInt(children);

// Validation:
if (numberOfGuests < 1) {
  return error: "At least 1 guest required"
}

if (numberOfGuests > roomConfig.maxGuests) {
  return error: "Room capacity exceeded"
}
```

### Room Capacity Rules

**Standard Room (2 guests max):**
- ✅ Valid: 1 adult, 2 adults, 1 adult + 1 child
- ❌ Invalid: 3 people (any combination)

**Deluxe Suite (4 guests max):**
- ✅ Valid: 1-4 people (any combination)
- ❌ Invalid: 5+ people

**Premium Suite (5 guests max):**
- ✅ Valid: 1-5 people (any combination)
- ❌ Invalid: 6+ people

---

## 🔢 BOOKING FORM FIELDS

### Required Fields
```javascript
{
  checkInDate: "YYYY-MM-DD",      // Date picker
  checkOutDate: "YYYY-MM-DD",     // Date picker
  guestName: "string",            // Text input
  email: "email@example.com",     // Email input
  roomType: "Standard|Deluxe|Premium", // Dropdown
  numberOfGuests: number,         // Adults + Children
  phone: "string"                 // Tel input (optional but recommended)
}
```

### Optional Fields
```javascript
{
  specialRequests: "string",      // Textarea
  addons: ["breakfast"],          // Checkbox array (currently broken)
  source: "Website"               // Hidden field (auto-set)
}
```

---

## 🔄 BOOKING FLOW

### Step-by-Step Process

**1. User Fills Form**
```
→ Select room type
→ Choose dates (check-in, check-out)
→ Select guests (adults + children)
→ Enter personal info (name, email, phone)
→ Add special requests (optional)
→ Click "Book Your Mountain Escape"
```

**2. Frontend Validation**
```javascript
// Performed by booking-form-fix.js:
✓ All required fields filled
✓ Valid email format
✓ Check-out after check-in
✓ Guest count reasonable
```

**3. Backend Processing**
```javascript
// In bookingRoutes.js:
→ Normalize room type names (handle Albanian/English)
→ Validate guest count vs room capacity
→ Check room availability for dates
→ Calculate pricing (total, deposit, remaining)
→ Save to database
→ Generate payment URL (if Paysera configured)
→ Send confirmation emails
→ Emit real-time Socket.io event
```

**4. Response to User**
```javascript
{
  success: true,
  reference: "#ABCD1234",  // Last 8 chars of booking ID
  totalPrice: 15000,
  depositAmount: 7500,
  remainingAmount: 7500,
  paymentUrl: "https://..."  // If payment configured
}
```

---

## 🧮 PRICING EXAMPLES

### Example 1: Standard Room, 3 Nights, 2 Guests
```
Room Type: Standard Mountain Room
Nights: 3
Guests: 2 (within capacity ✓)
Breakfast: Included in price ✓

Calculation:
5000 Lek/night × 3 nights = 15,000 Lek

Payment:
Deposit (50%): 7,500 Lek
On arrival: 7,500 Lek
```

### Example 2: Deluxe Suite, 5 Nights, 4 Guests
```
Room Type: Deluxe Family Suite
Nights: 5
Guests: 4 (within capacity ✓)
Breakfast: Included in price ✓

Calculation:
6000 Lek/night × 5 nights = 30,000 Lek

Payment:
Deposit (50%): 15,000 Lek
On arrival: 15,000 Lek
```

### Example 3: Premium Suite, 2 Nights, 5 Guests
```
Room Type: Premium Panorama Suite
Nights: 2
Guests: 5 (within capacity ✓)
Breakfast: NOT included ⚠️

Calculation:
7000 Lek/night × 2 nights = 14,000 Lek

Payment:
Deposit (50%): 7,000 Lek
On arrival: 7,000 Lek
```

---

## ❌ WHAT DOESN'T AFFECT PRICE

### Currently NOT Included in Calculations:

1. **Number of Guests**
   - Price is per room, not per person
   - 1 guest or max guests = same price

2. **Breakfast Addon**
   - Currently shown in form but NOT calculated
   - Should be removed or made informational only

3. **Special Requests**
   - Free text field, no pricing impact

4. **Day of Week**
   - No weekend/weekday pricing difference

5. **Season**
   - No seasonal pricing adjustments

---

## 🚨 CURRENT ISSUES TO FIX

### 1. Breakfast Addon Confusion ❌

**Problem:**
```html
<div class="addon-price">700 Lek per person</div>
```

**Impact:**
- Shows price that is NOT charged
- Confuses customers
- Breakfast already included in Standard/Deluxe

**Fix Needed:**
- Remove 700 Lek price display
- Change to "Included in your room rate"
- Or remove addon entirely

### 2. Room Descriptions ⚠️

**Current:** Rooms say "with breakfast" in price badge
**Issue:** Premium Suite says 7000 Lek/night (no mention of breakfast)

**Fix:** Clarify breakfast inclusion:
- Standard: "with breakfast" ✓
- Deluxe: "with breakfast" ✓
- Premium: Add "(breakfast not included)"

---

## 📱 MOBILE CONSIDERATIONS

### Form Behavior on Mobile

```javascript
// Date pickers:
- iOS: Native date picker
- Android: Native date picker
- Desktop: Calendar popup

// Guest selection:
- Dropdowns work on all devices
- Mobile shows native picker wheel

// Room type:
- Dropdown shows all 3 options
- Touch-friendly on mobile
```

---

## 🔒 VALIDATION RULES

### Date Validation
```javascript
✓ Check-in must be today or future
✓ Check-out must be after check-in
✓ Maximum stay: No limit (configurable)
✓ Minimum stay: 1 night
```

### Guest Validation
```javascript
✓ Minimum: 1 guest
✓ Maximum: Depends on room type (2, 4, or 5)
✓ Adults: 1-4 (form dropdown)
✓ Children: 0-3 (form dropdown)
```

### Room Availability
```javascript
✓ Checks for overlapping bookings
✓ Only counts confirmed/pending (not cancelled)
✓ Returns available room count
✓ Prevents overbooking
```

---

## 💡 RECOMMENDATIONS

### Pricing Improvements

1. **Add Seasonal Pricing**
   ```javascript
   const SEASONAL_MULTIPLIERS = {
     'winter': 1.2,  // 20% higher (ski season)
     'summer': 1.0,  // Regular price
     'off-season': 0.8  // 20% lower
   }
   ```

2. **Weekend Pricing**
   ```javascript
   const WEEKEND_MULTIPLIER = 1.15; // 15% higher Fri-Sat
   ```

3. **Long Stay Discounts**
   ```javascript
   if (nights >= 7) discount = 0.1;  // 10% off
   if (nights >= 14) discount = 0.15; // 15% off
   ```

### Form Improvements

1. **Dynamic Pricing Display**
   - Show total as user selects options
   - Update in real-time
   - Show breakdown (room + taxes)

2. **Availability Calendar**
   - Already implemented ✓
   - Show available/unavailable dates
   - Green = available, Red = full

3. **Guest Capacity Helper**
   - Show max guests for selected room
   - Disable guest options beyond capacity
   - Visual indicator (icons showing beds)

---

## 📞 SUPPORT

For questions about:
- **Pricing logic**: See ROOM_INVENTORY in bookingRoutes.js
- **Validation rules**: See checkRoomAvailability() function
- **Form behavior**: See booking-form-fix.js
- **Backend processing**: See POST /api/booking endpoint

---

**Last Updated:** January 22, 2025  
**Status:** ✅ Complete - Ready for breakfast addon fix
