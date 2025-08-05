#!/usr/bin/env node

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiAPI() {
    console.log('🧪 TESTING GEMINI API WITH YOUR KEY');
    console.log('===================================\n');
    
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 Using API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : '❌ Not found');
    
    if (!apiKey) {
        console.log('❌ No API key found in .env file');
        return;
    }
    
    try {
        console.log('🚀 Initializing Google Generative AI...');
        const genAI = new GoogleGenerativeAI(apiKey);
        
        console.log('🤖 Creating Gemini 2.0 Flash model...');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        console.log('💬 Testing with simple message...');
        const result = await model.generateContent('Hello! Please respond with "API test successful for Vila Falo booking system"');
        const response = await result.response;
        const text = response.text();
        
        console.log('🎉 SUCCESS! API Response:');
        console.log('=' + '='.repeat(50));
        console.log(text);
        console.log('=' + '='.repeat(50));
        console.log('');
        console.log('✅ Your Gemini API key is working perfectly!');
        console.log('✅ The chatbot will now be able to generate proper responses');
        console.log('✅ Ready to test the full booking system!');
        
    } catch (error) {
        console.error('❌ API Test Failed:');
        console.error('Error:', error.message);
        console.error('Status:', error.status);
        console.error('StatusText:', error.statusText);
        
        if (error.status === 400) {
            console.log('\n🔧 Troubleshooting:');
            console.log('- API key format looks correct');
            console.log('- Check if the API key has proper permissions');
            console.log('- Verify the key is active in Google AI Studio');
        }
    }
}

// Run the test
testGeminiAPI().catch(console.error);
