const express = require('express');
const router = express.Router();
const ChatbotService = require('./chatbotService');

const chatbotService = new ChatbotService();

// Store conversation sessions in memory
const conversationSessions = new Map();

// [FIX] A new function to remove Personal Identifiable Information (PII) from messages.
// This is the core of the fix to comply with the policy.
const sanitizeMessage = (message) => {
    if (!message) return '';
    // Regex to find and replace email addresses
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    // Regex to find and replace phone numbers (handles various formats)
    const phoneRegex = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,4}/g;
    
    return message
        .replace(emailRegex, '[email redacted]')
        .replace(phoneRegex, '[phone number redacted]');
};


// POST /api/chatbot/message - Main chat endpoint
router.post('/message', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Mesazhi është i detyrueshëm.' });
        }

        // Get or create conversation session
        const session = sessionId || Date.now().toString();
        let conversationHistory = conversationSessions.get(session) || [];

        // Generate a response using the raw user message but with the sanitized history
        const response = await chatbotService.generateResponse(message, conversationHistory);
        
        // [FIX] Sanitize the user's message BEFORE adding it to the history.
        // This ensures that on the *next* turn, we do not send any PII to the Gemini API.
        const sanitizedUserMessage = sanitizeMessage(message);

        // Update conversation history with the SANITIZED user message
        conversationHistory.push(
            { role: 'user', content: sanitizedUserMessage, timestamp: new Date() },
            { role: 'assistant', content: response.message, timestamp: new Date() }
        );

        // Keep only the last 20 messages to prevent memory issues
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        conversationSessions.set(session, conversationHistory);

        // [FIX] The response is now much simpler. It no longer contains any booking information.
        res.json({
            success: true,
            message: response.message,
            sessionId: session,
        });

    } catch (error) {
        console.error('Chatbot route error:', error);
        res.status(500).json({
            success: false,
            message: 'Ka ndodhur një gabim. Ju lutem provoni përsëri.',
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
        });
    }
});

// DELETE /api/chatbot/session/:sessionId - Clear a conversation session
router.delete('/session/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        
        if (conversationSessions.has(sessionId)) {
            conversationSessions.delete(sessionId);
            res.json({ success: true, message: 'Sesioni u pastrua me sukses.' });
        } else {
            res.status(404).json({ success: false, message: 'Sesioni nuk u gjet.' });
        }

    } catch (error) {
        console.error('Session clear error:', error);
        res.status(500).json({
            success: false,
            message: 'Ka ndodhur një gabim.',
        });
    }
});

// Compatibility endpoints to avoid 404s on existing test tools
router.get('/availability', (req, res) => {
    res.json({
        success: false,
        message: 'Availability endpoint is currently disabled in this build.'
    });
});

router.post('/debug', (req, res) => {
    const { sessionId } = req.body || {};
    const history = conversationSessions.get(sessionId) || [];
    
    res.json({
        success: true,
        message: 'Debug info available',
        data: {
            sessionId: sessionId || 'n/a',
            conversationLength: history.length,
            lastMessages: history.slice(-4)
        }
    });
});

router.post('/quick-booking', (req, res) => {
    res.status(403).json({
        success: false,
        message: 'Quick booking is disabled. Please use the main booking form.'
    });
});

router.get('/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            activeSessions: conversationSessions.size,
            uptimeSeconds: Math.round(process.uptime())
        }
    });
});

module.exports = router;
