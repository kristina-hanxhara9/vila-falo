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
        
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Mesazhi është i detyrueshëm.'
            });
        }

        // Get or create conversation session
        const session = sessionId || Date.now().toString();
        let conversationHistory = conversationSessions.get(session) || [];

        // Generate response
        const response = await chatbotService.generateResponse(message, conversationHistory);

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
            hasAvailabilityCheck: response.hasAvailabilityCheck,
            availabilityData: response.availabilityData,
            bookingInfo: response.bookingInfo,
            bookingCreated: response.bookingCreated,
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
