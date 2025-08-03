const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiAPI() {
    console.log('🧪 Testing Gemini API Configuration...\n');
    
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ ERROR: GEMINI_API_KEY not found in .env file');
        console.log('📝 Please add your API key to .env file:');
        console.log('   GEMINI_API_KEY=your-api-key-here\n');
        return;
    }
    
    // Check API key format
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey.startsWith('AIza')) {
        console.warn('⚠️  WARNING: API key should start with "AIza"');
        console.log(`   Your key starts with: ${apiKey.substring(0, 4)}...\n`);
    } else {
        console.log('✅ API key format looks correct');
        console.log(`   Key starts with: ${apiKey.substring(0, 8)}...\n`);
    }
    
    try {
        console.log('🚀 Initializing Google Generative AI...');
        const genAI = new GoogleGenerativeAI(apiKey);
        
        console.log('🤖 Creating Gemini 2.0 Flash model...');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        console.log('💬 Sending test message...');
        const result = await model.generateContent('Hello! Just testing the API. Please respond with "API test successful!"');
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ SUCCESS! API is working correctly');
        console.log('📤 Test message: Hello! Just testing the API. Please respond with "API test successful!"');
        console.log('📥 API Response:', text);
        console.log('\n🎉 Your Gemini API is configured correctly and ready to use!\n');
        
    } catch (error) {
        console.error('❌ ERROR: API test failed');
        console.error('📋 Error details:');
        console.error('   Name:', error.name);
        console.error('   Message:', error.message);
        console.error('   Status:', error.status);
        console.error('   Status Text:', error.statusText);
        
        console.log('\n🔧 Troubleshooting:');
        if (error.status === 403) {
            console.log('   - Check if your API key is correct');
            console.log('   - Make sure you\'ve enabled the Gemini API in Google Cloud Console');
            console.log('   - Verify your API key has the right permissions');
            console.log('   - Get a new API key from: https://makersuite.google.com/app/apikey');
        } else if (error.status === 429) {
            console.log('   - You\'ve hit the rate limit, wait a moment and try again');
        } else if (error.message && error.message.includes('API key')) {
            console.log('   - API key issue - check your .env file');
        } else {
            console.log('   - Check your internet connection');
            console.log('   - Try again in a few minutes');
        }
        console.log('\n');
    }
}

// Run the test
testGeminiAPI().catch(console.error);
