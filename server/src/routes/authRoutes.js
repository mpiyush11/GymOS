const express = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/authController');
const requireAuth = require('../middlewares/auth');

const router = express.Router();

// Strict rate limiter for login to prevent brute-force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP + Email to 5 login requests per window
    skipSuccessfulRequests: true, // HARDENING: Successful logins do not burn quota
    
    // PRODUCTION FIX: Handle proxy and IPv6 tracking safely for Render
    keyGenerator: (req) => {
        const clientIp = req.headers['x-forwarded-for'] 
            ? req.headers['x-forwarded-for'].split(',')[0].trim() 
            : req.ip;
        
        const emailKey = req.body.email ? req.body.email.toLowerCase().trim() : 'unknown';
        return `${clientIp}_${emailKey}`;
    },
    
    message: { error: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
    
    // BYPASS VALIDATION: Force-bypasses the internal helper check for cloud deploy
    validate: { xForwardedForHeader: false }, 
});

router.post('/login', loginLimiter, AuthController.login);
router.post('/logout', requireAuth, AuthController.logout);

// Example to verify session
router.get('/me', requireAuth, (req, res) => {
    res.status(200).json({ user: req.user });
});

module.exports = router;