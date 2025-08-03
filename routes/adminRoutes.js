const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { adminLogin, getAdminDashboard } = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');

// GET route to serve login page
router.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Login</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .login-container {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 400px;
                }
                .login-container h2 {
                    text-align: center;
                    margin-bottom: 1.5rem;
                    color: #333;
                }
                .form-group {
                    margin-bottom: 1rem;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: #333;
                    font-weight: bold;
                }
                .form-group input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-sizing: border-box;
                    font-size: 1rem;
                }
                .form-group input:focus {
                    outline: none;
                    border-color: #007bff;
                }
                .login-btn {
                    width: 100%;
                    padding: 0.75rem;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                .login-btn:hover {
                    background-color: #0056b3;
                }
                .login-btn:disabled {
                    background-color: #6c757d;
                    cursor: not-allowed;
                }
                .error-message {
                    color: #dc3545;
                    margin-top: 1rem;
                    text-align: center;
                    display: none;
                }
                .success-message {
                    color: #28a745;
                    margin-top: 1rem;
                    text-align: center;
                    display: none;
                }
            </style>
        </head>
        <body>
            <div class="login-container">
                <h2>Admin Login</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="username">Username:</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="login-btn" id="loginBtn">Login</button>
                    <div id="errorMessage" class="error-message"></div>
                    <div id="successMessage" class="success-message"></div>
                </form>
            </div>

            <script>
                document.getElementById('loginForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const username = document.getElementById('username').value;
                    const password = document.getElementById('password').value;
                    const loginBtn = document.getElementById('loginBtn');
                    const errorMessage = document.getElementById('errorMessage');
                    const successMessage = document.getElementById('successMessage');
                    
                    // Reset messages
                    errorMessage.style.display = 'none';
                    successMessage.style.display = 'none';
                    
                    // Disable button during request
                    loginBtn.disabled = true;
                    loginBtn.textContent = 'Logging in...';
                    
                    try {
                        const response = await fetch('/admin/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ username, password }),
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            successMessage.textContent = 'Login successful! Redirecting...';
                            successMessage.style.display = 'block';
                            setTimeout(() => {
                                window.location.href = '/admin/dashboard';
                            }, 1000);
                        } else {
                            errorMessage.textContent = data.message || 'Login failed';
                            errorMessage.style.display = 'block';
                        }
                    } catch (error) {
                        console.error('Login error:', error);
                        errorMessage.textContent = 'Network error. Please try again.';
                        errorMessage.style.display = 'block';
                    } finally {
                        // Re-enable button
                        loginBtn.disabled = false;
                        loginBtn.textContent = 'Login';
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// Admin login route - use the controller function
router.post('/login', adminLogin);

// Auth check endpoint - REQUIRED for admin.js
router.get('/check', (req, res) => {
    try {
        const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.json({ isAuthenticated: false });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        
        res.json({
            isAuthenticated: true,
            user: {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.json({ isAuthenticated: false });
    }
});

// Logout endpoint - REQUIRED for admin.js
router.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.json({ success: true, message: 'Logout successful' });
});

// Admin dashboard route - use same auth logic as /check
router.get('/dashboard', (req, res, next) => {
    try {
        console.log('Dashboard auth check - cookies:', req.cookies);
        console.log('Dashboard auth check - headers:', req.headers.authorization);
        
        const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            console.log('No token found for dashboard access');
            return res.redirect('/admin/login');
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        console.log('Dashboard auth successful for user:', decoded.username);
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Dashboard auth error:', error);
        return res.redirect('/admin/login');
    }
}, getAdminDashboard);

// Admin panel route - same as dashboard but with different URL
router.get('/', (req, res, next) => {
    try {
        const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.redirect('/admin/login');
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.redirect('/admin/login');
    }
}, getAdminDashboard);

module.exports = router;