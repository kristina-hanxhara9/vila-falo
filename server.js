require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const validateServerConfiguration = require('./validate-config');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = socketIo(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? ['https://vila-falo-resort-8208afd24e04.herokuapp.com', 'https://vilafalo.com', 'https://www.vilafalo.com']
            : ['http://localhost:5000', 'http://127.0.0.1:5000'],
        credentials: true
    }
});

// Make io available globally
global.io = io;

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('👤 New client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('👋 Client disconnected:', socket.id);
    });
});

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
        ? ['https://vila-falo-resort-8208afd24e04.herokuapp.com', 'https://vilafalo.com', 'https://www.vilafalo.com']
        : ['http://localhost:5000', 'http://127.0.0.1:5000'],
    credentials: true
}));
app.use(cookieParser());

// CRITICAL: Body parsing middleware with increased limits and better error handling
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf, encoding) => {
        // Store raw body for debugging if needed
        req.rawBody = buf.toString(encoding || 'utf8');
    }
}));

app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb',
    verify: (req, res, buf, encoding) => {
        // Store raw body for debugging if needed
        if (!req.rawBody) {
            req.rawBody = buf.toString(encoding || 'utf8');
        }
    }
}));

// Request logging middleware for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log(`\n${'='.repeat(80)}`);
            console.log(`📥 ${req.method} ${req.url}`);
            console.log(`${'='.repeat(80)}`);
            console.log('Headers:', {
                'content-type': req.get('Content-Type'),
                'content-length': req.get('Content-Length'),
                'user-agent': req.get('User-Agent')
            });
            console.log('Body Type:', typeof req.body);
            console.log('Body Keys:', Object.keys(req.body || {}));
            if (req.body && Object.keys(req.body).length > 0) {
                console.log('Body Preview:', JSON.stringify(req.body, null, 2).substring(0, 500));
            }
            console.log(`${'='.repeat(80)}\n`);
        }
        next();
    });
}

// Error handling for body parser
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('❌ Body Parser Error:', err.message);
        return res.status(400).json({ 
            success: false,
            message: 'Invalid JSON in request body',
            error: err.message,
            hint: 'Make sure your request body is valid JSON and Content-Type is application/json'
        });
    }
    next(err);
});

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
let bookingRoutes, paymentRoutes, newsletterRoutes, adminRoutes, emailRoutes, userRoutes, chatbotRoutes;

try {
    bookingRoutes = require('./routes/bookingRoutes');
    app.use('/api/booking', bookingRoutes);
    console.log('✅ Booking routes loaded');
} catch (e) { 
    console.log('⚠️ Booking routes not available:', e.message); 
}

try {
    paymentRoutes = require('./routes/paymentRoutes');
    app.use('/api/payment', paymentRoutes);
    console.log('✅ Payment routes loaded');
} catch (e) { 
    console.log('⚠️ Payment routes not available:', e.message); 
}

try {
    newsletterRoutes = require('./routes/NewsletterRoutes');
    app.use('/api/newsletter', newsletterRoutes);
    console.log('✅ Newsletter routes loaded');
} catch (e) { 
    console.log('⚠️ Newsletter routes not available:', e.message); 
}

try {
    adminRoutes = require('./routes/adminRoutes');
    app.use('/admin', adminRoutes);
    console.log('✅ Admin routes loaded');
} catch (e) { 
    console.log('⚠️ Admin routes not available:', e.message); 
}

try {
    emailRoutes = require('./routes/emailRoutes');
    app.use('/api/email', emailRoutes);
    console.log('✅ Email routes loaded');
} catch (e) { 
    console.log('⚠️ Email routes not available:', e.message); 
}

try {
    userRoutes = require('./routes/users');
    app.use('/api/users', userRoutes);
    console.log('✅ User routes loaded');
} catch (e) { 
    console.log('⚠️ User routes not available:', e.message); 
}

try {
    chatbotRoutes = require('./chatbot/chatbotRoutes');
    app.use('/api/chatbot', chatbotRoutes);
    console.log('✅ Chatbot routes loaded');
} catch (e) { 
    console.log('⚠️ Chatbot routes not available:', e.message); 
}

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV,
        uptime: process.uptime()
    });
});

// Test endpoint for body parsing
app.post('/api/test-body', express.json(), express.urlencoded({ extended: true }), (req, res) => {
    console.log('🧪 Test Body Endpoint Hit');
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Body:', req.body);
    console.log('Body Type:', typeof req.body);
    console.log('Body Keys:', Object.keys(req.body || {}));
    
    res.json({
        success: true,
        message: 'Body received successfully',
        contentType: req.get('Content-Type'),
        bodyType: typeof req.body,
        bodyKeys: Object.keys(req.body || {}),
        body: req.body
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
        res.status(404).json({ 
            error: 'API endpoint not found',
            path: req.path,
            method: req.method
        });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5000;

// Start server with configuration validation
server.listen(PORT, '0.0.0.0', async () => {
    console.log('\n' + '🚀'.repeat(40));
    console.log(`🚀 Vila Falo Resort Server Started`);
    console.log('🚀'.repeat(40));
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ Database: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '⏳ Connecting...'}`);
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
    console.log('🔗 Server Endpoints:');
    console.log(`   📱 Website: http://localhost:${PORT}`);
    console.log(`   🛠️ Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`   🤖 Chatbot API: http://localhost:${PORT}/api/chatbot/message`);
    console.log(`   📋 Booking API: http://localhost:${PORT}/api/booking`);
    console.log(`   🧪 Body Test: http://localhost:${PORT}/api/test-body`);
    console.log(`   ❤️ Health Check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('📝 Debugging Tips:');
    console.log('   • Test body parsing: POST to /api/test-body with JSON data');
    console.log('   • Test booking endpoint: POST to /api/booking/test-body-parser');
    console.log('   • Check logs for detailed request/response information');
    console.log('   • All POST requests should use Content-Type: application/json');
    console.log('');
    console.log('🚀'.repeat(40) + '\n');
});

module.exports = app;
