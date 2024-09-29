// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.authenticateToken = async (req, res, next) => {
    const token = req.header('Authorization');
    
    // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //     try {
    //         token = req.headers.authorization.split(' ')[1];
    //         const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //         req.user = await Candidate.findById(decoded.id).select('-password');
    //         next();
    //     } catch (error) {
    //         return res.status(401).json({ message: 'Not authorized, token failed' });
    //     }
    // }

    console.log('Received token:', token);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({ message: 'Forbidden', error: error.message });
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};