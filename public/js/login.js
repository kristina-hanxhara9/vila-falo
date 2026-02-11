const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/users');

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

        // Find user by email or name in MongoDB
        const user = await User.findOne({
            $or: [
                { email: username },
                { name: username }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Compare password with bcrypt hash
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, username: user.name, role: 'admin' },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        // Set cookie with proper settings
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.name,
                email: user.email,
                role: 'admin'
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
