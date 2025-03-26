const express = require('express');
const router = express.Router();

// Define newsletter routes
router.post('/subscribe', (req, res) => {
    res.status(200).json({ message: 'Subscribed to newsletter successfully' });
});

module.exports = router; // Ensure this is exporting the router
