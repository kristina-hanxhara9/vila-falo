const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// Load environment variables first
dotenv.config();

// Create Express app
const app = express();

const connectDB = require('./config/db');
const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const bookingRoutes = require('./routes/bookingRoutes');
const newsletterRoutes = require('./routes/NewsletterRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatbotRoutes = require('./chatbot/chatbotRoutes');
const emailRoutes = require('./routes/emailRoutes');

// Connect to database
connectDB();

// CORS configuration
const corsOptions = {
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        // Define allowed origins
        const allowedOrigins = [
            'http://localhost:5000',
            'http://localhost:3000',
            process.env.CORS_ORIGIN,
            process.env.BASE_URL
        ].filter(Boolean);
        
        // In production, allow all origins for now
        if (process.env.NODE_ENV === 'production') {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins for development
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Static files middleware - serve all files from public directory with proper MIME types
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (path.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (path.endsWith('.svg')) {
            res.setHeader('Content-Type', 'image/svg+xml');
        }
    }
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// API Routes
app.use('/api/booking', bookingRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/email', emailRoutes);

// Admin routes
app.use('/admin', adminRoutes);

// Root route - serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve specific HTML pages
app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-panel.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Catch-all route for SPA routing - serve index.html for non-API routes
app.get('*', (req, res, next) => {
    // Don't handle API routes, admin routes, or static files
    if (req.path.startsWith('/api') || 
        req.path.startsWith('/admin') || 
        req.path.startsWith('/health') ||
        req.path.includes('.') ||
        req.path.startsWith('/css') ||
        req.path.startsWith('/js') ||
        req.path.startsWith('/images') ||
        req.path.startsWith('/favicon')) {
        return next();
    }
    
    // Serve the main page for all other routes
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(`Error ${req.method} ${req.path}:`, err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler for anything else - but not for static files
app.use((req, res) => {
    // For static file requests, just return normal 404
    if (req.path.includes('.') || 
        req.path.startsWith('/css') ||
        req.path.startsWith('/js') ||
        req.path.startsWith('/images') ||
        req.path.startsWith('/favicon')) {
        return res.status(404).end();
    }
    
    // For other routes, return JSON error
    res.status(404).json({
        success: false,
        message: 'Page not found'
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`👤 Client Site: http://localhost:${PORT}`);
    console.log(`👨‍💼 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🔑 Admin Login: http://localhost:${PORT}/admin/login`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('📴 Server closed');
        mongoose.connection.close().then(() => {
            console.log('🗄️  Database connection closed');
            process.exit(0);
        }).catch((err) => {
            console.error('Error closing database:', err);
            process.exit(1);
        });
    });
});

module.exports = app;
