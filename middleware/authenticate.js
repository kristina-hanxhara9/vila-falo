const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        console.log('Authenticate middleware - cookies:', req.cookies);
        console.log('Authenticate middleware - auth header:', req.headers.authorization);
        
        // Get token from cookie or Authorization header
        const token = req.cookies.jwt || 
                     (req.headers.authorization && req.headers.authorization.split(' ')[1]);
        
        if (!token) {
            console.log('Authenticate middleware - no token found');
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. No token provided.' 
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        console.log('Authenticate middleware - token verified for user:', decoded.username);
        
        // Add user info to request
        req.user = decoded;
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token.' 
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired.' 
            });
        }
        
        return res.status(401).json({ 
            success: false, 
            message: 'Token verification failed.' 
        });
    }
};

module.exports = authenticate;