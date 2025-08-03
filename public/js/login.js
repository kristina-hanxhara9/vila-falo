const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock user for development
const adminUser = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    email: 'admin@example.com',
    role: 'admin'
};

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Simple validation
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }
        
        // Check if username matches
        if (username !== adminUser.username) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        // Check if password matches
        const isMatch = password === adminUser.password; // For development - in production, use bcrypt.compare
        
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        // Create JWT token
        const token = jwt.sign(
            { id: '1', username, role: adminUser.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );
       // Set cookie with proper settings
res.cookie('jwt', token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
    sameSite: 'lax'  // Changed from 'strict' to 'lax' for development
});
        
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: '1',
                username,
                email: adminUser.email,
                role: adminUser.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred' 
        });
    }
});

// Auth check endpoint
router.get('/check', (req, res) => {
    try {
        const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.json({ isAuthenticated: false });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        
        res.json({
            isAuthenticated: true,
            user: {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.json({ isAuthenticated: false });
    }
});

// Logout endpoint
router.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.json({ success: true, message: 'Logout successful' });
});

module.exports = router;