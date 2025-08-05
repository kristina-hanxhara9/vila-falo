#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const ChatbotService = require('./chatbot/chatbotService');

async function testChatbotBookingFlow() {
    console.log('🧪 TESTING VILA FALO CHATBOT BOOKING FLOW');
    console.log('==========================================\n');
    
    try {
        // Connect to database
        console.log('📊 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });
        console.log('✅ Database connected\n');
        
        // Initialize chatbot service
        console.log('🤖 Initializing chatbot service...');
        const chatbot = new ChatbotService();
        console.log('✅ Chatbot service initialized\n');
        
        // Test conversation that leads to a booking
        console.log('💬 Testing booking conversation flow...');
        
        const conversation = [];
        
        // Step 1: Initial interest
        console.log('\n1️⃣ Customer expresses interest in booking...');
        const response1 = await chatbot.generateResponse(
            "Hello, I want to book a room at Vila Falo", 
            conversation
        );
        console.log('Bot response:', response1.message);
        conversation.push(
            { role: 'user', content: 'Hello, I want to book a room at Vila Falo' },
            { role: 'assistant', content: response1.message }
        );
        
        // Step 2: Provide name
        console.log('\n2️⃣ Customer provides name...');
        const response2 = await chatbot.generateResponse(
            "My name is John Doe", 
            conversation
        );
        console.log('Bot response:', response2.message);
        conversation.push(
            { role: 'user', content: 'My name is John Doe' },
            { role: 'assistant', content: response2.message }
        );
        
        // Step 3: Provide email
        console.log('\n3️⃣ Customer provides email...');
        const response3 = await chatbot.generateResponse(
            "My email is john.doe@example.com", 
            conversation
        );
        console.log('Bot response:', response3.message);
        conversation.push(
            { role: 'user', content: 'My email is john.doe@example.com' },
            { role: 'assistant', content: response3.message }
        );
        
        // Step 4: Provide room preference and details
        console.log('\n4️⃣ Customer provides room and date details...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 3);
        
        const dateMessage = `I want a Standard room from ${tomorrow.getDate()}/${tomorrow.getMonth() + 1}/${tomorrow.getFullYear()} to ${dayAfter.getDate()}/${dayAfter.getMonth() + 1}/${dayAfter.getFullYear()} for 2 people`;
        
        const response4 = await chatbot.generateResponse(
            dateMessage, 
            conversation
        );
        console.log('Bot response:', response4.message);
        console.log('Booking created:', response4.bookingCreated ? '✅ YES' : '❌ NO');
        
        if (response4.bookingCreated) {
            console.log('\n🎉 SUCCESS! Booking was created:');
            console.log('- ID:', response4.bookingCreated._id);
            console.log('- Guest:', response4.bookingCreated.guestName);
            console.log('- Email:', response4.bookingCreated.email);
            console.log('- Room:', response4.bookingCreated.roomType);
            console.log('- Check-in:', response4.bookingCreated.checkInDate);
            console.log('- Check-out:', response4.bookingCreated.checkOutDate);
            console.log('- Guests:', response4.bookingCreated.numberOfGuests);
            console.log('- Status:', response4.bookingCreated.status);
        } else {
            console.log('\n❌ Booking was not created. Checking extraction...');
            console.log('Extracted info:', response4.extractedInfo);
        }
        
        console.log('\n✅ Chatbot booking flow test completed!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Run the test
testChatbotBookingFlow().catch(error => {
    console.error('Test script error:', error);
    process.exit(1);
});
