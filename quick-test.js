#!/usr/bin/env node

console.log('🧪 VILA FALO BOOKING SYSTEM - QUICK TEST');
console.log('=========================================\n');

const express = require('express');
const app = express();

// Simple test to verify the main components
async function quickTest() {
    try {
        // Test 1: Environment Variables
        console.log('1️⃣ Environment Variables:');
        const requiredVars = ['EMAIL_USER', 'EMAIL_PASS', 'ADMIN_EMAIL', 'MONGODB_URI'];
        const missing = requiredVars.filter(v => !process.env[v]);
        
        if (missing.length > 0) {
            console.log('❌ Missing variables:', missing.join(', '));
            console.log('   Please check your .env file\n');
        } else {
            console.log('✅ All required environment variables are set\n');
        }
        
        // Test 2: File Structure
        console.log('2️⃣ File Structure:');
        const files = [
            './services/emailService.js',
            './chatbot/chatbotService.js',
            './models/Booking.js',
            './routes/bookingRoutes.js'
        ];
        
        let allFilesExist = true;
        for (const file of files) {
            try {
                require.resolve(file);
                console.log('✅', file);
            } catch (error) {
                console.log('❌', file, '- Missing!');
                allFilesExist = false;
            }
        }
        
        if (!allFilesExist) {
            console.log('\n❌ Some required files are missing!');
            return;
        }
        
        console.log('\n3️⃣ Service Initialization:');
        
        // Test 3: Email Service
        try {
            const emailService = require('./services/emailService');
            console.log('✅ Email service loaded');
        } catch (error) {
            console.log('❌ Email service failed:', error.message);
        }
        
        // Test 4: Chatbot Service
        try {
            const ChatbotService = require('./chatbot/chatbotService');
            console.log('✅ Chatbot service loaded');
        } catch (error) {
            console.log('❌ Chatbot service failed:', error.message);
        }
        
        // Test 5: Booking Model
        try {
            const Booking = require('./models/Booking');
            console.log('✅ Booking model loaded');
        } catch (error) {
            console.log('❌ Booking model failed:', error.message);
        }
        
        console.log('\n🎉 Quick test completed!');
        console.log('\n💡 To run the full test:');
        console.log('   node test-booking-flow.js');
        console.log('\n🚀 To start the server:');
        console.log('   npm start');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Load environment variables
require('dotenv').config();

// Run the test
quickTest();
