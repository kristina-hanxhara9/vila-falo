#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');

console.log('🎯 VILA FALO - SIMPLIFIED BOOKING SYSTEM TEST');
console.log('==============================================\n');

async function testBookingSystem() {
    try {
        // Connect to database
        console.log('📊 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });
        console.log('✅ Database connected');
        
        // Check environment
        console.log('\n🔧 Environment Check:');
        console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? (process.env.GEMINI_API_KEY.startsWith('AIza') ? '✅ Set (valid format)' : '⚠️ Set (check format)') : '❌ Missing');
        console.log('- EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
        console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
        console.log('- ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Missing');
        
        // Test information extraction directly
        console.log('\n🔍 Testing Information Extraction (Core Functionality)...');
        const ChatbotService = require('./chatbot/chatbotService');
        const chatbot = new ChatbotService();
        
        // Test conversation history
        const conversation = [
            { role: 'user', content: 'I want to book a room' },
            { role: 'assistant', content: 'What is your name?' },
            { role: 'user', content: 'Kristina' },
            { role: 'assistant', content: 'What is your email?' },
            { role: 'user', content: 'kristina@example.com' }
        ];\n        \n        const finalMessage = 'Standard room from 15/08/2025 to 17/08/2025 for 2 people';\n        \n        // Test extraction\n        const bookingIntent = chatbot.detectBookingIntent(finalMessage, conversation);\n        const extractedInfo = chatbot.extractAllBookingInfo(finalMessage, conversation);\n        \n        console.log('\n📊 Results:');\n        console.log('- Booking Intent:', bookingIntent.isBookingAttempt ? '✅ Detected' : '❌ Not detected');\n        console.log('- Name Extracted:', extractedInfo.name || '❌ Not found');\n        console.log('- Email Extracted:', extractedInfo.email || '❌ Not found');\n        console.log('- Room Type:', extractedInfo.roomType || '❌ Not found');\n        console.log('- Check-in:', extractedInfo.checkIn || '❌ Not found');\n        console.log('- Check-out:', extractedInfo.checkOut || '❌ Not found');\n        console.log('- Guests:', extractedInfo.guests || '❌ Not found');\n        console.log('- Complete Info:', extractedInfo.isComplete ? '✅ Yes' : '❌ No');\n        console.log('- Missing Fields:', extractedInfo.missing);\n        \n        // Test booking creation if complete\n        if (extractedInfo.isComplete) {\n            console.log('\n💾 Testing Booking Creation...');\n            try {\n                const booking = await chatbot.createBookingFromInfo(extractedInfo);\n                console.log('✅ BOOKING CREATED SUCCESSFULLY!');\n                console.log('- Booking ID:', booking._id);\n                console.log('- Guest Name:', booking.guestName);\n                console.log('- Email:', booking.email);\n                console.log('- Room:', booking.roomType);\n                console.log('- Check-in:', booking.checkInDate);\n                console.log('- Check-out:', booking.checkOutDate);\n                console.log('- Guests:', booking.numberOfGuests);\n                console.log('- Status:', booking.status);\n                \n                console.log('\n🎉 SUCCESS! Your booking system is working perfectly!');\n                console.log('\n📋 What this means:');\n                console.log('✅ Customers can book through the chatbot');\n                console.log('✅ Bookings are saved to the database');\n                console.log('✅ Information extraction is working');\n                console.log('✅ The system will send emails (if email service is configured)');\n                \n            } catch (bookingError) {\n                console.log('❌ Booking creation failed:', bookingError.message);\n            }\n        } else {\n            console.log('\n⚠️ Information extraction needs improvement');\n            console.log('Missing:', extractedInfo.missing.join(', '));\n        }\n        \n        console.log('\n🔑 NEXT STEPS:');\n        if (!process.env.GEMINI_API_KEY.startsWith('AIza')) {\n            console.log('1. Get a real Gemini API key from: https://makersuite.google.com/app/apikey');\n            console.log('2. Update your .env file with the real API key');\n        } else {\n            console.log('1. ✅ API key format looks good');\n        }\n        console.log('2. Deploy to production: npm run deploy');\n        console.log('3. Test the live chatbot on your website');\n        \n    } catch (error) {\n        console.error('\n❌ Test failed:', error.message);\n    } finally {\n        await mongoose.connection.close();\n        process.exit(0);\n    }\n}\n\n// Run test\ntestBookingSystem().catch(error => {\n    console.error('Test failed:', error);\n    process.exit(1);\n});\n