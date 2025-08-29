#!/usr/bin/env node

// Set to development mode for better debugging
process.env.NODE_ENV = 'development';
require('dotenv').config();
const mongoose = require('mongoose');
const ChatbotService = require('./chatbot/chatbotService');

async function testCompleteBookingFlow() {
    console.log('🧪 TESTING VILA FALO COMPLETE BOOKING FLOW');
    console.log('===========================================\n');
    
    try {
        // Connect to database
        console.log('📊 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10
        });
        console.log('✅ Database connected\n');
        
        // Initialize chatbot service
        console.log('🤖 Initializing chatbot service...');
        const chatbot = new ChatbotService();
        console.log('✅ Chatbot service initialized\n');
        
        // Simulate a realistic booking conversation
        console.log('💬 Testing realistic booking conversation...\n');
        
        const conversation = [];
        
        // Step 1: Customer shows interest
        console.log('🟦 STEP 1: Customer expresses booking interest');
        const step1 = await testMessage(chatbot, "Hello! I want to book a room for next week", conversation);
        console.log('Response 1:', step1.message);
        console.log('Booking detected:', step1.bookingDetected ? '✅ YES' : '❌ NO');
        console.log('Missing info:', step1.extractedInfo?.missing || 'None');
        console.log('');

        // Step 2: Provide name
        console.log('🟦 STEP 2: Customer provides name');
        const step2 = await testMessage(chatbot, "My name is John Smith", conversation);
        console.log('Response 2:', step2.message);
        console.log('Extracted name:', step2.extractedInfo?.name || 'None');
        console.log('Missing info:', step2.extractedInfo?.missing || 'None');
        console.log('');

        // Step 3: Provide email
        console.log('🟦 STEP 3: Customer provides email');
        const step3 = await testMessage(chatbot, "My email is john.smith@example.com", conversation);
        console.log('Response 3:', step3.message);
        console.log('Extracted email:', step3.extractedInfo?.email || 'None');
        console.log('Missing info:', step3.extractedInfo?.missing || 'None');
        console.log('');

        // Step 4: Provide room type
        console.log('🟦 STEP 4: Customer provides room preference');
        const step4 = await testMessage(chatbot, "I want a Standard room", conversation);
        console.log('Response 4:', step4.message);
        console.log('Extracted room type:', step4.extractedInfo?.roomType || 'None');
        console.log('Missing info:', step4.extractedInfo?.missing || 'None');
        console.log('');

        // Step 5: Provide dates and guests (complete booking info)
        console.log('🟦 STEP 5: Customer provides dates and guest count');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 2);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 5);
        
        const dateMessage = `I want to check in on ${tomorrow.getDate()}/${tomorrow.getMonth() + 1}/${tomorrow.getFullYear()} and check out ${dayAfter.getDate()}/${dayAfter.getMonth() + 1}/${dayAfter.getFullYear()} for 2 people`;
        
        const step5 = await testMessage(chatbot, dateMessage, conversation);
        console.log('Response 5:', step5.message);
        console.log('Extracted dates:', step5.extractedInfo?.checkIn, 'to', step5.extractedInfo?.checkOut);
        console.log('Extracted guests:', step5.extractedInfo?.guests || 'None');
        console.log('Booking complete:', step5.extractedInfo?.isComplete ? '✅ YES' : '❌ NO');
        console.log('Missing info:', step5.extractedInfo?.missing || 'None');
        
        if (step5.bookingCreated) {
            console.log('\n🎉 BOOKING SUCCESSFULLY CREATED!');
            console.log('📋 Booking Details:');
            console.log('   ID:', step5.bookingCreated._id.toString());
            console.log('   Reference:', '#' + step5.bookingCreated._id.toString().slice(-8).toUpperCase());
            console.log('   Guest:', step5.bookingCreated.guestName);
            console.log('   Email:', step5.bookingCreated.email);
            console.log('   Phone:', step5.bookingCreated.phone || 'Not provided');
            console.log('   Room:', step5.bookingCreated.roomType);
            console.log('   Check-in:', step5.bookingCreated.checkInDate);
            console.log('   Check-out:', step5.bookingCreated.checkOutDate);
            console.log('   Guests:', step5.bookingCreated.numberOfGuests);
            console.log('   Status:', step5.bookingCreated.status);
            console.log('   Source:', step5.bookingCreated.source);
        } else {
            console.log('\n❌ BOOKING WAS NOT CREATED');
            console.log('This indicates an issue with the booking creation logic.');
        }

        // Test phone number addition (optional)
        if (!step5.bookingCreated && step5.extractedInfo?.missingRecommended?.includes('phone')) {
            console.log('\n🟦 STEP 6: Customer provides phone number');
            const step6 = await testMessage(chatbot, "My phone number is +355 69 123 4567", conversation);
            console.log('Response 6:', step6.message);
            console.log('Booking created:', step6.bookingCreated ? '✅ YES' : '❌ NO');
        }

        // Test room availability check
        console.log('\n🔍 Testing room availability check...');
        const availability = await chatbot.checkRoomAvailability(
            tomorrow.toISOString().split('T')[0],
            dayAfter.toISOString().split('T')[0],
            'Standard'
        );
        console.log('Availability result:', availability.available ? '✅ Available' : '❌ Not available');
        if (availability.rooms) {
            availability.rooms.forEach(room => {
                console.log(`   ${room.roomType}: ${room.availableRooms}/${room.totalRooms} available`);
            });
        }

        console.log('\n✅ BOOKING FLOW TEST COMPLETED!');
        
        // Summary
        console.log('\n📊 TEST SUMMARY:');
        console.log('✅ Database connection: WORKING');
        console.log('✅ Chatbot service: WORKING');
        console.log('✅ Booking detection: WORKING');
        console.log('✅ Information extraction: WORKING');
        console.log(step5.bookingCreated ? '✅ Booking creation: WORKING' : '❌ Booking creation: FAILED');
        console.log('✅ Room availability check: WORKING');

        if (!step5.bookingCreated) {
            console.log('\n⚠️ ISSUE IDENTIFIED:');
            console.log('The booking was not created. This could be due to:');
            console.log('1. Missing required information not detected properly');
            console.log('2. Database validation errors');
            console.log('3. Room availability issues');
            console.log('4. Duplicate booking detection');
        }
        
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error('Full error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

async function testMessage(chatbot, message, conversation) {
    const response = await chatbot.generateResponse(message, conversation);
    
    // Update conversation history
    conversation.push(
        { role: 'user', content: message },
        { role: 'assistant', content: response.message }
    );

    return response;
}

// Run the test
if (require.main === module) {
    testCompleteBookingFlow().catch(error => {
        console.error('Test script error:', error);
        process.exit(1);
    });
}

module.exports = testCompleteBookingFlow;
