const jwt = require('jsonwebtoken');

// Admin login
const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Replace with actual admin credentials validationword === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ message: 'Login successful', token });
            return res.status(200).json({ message: 'Login successful', token });
        } else {rn res.status(401).json({ message: 'Invalid credentials' });
            return res.status(401).json({ message: 'Invalid credentials' });
        }ch (error) {
    } catch (error) {0).json({ message: 'Server error', error: error.message });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// Admin dashboard
// Admin dashboardboard = (req, res) => {
const getAdminDashboard = (req, res) => {d logic
    res.status(200).json({ message: 'Welcome to the admin dashboard' });the admin dashboard' });
};

module.exports = { adminLogin, getAdminDashboard };module.exports = { adminLogin, getAdminDashboard };
