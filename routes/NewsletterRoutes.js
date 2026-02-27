const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const emailService = require('../services/emailService');
const authenticate = require('../middleware/authenticate');

// POST subscribe to newsletter
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email address is required' 
            });
        }
        
        // Check if email already exists
        const existingSubscription = await Newsletter.findOne({ email: email.toLowerCase() });
        
        if (existingSubscription) {
            return res.status(200).json({ 
                success: true, 
                message: 'You are already subscribed to our newsletter!' 
            });
        }
        
        // Create new newsletter subscription
        const newsletter = new Newsletter({
            email: email.toLowerCase(),
            subscribedAt: new Date(),
            isActive: true
        });
        
        await newsletter.save();
        
        // Send confirmation email
        try {
            await emailService.sendNewsletterConfirmation(email);
            console.log('✅ Newsletter confirmation sent to:', email);
        } catch (emailError) {
            console.error('❌ Error sending newsletter confirmation:', emailError);
            // Don't fail the subscription if email fails
        }
        
        res.status(201).json({ 
            success: true, 
            message: 'Successfully subscribed to newsletter! Check your email for confirmation.' 
        });
        
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
                success: false, 
                message: 'Validation Error', 
                errors: messages 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred' 
        });
    }
});

// GET all newsletter subscriptions (admin only - requires auth)
router.get('/', authenticate, async (req, res) => {
    try {
        const subscriptions = await Newsletter.find().sort({ subscribedAt: -1 });
        res.json({ 
            success: true, 
            count: subscriptions.length, 
            data: subscriptions 
        });
    } catch (error) {
        console.error('Error fetching newsletter subscriptions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred' 
        });
    }
});

// DELETE unsubscribe from newsletter
router.delete('/unsubscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email address is required' 
            });
        }
        
        const subscription = await Newsletter.findOneAndUpdate(
            { email: email.toLowerCase() },
            { isActive: false, unsubscribedAt: new Date() },
            { new: true }
        );
        
        if (!subscription) {
            return res.status(404).json({ 
                success: false, 
                message: 'Email not found in our newsletter list' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Successfully unsubscribed from newsletter' 
        });
        
    } catch (error) {
        console.error('Error unsubscribing from newsletter:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred' 
        });
    }
});

module.exports = router;
