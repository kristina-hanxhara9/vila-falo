#!/usr/bin/env node

// Test the fixed booking system
process.env.NODE_ENV = 'development';
require('dotenv').config();
const mongoose = require('mongoose');
const ChatbotService = require('./chatbot/chatbotService');

async function testFixed() {
    console.log('🧪 TESTING FIXED VILA FALO BOOKING SYSTEM');
    console.log('==========================================\n');
    
    try {
        // Connect to database
        console.log('📊 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ Database connected\n');
        
        // Initialize chatbot service
        console.log('🤖 Initializing chatbot service...');
        const chatbot = new ChatbotService();
        console.log('✅ Chatbot service initialized\n');
        
        // Test with complete booking info in one message
        console.log('🎯 Testing complete booking in one message...');
        
        // Use dates that are definitely in the future (tomorrow + 2 days)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 2); // Day after tomorrow
        const checkout = new Date();
        checkout.setDate(checkout.getDate() + 5); // 5 days from now
        
        const checkinStr = `${tomorrow.getDate()}/${tomorrow.getMonth() + 1}/${tomorrow.getFullYear()}`;
        const checkoutStr = `${checkout.getDate()}/${checkout.getMonth() + 1}/${checkout.getFullYear()}`;
        
        console.log('📅 Using future dates:');
        console.log('   Check-in:', checkinStr, '(' + tomorrow.toISOString().split('T')[0] + ')');
        console.log('   Check-out:', checkoutStr, '(' + checkout.toISOString().split('T')[0] + ')');
        
        const testMessage = `Hello, I want to book a room. My name is John Smith, email is john.smith@example.com, phone is +355 69 123 4567. I want a Standard room from ${checkinStr} to ${checkoutStr} for 2 people.`;
        
        console.log('📝 Test message:', testMessage);
        console.log('\n🔄 Processing...\n');
        
        const response = await chatbot.generateResponse(testMessage, []);
        
        console.log('🤖 Bot Response:');
        console.log(response.message);
        console.log('\n📊 Results:');
        console.log('- Booking detected:', response.bookingDetected ? '✅ YES' : '❌ NO');
        console.log('- Information complete:', response.extractedInfo?.isComplete ? '✅ YES' : '❌ NO');
        console.log('- Missing fields:', response.extractedInfo?.missing || 'None');
        console.log('- Booking created:', response.bookingCreated ? '✅ YES' : '❌ NO');
        
        if (response.bookingCreated) {
            console.log('\n🎉 SUCCESS! Booking Details:');
            console.log('   📋 ID:', response.bookingCreated._id.toString());
            console.log('   🏷️ Reference:', '#' + response.bookingCreated._id.toString().slice(-8).toUpperCase());
            console.log('   👤 Guest:', response.bookingCreated.guestName);
            console.log('   📧 Email:', response.bookingCreated.email);
            console.log('   📞 Phone:', response.bookingCreated.phone);
            console.log('   🏨 Room:', response.bookingCreated.roomType);
            console.log('   📅 Check-in:', response.bookingCreated.checkInDate);
            console.log('   📅 Check-out:', response.bookingCreated.checkOutDate);
            console.log('   👥 Guests:', response.bookingCreated.numberOfGuests);
            console.log('   ✅ Status:', response.bookingCreated.status);
            console.log('   📱 Source:', response.bookingCreated.source);
        } else {
            console.log('\n❌ BOOKING NOT CREATED');
            if (response.extractedInfo) {
                console.log('🔍 Extracted Info Debug:');
                console.log('   Name:', response.extractedInfo.name || '❌ Not found');
                console.log('   Email:', response.extractedInfo.email || '❌ Not found'); 
                console.log('   Phone:', response.extractedInfo.phone || '❌ Not found');
                console.log('   Room:', response.extractedInfo.roomType || '❌ Not found');
                console.log('   Check-in:', response.extractedInfo.checkIn || '❌ Not found');
                console.log('   Check-out:', response.extractedInfo.checkOut || '❌ Not found');
                console.log('   Guests:', response.extractedInfo.guests || '❌ Not found');
            }
        }
        
        // Test step-by-step conversation
        console.log('\n\n🔄 Testing step-by-step conversation...');
        const conversation = [];
        
        console.log('\n1️⃣ Initial booking request');
        const step1 = await testStep(chatbot, "I want to book a room", conversation);
        
        console.log('\n2️⃣ Provide name');
        const step2 = await testStep(chatbot, "My name is Jane Doe", conversation);
        
        console.log('\n3️⃣ Provide email');  
        const step3 = await testStep(chatbot, "jane.doe@email.com", conversation);
        
        console.log('\n4️⃣ Provide phone');
        const step4 = await testStep(chatbot, "+355 69 987 6543", conversation);
        
        console.log('\n5️⃣ Provide room type');
        const step5 = await testStep(chatbot, "Deluxe room please", conversation);
        
        console.log('\n6️⃣ Provide dates and guests');
        // Use future dates for step-by-step test (1 week from now)
        const stepCheckIn = new Date();
        stepCheckIn.setDate(stepCheckIn.getDate() + 7); // 1 week from now
        const stepCheckOut = new Date();
        stepCheckOut.setDate(stepCheckOut.getDate() + 10); // 10 days from now
        
        const stepCheckinStr = `${stepCheckIn.getDate()}/${stepCheckIn.getMonth() + 1}/${stepCheckIn.getFullYear()}`;
        const stepCheckoutStr = `${stepCheckOut.getDate()}/${stepCheckOut.getMonth() + 1}/${stepCheckOut.getFullYear()}`;
        
        console.log('   📅 Using dates:', stepCheckinStr, 'to', stepCheckoutStr);
        
        const step6 = await testStep(chatbot, `${stepCheckinStr} to ${stepCheckoutStr} for 3 people`, conversation);
        
        if (step6.bookingCreated) {
            console.log('\n🎉 STEP-BY-STEP BOOKING SUCCESSFUL!');
            console.log('   Reference:', '#' + step6.bookingCreated._id.toString().slice(-8).toUpperCase());
        } else {
            console.log('\n❌ Step-by-step booking failed');
            console.log('   Missing:', step6.extractedInfo?.missing || 'Unknown');
        }
        
        console.log('\n✅ FIXED BOOKING SYSTEM TEST COMPLETED!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

async function testStep(chatbot, message, conversation) {
    console.log('   📝 Message:', message);
    const response = await chatbot.generateResponse(message, conversation);
    
    // Update conversation
    conversation.push(
        { role: 'user', content: message },
        { role: 'assistant', content: response.message }
    );
    
    console.log('   🤖 Response:', response.message.substring(0, 100) + (response.message.length > 100 ? '...' : ''));
    console.log('   📊 Complete:', response.extractedInfo?.isComplete ? '✅' : '❌');
    console.log('   📋 Missing:', response.extractedInfo?.missing?.length || 0, 'fields');
    
    return response;
}

// Run the test
testFixed();
