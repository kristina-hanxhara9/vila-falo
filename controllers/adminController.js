const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

let User;
try {
    User = require('../models/users');
} catch (e) {
    console.error('Could not load User model:', e.message);
}

const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Login attempt:', { username });

        // Try MongoDB first
        if (User) {
            try {
                const user = await User.findOne({
                    $or: [
                        { email: username },
                        { name: username }
                    ]
                });

                if (user) {
                    const isMatch = await bcrypt.compare(password, user.password);

                    if (isMatch) {
                        const token = jwt.sign(
                            { id: user._id, username: user.name, role: 'admin' },
                            process.env.JWT_SECRET,
                            { expiresIn: '1d' }
                        );

                        res.cookie('jwt', token, {
                            httpOnly: true,
                            maxAge: 24 * 60 * 60 * 1000,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax'
                        });

                        console.log('Login successful (MongoDB) for user:', user.name);
                        return res.status(200).json({
                            success: true,
                            message: 'Login successful',
                            user: { id: user._id, username: user.name, role: 'admin' }
                        });
                    } else {
                        console.log('Invalid password for user:', username);
                        return res.status(401).json({ success: false, message: 'Invalid credentials' });
                    }
                }
            } catch (dbError) {
                console.error('MongoDB query failed, trying fallback:', dbError.message);
            }
        }

        // Fallback: env vars / defaults
        const adminUser = process.env.ADMIN_USERNAME || 'admin';
        const adminPass = process.env.ADMIN_PASSWORD || 'VF@admin2025';
        const adminEmail = 'vilafalo@gmail.com';

        if ((username === adminUser || username === adminEmail || username === 'Admin') && password === adminPass) {
            const token = jwt.sign(
                { id: '1', username: adminUser, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });

            console.log('Login successful (fallback) for user:', username);
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: { id: '1', username: adminUser, role: 'admin' }
            });
        }

        return res.status(401).json({ success: false, message: 'Invalid credentials' });
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
