const express = require('express');
const router = express.Router();
const ChatbotService = require('./chatbotService');

const chatbotService = new ChatbotService();

// Store conversation sessions in memory (in production, use Redis or database)
const conversationSessions = new Map();

// POST /api/chatbot/message - Main chat endpoint
router.post('/message', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        console.log('🤖 Chatbot message received:', {
            message: message,
            sessionId: sessionId,
            timestamp: new Date().toISOString()
        });
        
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Mesazhi është i detyrueshëm.'
            });
        }

        // Get or create conversation session
        const session = sessionId || Date.now().toString();
        let conversationHistory = conversationSessions.get(session) || [];
        
        console.log('💬 Conversation history length:', conversationHistory.length);
        console.log('📝 Current conversation context:', conversationHistory.slice(-2));

        // Generate response
        console.log('🧠 Generating chatbot response...');
        const response = await chatbotService.generateResponse(message, conversationHistory);
        
        console.log('✅ Chatbot response generated:', {
            success: response.success,
            bookingDetected: response.bookingDetected,
            bookingCreated: !!response.bookingCreated,
            extractedInfo: response.extractedInfo
        });
        
        if (response.bookingCreated) {
            console.log('🎉 BOOKING CREATED SUCCESSFULLY:', {
                bookingId: response.bookingCreated._id,
                guest: response.bookingCreated.guestName,
                email: response.bookingCreated.email,
                room: response.bookingCreated.roomType
            });
        }

        // Update conversation history
        conversationHistory.push(
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: response.message, timestamp: new Date() }
        );

        // Keep only last 10 messages to prevent memory issues
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        conversationSessions.set(session, conversationHistory);

        // Clean up old sessions (older than 1 hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        for (const [sid, history] of conversationSessions.entries()) {
            if (history.length > 0 && history[history.length - 1].timestamp < oneHourAgo) {
                conversationSessions.delete(sid);
            }
        }

        res.json({
            success: true,
            message: response.message,
            sessionId: session,
            bookingDetected: response.bookingDetected,
            extractedInfo: response.extractedInfo,
            bookingCreated: response.bookingCreated,
            nextStep: response.nextStep,
            apiError: response.apiError, // Include API error info
            debug: process.env.NODE_ENV === 'development' ? {
                conversationLength: conversationHistory.length,
                lastMessages: conversationHistory.slice(-4)
            } : undefined,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            success: false,
            message: 'Ka ndodhur një gabim. Ju lutem provoni përsëri.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/chatbot/availability - Check room availability
router.get('/availability', async (req, res) => {
    try {
        const { checkIn, checkOut, roomType } = req.query;

        if (!checkIn || !checkOut) {
            return res.status(400).json({
                success: false,
                message: 'Check-in dhe check-out datat janë të detyrueshme.'
            });
        }

        const availability = await chatbotService.checkRoomAvailability(checkIn, checkOut, roomType);

        res.json({
            success: true,
            data: availability
        });

    } catch (error) {
        console.error('Availability check error:', error);
        res.status(500).json({
            success: false,
            message: 'Ka ndodhur një gabim gjatë kontrollit të disponueshmërisë.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/chatbot/popular-questions - Get popular questions
router.get('/popular-questions', (req, res) => {
    try {
        const questions = chatbotService.getPopularQuestions();
        res.json({
            success: true,
            data: questions
        });
    } catch (error) {
        console.error('Popular questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Ka ndodhur një gabim.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// DELETE /api/chatbot/session/:sessionId - Clear conversation session
router.delete('/session/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        
        if (conversationSessions.has(sessionId)) {
            conversationSessions.delete(sessionId);
        }

        res.json({
            success: true,
            message: 'Sesioni u pastrua me sukses.'
        });

    } catch (error) {
        console.error('Session clear error:', error);
        res.status(500).json({
            success: false,
            message: 'Ka ndodhur një gabim.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST /api/chatbot/debug - Debug conversation and booking extraction
router.post('/debug', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const session = sessionId || 'debug-session';
        let conversationHistory = conversationSessions.get(session) || [];
        
        // Test the extraction logic
        const bookingDetection = chatbotService.detectBookingIntent(message, conversationHistory);
        const extractedInfo = chatbotService.extractAllBookingInfo(message, conversationHistory);
        
        res.json({
            success: true,
            debug: {
                message: message,
                conversationHistory: conversationHistory,
                bookingDetection: bookingDetection,
                extractedInfo: extractedInfo,
                missingInfo: extractedInfo.missing,
                isComplete: extractedInfo.isComplete,
                hasPartialInfo: extractedInfo.hasPartialInfo
            }
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({
            success: false,
            message: 'Debug error',
            error: error.message
        });
    }
});

// POST /api/chatbot/quick-booking - Quick booking test (development only)
router.post('/quick-booking', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                success: false,
                message: 'This endpoint is only available in development mode'
            });
        }

        const { name, email, phone, roomType, checkIn, checkOut, guests } = req.body;
        
        const bookingInfo = {
            name: name || 'Test User',
            email: email || 'test@example.com',
            phone: phone || '+355 69 123 4567',
            roomType: roomType || 'Standard',
            checkIn: checkIn || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            checkOut: checkOut || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            guests: guests || 2
        };

        console.log('🧪 Quick booking test with info:', bookingInfo);

        const booking = await chatbotService.createBookingFromInfo(bookingInfo);
        
        res.json({
            success: true,
            message: 'Quick booking created successfully!',
            booking: {
                id: booking._id,
                reference: '#' + booking._id.toString().slice(-8).toUpperCase(),
                guestName: booking.guestName,
                email: booking.email,
                phone: booking.phone,
                roomType: booking.roomType,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                numberOfGuests: booking.numberOfGuests,
                status: booking.status
            }
        });

    } catch (error) {
        console.error('Quick booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Quick booking failed',
            error: error.message
        });
    }
});

// GET /api/chatbot/stats - Get chatbot usage stats (admin only)
router.get('/stats', (req, res) => {
    try {
        // In production, you'd want proper admin auth here
        const stats = {
            activeSessions: conversationSessions.size,
            totalSessions: conversationSessions.size, // This would be stored in DB in production
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage()
        };

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Ka ndodhur një gabim.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
