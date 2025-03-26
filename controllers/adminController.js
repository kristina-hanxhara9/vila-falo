const jwt = require('jsonwebtoken');

// Admin login
const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Replace with actual admin credentials validation
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ message: 'Login successful', token });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin dashboard
const getAdminDashboard = (req, res) => {
    // Replace with actual admin dashboard logic
    res.status(200).json({ message: 'Welcome to the admin dashboard' });
};

module.exports = { adminLogin, getAdminDashboard };
