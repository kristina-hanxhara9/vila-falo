require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const validateServerConfiguration = require('./validate-config');

const app = express();

// Configure mongoose
mongoose.set('strictQuery', false);

// Trust proxy for Heroku
app.set('trust proxy', 1);

// Security and performance middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://vila-falo-resort-8208afd24e04.herokuapp.com']
        : ['http://localhost:5000', 'http://127.0.0.1:5000'],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection with minimal options
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Error:', error.message);
        // Don't crash in production, just log the error
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
};

connectDB();

// Import routes safely
let bookingRoutes, newsletterRoutes, adminRoutes, emailRoutes, userRoutes, chatbotRoutes;

try {
    bookingRoutes = require('./routes/bookingRoutes');
    app.use('/api/booking', bookingRoutes);
} catch (e) { console.log('⚠️ Booking routes not available'); }

try {
    newsletterRoutes = require('./routes/NewsletterRoutes');
    app.use('/api/newsletter', newsletterRoutes);
} catch (e) { console.log('⚠️ Newsletter routes not available'); }

try {
    adminRoutes = require('./routes/adminRoutes');
    app.use('/admin', adminRoutes);
} catch (e) { console.log('⚠️ Admin routes not available'); }

try {
    emailRoutes = require('./routes/emailRoutes');
    app.use('/api/email', emailRoutes);
} catch (e) { console.log('⚠️ Email routes not available'); }

try {
    userRoutes = require('./routes/users');
    app.use('/api/users', userRoutes);
} catch (e) { console.log('⚠️ User routes not available'); }

try {
    chatbotRoutes = require('./chatbot/chatbotRoutes');
    app.use('/api/chatbot', chatbotRoutes);
} catch (e) { console.log('⚠️ Chatbot routes not available'); }

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Basic routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-panel.html'));
});

// Catch all for SPA
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message 
    });
});

const PORT = process.env.PORT || 5000;

// Start server with configuration validation
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Vila Falo Resort running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    console.log(`🗄️ Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
    console.log('');
    
    // Run configuration validation
    try {
        const validationResult = await validateServerConfiguration();
        
        if (validationResult.hasErrors) {
            console.log('⚠️ Server started with configuration errors - some features may not work properly!');
        } else if (validationResult.hasWarnings) {
            console.log('✅ Server started successfully with minor warnings');
        } else {
            console.log('✅ Server started successfully - all systems operational!');
        }
    } catch (validationError) {
        console.error('❌ Configuration validation failed:', validationError.message);
    }
    
    console.log('');
    console.log('🔗 Server endpoints:');
    console.log('   📱 Website: http://localhost:' + PORT);
    console.log('   🛠️ Admin Panel: http://localhost:' + PORT + '/admin');
    console.log('   🤖 Chatbot API: http://localhost:' + PORT + '/api/chatbot/message');
    console.log('   📋 Booking API: http://localhost:' + PORT + '/api/booking');
    console.log('   ❤️ Health Check: http://localhost:' + PORT + '/health');
    console.log('');
});

module.exports = app;