const jwt = require('jsonwebtoken');
const path = require('path');

// This function isn't needed since your route file handles login directly
// But keeping it here if you want to use it instead of the route file logic
const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Login attempt:', { username }); // Debug log
        
        // Replace with actual admin credentials validation
        if (username === (process.env.ADMIN_USERNAME || 'admin') && 
            password === (process.env.ADMIN_PASSWORD || 'admin123')) {
            
            // Create JWT token
            const token = jwt.sign(
                { id: '1', username, role: 'admin' },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '1d' }
            );
            
            // Set cookie (to match your route file's approach)
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 1 day
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            
            console.log('Login successful for user:', username); // Debug log
            
            return res.status(200).json({ 
                success: true,
                message: 'Login successful',
                user: {
                    id: '1',
                    username,
                    role: 'admin'
                }
            });
        } else {
            console.log('Invalid credentials for user:', username); // Debug log
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }
    } catch (error) {
        console.error('Login error:', error); // Debug log
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
        });
    }
};

const getAdminDashboard = (req, res) => {
    try {
        // Serve the admin panel HTML file from the correct path
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