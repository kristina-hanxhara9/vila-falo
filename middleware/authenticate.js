const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies.jwt ||
                     (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (!token) {
            return res.status(401).json({
                success: false, 
                message: 'Access denied. No token provided.' 
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

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