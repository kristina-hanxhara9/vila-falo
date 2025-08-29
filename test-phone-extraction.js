#!/usr/bin/env node

// Test phone extraction specifically
process.env.NODE_ENV = 'development';
require('dotenv').config();
const ChatbotService = require('./chatbot/chatbotService');

async function testPhoneExtraction() {
    console.log('🧪 TESTING PHONE EXTRACTION');
    console.log('============================\n');
    
    const chatbot = new ChatbotService();
    
    const testCases = [
        "+355 69 987 6543",
        "my phone is +355 69 123 4567", 
        "phone: +355691234567",
        "Contact me at +355 68 555 1234",
        "+1 555 123 4567",
        "069 123 4567",
        "+44 20 7946 0958"
    ];
    
    for (const testPhone of testCases) {
        console.log(`\n📱 Testing: "${testPhone}"`);
        
        const conversation = [
            { role: 'user', content: 'I want to book a room' },
            { role: 'user', content: 'John Smith' },
            { role: 'user', content: 'john@example.com' }
        ];
        
        const extracted = chatbot.extractAllBookingInfo(testPhone, conversation);
        
        console.log('   Result:', extracted.phone || '❌ NOT FOUND');
        console.log('   Missing:', extracted.missing.includes('phone') ? 'phone' : 'other fields');
    }
    
    console.log('\n✅ Phone extraction test completed');
}

testPhoneExtraction();
