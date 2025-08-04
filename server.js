const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Load environment variables first
dotenv.config();

// Configure mongoose to suppress deprecation warnings
mongoose.set('strictQuery', false);

// Create Express app
const app = express();

// Import configurations and routes
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

// Import all routes
const bookingRoutes = require('./routes/bookingRoutes');
const newsletterRoutes = require('./routes/NewsletterRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatbotRoutes = require('./chatbot/chatbotRoutes');
const emailRoutes = require('./routes/emailRoutes');

// Production Security Middleware
if (process.env.NODE_ENV === 'production') {
    // Security headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"]
            }
        },
        crossOriginEmbedderPolicy: false
    }));

    // Compression for production
    app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: {
            error: 'Too many requests from this IP, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/api', limiter);

    // More strict rate limiting for auth endpoints
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        message: {
            error: 'Too many authentication attempts, please try again later.'
        }
    });
    app.use('/api/users/login', authLimiter);
    app.use('/admin/login', authLimiter);

    // Request logging
    app.use(morgan('combined'));
} else {
    // Development logging
    app.use(morgan('dev'));
}

// Connect to database with retry logic
let dbRetries = 0;
const maxDbRetries = 5;

const connectWithRetry = async () => {
    try {
        await connectDB();
        console.log('✅ Database connected successfully');
    } catch (error) {
        dbRetries++;
        console.error(`❌ Database connection failed (attempt ${dbRetries}/${maxDbRetries}):`, error.message);
        
        if (dbRetries < maxDbRetries) {
            console.log(`🔄 Retrying database connection in 5 seconds...`);
            setTimeout(connectWithRetry, 5000);
        } else {
            console.error('🚨 Max database connection retries reached. Server will continue without database.');
            // Don't crash the server, just log the error
        }
    }
};

connectWithRetry();

// CORS configuration for production
const corsOptions = {
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        // Define allowed origins for production
        const allowedOrigins = [
            'https://vila-falo-resort-8208afd24e04.herokuapp.com',
            'https://www.vila-falo.com',
            'https://vila-falo.com',
            process.env.CORS_ORIGIN,
            process.env.BASE_URL
        ].filter(Boolean);

        // In development, allow localhost
        if (process.env.NODE_ENV !== 'production') {
            allowedOrigins.push('http://localhost:5000', 'http://localhost:3000');
        }
        
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Trust proxy for Heroku
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Body parsing middleware with security limits
app.use(bodyParser.json({ 
    limit: process.env.NODE_ENV === 'production' ? '5mb' : '10mb',
    verify: (req, res, buf) => {
        // Add request verification if needed
        req.rawBody = buf;
    }
}));
app.use(bodyParser.urlencoded({ 
    extended: true, 
    limit: process.env.NODE_ENV === 'production' ? '5mb' : '10mb'
}));
app.use(express.json({ 
    limit: process.env.NODE_ENV === 'production' ? '5mb' : '10mb'
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: process.env.NODE_ENV === 'production' ? '5mb' : '10mb'
}));

// Cookie parser middleware
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Static files middleware with caching for production
const staticOptions = process.env.NODE_ENV === 'production' ? {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        } else if (path.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        } else if (path.endsWith('.svg')) {
            res.setHeader('Content-Type', 'image/svg+xml');
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        } else if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=3600');
        }
    }
} : {
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
};

app.use(express.static(path.join(__dirname, 'public'), staticOptions));

// Health check endpoint with detailed information
app.get('/health', (req, res) => {
    const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        database: {
            status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            name: mongoose.connection.name || 'unknown'
        },
        server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            platform: process.platform,
            nodeVersion: process.version
        }
    };

    const httpStatus = healthCheck.database.status === 'connected' ? 200 : 503;
    res.status(httpStatus).json(healthCheck);
});

// API Routes with error handling
app.use('/api/booking', (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: 'Database service temporarily unavailable'
        });
    }
    next();
}, bookingRoutes);

app.use('/api/newsletter', (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: 'Database service temporarily unavailable'
        });
    }
    next();
}, newsletterRoutes);

app.use('/api/users', (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: 'Database service temporarily unavailable'
        });
    }
    next();
}, userRoutes);

app.use('/api/chatbot', chatbotRoutes);
app.use('/api/email', emailRoutes);

// Admin routes with database check
app.use('/admin', (req, res, next) => {
    // Allow admin login page even if database is down
    if (req.path === '/login' || req.path === '/login.html') {
        return next();
    }
    
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: 'Admin features temporarily unavailable - database connection required'
        });
    }
    next();
}, adminRoutes);

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

// Robots.txt for SEO
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    if (process.env.NODE_ENV === 'production') {
        res.send(`User-agent: *
Allow: /
Sitemap: https://vila-falo-resort-8208afd24e04.herokuapp.com/sitemap.xml`);
    } else {
        res.send(`User-agent: *
Disallow: /`);
    }
});

// Sitemap for SEO
app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://vila-falo-resort-8208afd24e04.herokuapp.com'
        : `http://localhost:${process.env.PORT || 5000}`;
    
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <priority>1.0</priority>
        <changefreq>weekly</changefreq>
    </url>
    <url>
        <loc>${baseUrl}/admin-panel</loc>
        <priority>0.5</priority>
        <changefreq>monthly</changefreq>
    </url>
</urlset>`);
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
        message: 'API endpoint not found',
        availableEndpoints: [
            '/api/booking',
            '/api/newsletter', 
            '/api/users',
            '/api/chatbot',
            '/api/email'
        ]
    });
});

// Global error handler with proper logging
app.use((err, req, res, next) => {
    // Log error details
    console.error(`Error ${req.method} ${req.path}:`, {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    
    // Don't send stack trace in production
    const errorResponse = {
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'An error occurred while processing your request' 
            : err.message,
        timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }

    res.status(err.status || 500).json(errorResponse);
});

// Error handling middleware
app.use(errorHandler);

// 404 handler for anything else
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
        message: 'Page not found',
        requestedPath: req.path,
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Vila Falo Resort Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
    
    if (process.env.NODE_ENV === 'production') {
        console.log(`🌐 Production URL: https://vila-falo-resort-8208afd24e04.herokuapp.com`);
        console.log(`👨‍💼 Admin Panel: https://vila-falo-resort-8208afd24e04.herokuapp.com/admin`);
        console.log(`📊 Health Check: https://vila-falo-resort-8208afd24e04.herokuapp.com/health`);
    } else {
        console.log(`🌐 Local URL: http://localhost:${PORT}`);
        console.log(`👤 Client Site: http://localhost:${PORT}`);
        console.log(`👨‍💼 Admin Panel: http://localhost:${PORT}/admin`);
        console.log(`🔑 Admin Login: http://localhost:${PORT}/admin/login`);
        console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    }
    
    console.log(`⚡ Server ready to handle requests`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`🛑 ${signal} received. Shutting down gracefully...`);
    server.close(() => {
        console.log('📴 HTTP server closed');
        mongoose.connection.close().then(() => {
            console.log('🗄️  Database connection closed');
            console.log('✅ Graceful shutdown complete');
            process.exit(0);
        }).catch((err) => {
            console.error('❌ Error closing database:', err);
            process.exit(1);
        });
    });

    // Force close after 30 seconds
    setTimeout(() => {
        console.error('⚠️  Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    console.error('Stack:', err.stack);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app;