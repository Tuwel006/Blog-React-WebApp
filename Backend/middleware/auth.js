const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { STATUS_CODES } = require('../config/constants');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({
                success: false,
                message: 'User not found'
            });
        }

        next();
    } catch (error) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

module.exports = { protect, generateToken };
