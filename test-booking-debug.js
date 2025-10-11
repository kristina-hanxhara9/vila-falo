// Test booking endpoint using Node's built-in http module
require('dotenv').config();
const http = require('http');

const testBooking = async () => {
  console.log('🧪 Testing Booking System');
  console.log('======================================\n');
  
  // Test data
  const bookingData = {
    guestName: 'Test User',
    email: 'test@example.com',
    phone: '+355 68 123 4567',
    checkInDate: '2025-11-01',
    checkOutDate: '2025-11-05',
    roomType: 'Standard',
    numberOfGuests: 2,
    specialRequests: 'Test booking - please ignore',
    source: 'Test'
  };
  
  console.log('📋 Test Booking Data:');
  console.log(JSON.stringify(bookingData, null, 2));
  console.log('\n🔄 Sending request to server...\n');
  
  const postData = JSON.stringify(bookingData);
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/booking',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        
        console.log('📡 Response Status:', res.statusCode);
        console.log('📡 Response Data:');
        console.log(JSON.stringify(result, null, 2));
        console.log('');
        
        if (result.success) {
          console.log('✅ ========================================');
          console.log('✅ SUCCESS! Booking created successfully');
          console.log('✅ ========================================');
          console.log('Booking ID:', result.data._id);
          console.log('Guest Name:', result.data.guestName);
          console.log('Room Type:', result.data.roomType);
          console.log('Check-in:', result.data.checkInDate);
          console.log('Check-out:', result.data.checkOutDate);
          console.log('');
          console.log('💰 PRICING:');
          console.log('Total Price:', result.data.totalPrice, 'Lek');
          console.log('Deposit (50%):', result.depositAmount, 'Lek');
          console.log('On Arrival (50%):', result.remainingAmount, 'Lek');
          console.log('');
          
          if (result.paymentUrl) {
            console.log('💳 Payment URL:', result.paymentUrl);
          } else {
            console.log('⚠️  No payment URL (Paysera not configured)');
            console.log('📞 Guest will be contacted with payment instructions');
          }
        } else {
          console.log('❌ ========================================');
          console.log('❌ FAILED! Error creating booking');
          console.log('❌ ========================================');
          console.log('Error Message:', result.message);
          
          if (result.missingFields) {
            console.log('Missing Fields:', result.missingFields);
          }
          
          if (result.receivedFields) {
            console.log('Received Fields:', result.receivedFields);
          }
          
          if (result.errors) {
            console.log('Validation Errors:', result.errors);
          }
        }
        
        console.log('\n✅ Test completed');
        
      } catch (error) {
        console.error('❌ Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ ========================================');
    console.error('❌ Test failed with connection error');
    console.error('❌ ========================================');
    console.error('Error:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. Server is running: npm start');
    console.error('   2. Server is on port 5000');
    console.error('   3. MongoDB is connected');
  });
  
  req.write(postData);
  req.end();
};

// Run test
console.log('');
console.log('🚀 Starting Booking System Test...');
console.log('');

testBooking();
