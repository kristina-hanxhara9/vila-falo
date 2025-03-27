const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

// Create Express app - MOVED THIS UP
const app = express();

const connectDB = require('./config/db');
const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const bookingRoutes = require('./routes/bookingRoutes');
const newsletterRoutes = require('./routes/NewsletterRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes
app.use('/api/booking', bookingRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/admin', adminRoutes);
app.use('/api/admin', adminRoutes); // Added this line for admin API
app.use('/api/users', userRoutes);

// Serve the main HTML file for all routes except API routes
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/admin')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// Error handling middleware
app.use(errorHandler);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // Export the app for testing or other purposes