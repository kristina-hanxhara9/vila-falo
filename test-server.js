#!/usr/bin/env node

// Quick server test to debug routing issues
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Test routes
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date() });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Health check passed' });
});

// Serve index.html for root
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'index.html');
    console.log('Serving index.html from:', filePath);
    res.sendFile(filePath);
});

// Serve admin panel
app.get('/admin', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'admin-panel.html');
    console.log('Serving admin panel from:', filePath);
    res.sendFile(filePath);
});

// Catch all for debugging
app.get('*', (req, res) => {
    console.log('Catch-all route hit for:', req.path);
    res.json({ 
        message: 'Route not specifically handled', 
        path: req.path,
        method: req.method,
        available_routes: [
            'GET /',
            'GET /test', 
            'GET /health',
            'GET /admin'
        ]
    });
});

app.listen(PORT, () => {
    console.log('🧪 Test Server running on http://localhost:' + PORT);
    console.log('📁 Static files from:', path.join(__dirname, 'public'));
    console.log('🔗 Test routes:');
    console.log('   http://localhost:' + PORT + '/');
    console.log('   http://localhost:' + PORT + '/test');
    console.log('   http://localhost:' + PORT + '/health');
    console.log('   http://localhost:' + PORT + '/admin');
});
