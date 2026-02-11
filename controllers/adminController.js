const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('../models/users');

const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Login attempt:', { username });

        // Find user by email or name in MongoDB
        const user = await User.findOne({
            $or: [
                { email: username },
                { name: username }
            ]
        });

        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Compare password with bcrypt hash
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log('Invalid password for user:', username);
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

        // Set cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        console.log('Login successful for user:', user.name);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.name,
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
};

const getAdminDashboard = (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'public', 'admin-panel.html');
        console.log('Serving admin dashboard from:', filePath);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving admin dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading admin dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
        });
    }
};

module.exports = { adminLogin, getAdminDashboard };
