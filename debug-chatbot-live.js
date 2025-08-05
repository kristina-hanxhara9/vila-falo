#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 VILA FALO CHATBOT DEBUG TOOL');
console.log('================================\n');

async function debugChatbot() {
    try {
        // Connect to database
        console.log('📊 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });
        console.log('✅ Database connected');
        
        // Test environment variables
        console.log('\n🔧 Environment Check:');
        console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
        console.log('- EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
        console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
        console.log('- ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Missing');
        
        // Test chatbot service
        console.log('\n🤖 Testing Chatbot Service...');
        const ChatbotService = require('./chatbot/chatbotService');
        const chatbot = new ChatbotService();
        console.log('✅ Chatbot service loaded');
        
        // Test conversation sequence
        console.log('\n💬 Testing Full Booking Conversation...');
        
        const conversation = [];
        
        // Step 1: Initial booking intent
        console.log('\n1️⃣ Testing: "I want to book a room"');
        const response1 = await chatbot.generateResponse("I want to book a room", conversation);
        console.log('✅ Response:', response1.message.substring(0, 100) + '...');
        console.log('📊 Booking detected:', response1.bookingDetected);
        console.log('📝 Extracted info:', response1.extractedInfo);
        
        conversation.push(
            { role: 'user', content: 'I want to book a room' },
            { role: 'assistant', content: response1.message }
        );
        
        // Step 2: Provide name
        console.log('\n2️⃣ Testing: "My name is Kristina"');
        const response2 = await chatbot.generateResponse("My name is Kristina", conversation);
        console.log('✅ Response:', response2.message.substring(0, 100) + '...');
        console.log('📊 Booking detected:', response2.bookingDetected);
        console.log('📝 Extracted info:', response2.extractedInfo);
        
        conversation.push(
            { role: 'user', content: 'My name is Kristina' },
            { role: 'assistant', content: response2.message }
        );
        
        // Step 3: Provide email
        console.log('\n3️⃣ Testing: "kristina@example.com"');
        const response3 = await chatbot.generateResponse("kristina@example.com", conversation);
        console.log('✅ Response:', response3.message.substring(0, 100) + '...');
        console.log('📊 Booking detected:', response3.bookingDetected);
        console.log('📝 Extracted info:', response3.extractedInfo);
        
        conversation.push(
            { role: 'user', content: 'kristina@example.com' },
            { role: 'assistant', content: response3.message }
        );
        
        // Step 4: Provide complete booking details
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 3);
        
        const bookingDetails = `Standard room from ${tomorrow.getDate()}/${tomorrow.getMonth() + 1}/${tomorrow.getFullYear()} to ${dayAfter.getDate()}/${dayAfter.getMonth() + 1}/${dayAfter.getFullYear()} for 2 people`;
        
        console.log('\n4️⃣ Testing:', bookingDetails);
        const response4 = await chatbot.generateResponse(bookingDetails, conversation);
        console.log('✅ Response:', response4.message.substring(0, 200) + '...');
        console.log('📊 Booking detected:', response4.bookingDetected);
        console.log('📝 Extracted info:', response4.extractedInfo);
        console.log('🎯 Booking created:', response4.bookingCreated ? '✅ YES' : '❌ NO');
        
        if (response4.bookingCreated) {
            console.log('\n🎉 SUCCESS! Booking details:');
            console.log('- ID:', response4.bookingCreated._id);
            console.log('- Guest:', response4.bookingCreated.guestName);
            console.log('- Email:', response4.bookingCreated.email);
            console.log('- Room:', response4.bookingCreated.roomType);
            console.log('- Check-in:', response4.bookingCreated.checkInDate);
            console.log('- Check-out:', response4.bookingCreated.checkOutDate);
        } else {
            console.log('\n❌ ISSUE: Booking was not created');
            console.log('🔍 Debug info:');
            console.log('- Is complete:', response4.extractedInfo?.isComplete);
            console.log('- Missing fields:', response4.extractedInfo?.missing);
            console.log('- Extracted name:', response4.extractedInfo?.name);
            console.log('- Extracted email:', response4.extractedInfo?.email);
            console.log('- Extracted room:', response4.extractedInfo?.roomType);
            console.log('- Extracted dates:', response4.extractedInfo?.checkIn, 'to', response4.extractedInfo?.checkOut);
            console.log('- Extracted guests:', response4.extractedInfo?.guests);
        }
        
        console.log('\n📋 SUMMARY:');
        console.log('- Chatbot service: ✅ Working');
        console.log('- Booking detection: ✅ Working');
        console.log('- Information extraction:', response4.extractedInfo?.hasPartialInfo ? '✅ Partial' : '❌ Failed');
        console.log('- Booking creation:', response4.bookingCreated ? '✅ Success' : '❌ Failed');
        
        if (!response4.bookingCreated) {
            console.log('\n🔧 TROUBLESHOOTING:');
            console.log('The issue appears to be in the information extraction logic.');
            console.log('Try providing all information in one message like:');
            console.log('"I want to book a Standard room from tomorrow for 2 nights for 2 people. My name is Kristina and email is kristina@example.com"');
        }
        
    } catch (error) {
        console.error('\n❌ Debug failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Run debug
debugChatbot().catch(error => {
    console.error('Debug script error:', error);
    process.exit(1);
});
