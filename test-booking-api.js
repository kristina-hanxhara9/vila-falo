#!/usr/bin/env node

/**
 * Comprehensive Booking API Test Script
 * Tests all aspects of the booking endpoint to ensure it works correctly
 */

const API_URL = process.env.API_URL || 'http://localhost:5000';

console.log('\n' + '🧪'.repeat(40));
console.log('🧪 VILA FALO BOOKING API TEST SUITE');
console.log('🧪'.repeat(40));
console.log(`Testing API at: ${API_URL}`);
console.log('');

// Test 1: Test body parser with simple request
async function test1_BodyParser() {
    console.log('📝 TEST 1: Body Parser Test');
    console.log('─'.repeat(80));
    
    try {
        const response = await fetch(`${API_URL}/api/test-body`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                test: 'data',
                hello: 'world',
                number: 123
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ PASSED - Body parser working correctly');
            console.log('   Received body type:', result.bodyType);
            console.log('   Received body keys:', result.bodyKeys);
        } else {
            console.log('❌ FAILED - Body parser not working');
            console.log('   Response:', result);
        }
    } catch (error) {
        console.log('❌ FAILED - Network error');
        console.log('   Error:', error.message);
    }
    
    console.log('');
}

// Test 2: Test booking endpoint body parser
async function test2_BookingBodyParser() {
    console.log('📝 TEST 2: Booking Endpoint Body Parser Test');
    console.log('─'.repeat(80));
    
    try {
        const response = await fetch(`${API_URL}/api/booking/test-body-parser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                testField: 'testValue',
                number: 456
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ PASSED - Booking endpoint body parser working');
            console.log('   Body type:', result.received.bodyType);
            console.log('   Body keys:', result.received.bodyKeys);
        } else {
            console.log('❌ FAILED - Booking endpoint body parser issue');
            console.log('   Response:', result);
        }
    } catch (error) {
        console.log('❌ FAILED - Network error');
        console.log('   Error:', error.message);
    }
    
    console.log('');
}

// Test 3: Test booking with missing fields
async function test3_MissingFields() {
    console.log('📝 TEST 3: Validation Test (Missing Fields)');
    console.log('─'.repeat(80));
    
    try {
        const response = await fetch(`${API_URL}/api/booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                guestName: 'Test User',
                email: 'test@example.com'
                // Missing other required fields
            })
        });
        
        const result = await response.json();
        
        if (!result.success && result.missingFields) {
            console.log('✅ PASSED - Validation working correctly');
            console.log('   Detected missing fields:', result.missingFields);
        } else {
            console.log('❌ FAILED - Validation not working as expected');
            console.log('   Response:', result);
        }
    } catch (error) {
        console.log('❌ FAILED - Network error');
        console.log('   Error:', error.message);
    }
    
    console.log('');
}

// Test 4: Test booking with all required fields
async function test4_ValidBooking() {
    console.log('📝 TEST 4: Valid Booking Creation Test');
    console.log('─'.repeat(80));
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkIn = tomorrow.toISOString().split('T')[0];
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);
    const checkOut = dayAfterTomorrow.toISOString().split('T')[0];
    
    try {
        const bookingData = {
            guestName: 'Test User - API Test',
            email: 'test@vilafalo.com',
            phone: '+355 69 123 4567',
            checkInDate: checkIn,
            checkOutDate: checkOut,
            roomType: 'Standard',
            numberOfGuests: 2,
            specialRequests: 'Test booking from automated test suite',
            source: 'API Test'
        };
        
        console.log('Sending booking data:');
        console.log(JSON.stringify(bookingData, null, 2));
        console.log('');
        
        const response = await fetch(`${API_URL}/api/booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ PASSED - Booking created successfully');
            console.log('   Booking ID:', result.data._id);
            console.log('   Reference:', result.reference);
            console.log('   Guest:', result.data.guestName);
            console.log('   Room:', result.data.roomType);
            console.log('   Total Price:', result.data.totalPrice, 'Lek');
            console.log('   Deposit:', result.data.depositAmount, 'Lek');
            console.log('');
            console.log('⚠️  NOTE: Please delete this test booking from admin panel');
            return result.data._id;
        } else {
            console.log('❌ FAILED - Booking creation failed');
            console.log('   Error message:', result.message);
            console.log('   Full response:', JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.log('❌ FAILED - Network error');
        console.log('   Error:', error.message);
    }
    
    console.log('');
}

// Test 5: Test with different field name formats
async function test5_FieldNameVariations() {
    console.log('📝 TEST 5: Field Name Variations Test');
    console.log('─'.repeat(80));
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkIn = tomorrow.toISOString().split('T')[0];
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);
    const checkOut = dayAfterTomorrow.toISOString().split('T')[0];
    
    try {
        // Test with snake_case field names
        const bookingData = {
            guest_name: 'Test User - Field Name Test',
            email: 'test2@vilafalo.com',
            phone: '+355 69 123 4567',
            check_in_date: checkIn,
            check_out_date: checkOut,
            room_type: 'Standard',
            number_of_guests: 2,
            special_requests: 'Testing snake_case field names',
            source: 'API Test'
        };
        
        console.log('Testing with snake_case field names:');
        console.log(JSON.stringify(bookingData, null, 2));
        console.log('');
        
        const response = await fetch(`${API_URL}/api/booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ PASSED - Field name normalization working');
            console.log('   Booking created with ID:', result.data._id);
            console.log('');
            console.log('⚠️  NOTE: Please delete this test booking from admin panel');
        } else {
            console.log('❌ FAILED - Field name normalization not working');
            console.log('   Error:', result.message);
            console.log('   Missing fields:', result.missingFields);
        }
    } catch (error) {
        console.log('❌ FAILED - Network error');
        console.log('   Error:', error.message);
    }
    
    console.log('');
}

// Test 6: Test availability check
async function test6_AvailabilityCheck() {
    console.log('📝 TEST 6: Availability Check Test');
    console.log('─'.repeat(80));
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkIn = tomorrow.toISOString().split('T')[0];
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);
    const checkOut = dayAfterTomorrow.toISOString().split('T')[0];
    
    try {
        const response = await fetch(
            `${API_URL}/api/booking/availability?checkInDate=${checkIn}&checkOutDate=${checkOut}&roomType=Standard`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ PASSED - Availability check working');
            console.log('   Room type:', result.roomType);
            console.log('   Available:', result.available ? 'Yes' : 'No');
            console.log('   Available rooms:', result.availableRooms);
            console.log('   Total rooms:', result.totalRooms);
        } else {
            console.log('❌ FAILED - Availability check failed');
            console.log('   Response:', result);
        }
    } catch (error) {
        console.log('❌ FAILED - Network error');
        console.log('   Error:', error.message);
    }
    
    console.log('');
}

// Test 7: Test with invalid room type
async function test7_InvalidRoomType() {
    console.log('📝 TEST 7: Invalid Room Type Test');
    console.log('─'.repeat(80));
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkIn = tomorrow.toISOString().split('T')[0];
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);
    const checkOut = dayAfterTomorrow.toISOString().split('T')[0];
    
    try {
        const response = await fetch(`${API_URL}/api/booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                guestName: 'Test User',
                email: 'test@example.com',
                phone: '+355 69 123 4567',
                checkInDate: checkIn,
                checkOutDate: checkOut,
                roomType: 'InvalidRoomType',
                numberOfGuests: 2
            })
        });
        
        const result = await response.json();
        
        if (!result.success && result.message.includes('Invalid room type')) {
            console.log('✅ PASSED - Invalid room type properly rejected');
            console.log('   Error message:', result.message);
        } else {
            console.log('❌ FAILED - Invalid room type not properly validated');
            console.log('   Response:', result);
        }
    } catch (error) {
        console.log('❌ FAILED - Network error');
        console.log('   Error:', error.message);
    }
    
    console.log('');
}

// Run all tests
async function runAllTests() {
    console.log('Starting test suite...\n');
    
    await test1_BodyParser();
    await test2_BookingBodyParser();
    await test3_MissingFields();
    await test4_ValidBooking();
    await test5_FieldNameVariations();
    await test6_AvailabilityCheck();
    await test7_InvalidRoomType();
    
    console.log('🧪'.repeat(40));
    console.log('✅ TEST SUITE COMPLETED');
    console.log('🧪'.repeat(40));
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Review any failed tests above');
    console.log('   2. Check server logs for detailed error messages');
    console.log('   3. Delete test bookings from admin panel');
    console.log('   4. Test with your actual frontend/client');
    console.log('');
}

// Run the tests
runAllTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
});
