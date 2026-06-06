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
    keyGenerator: (req) => {
        return `${req.ip}_${req.body.email ? req.body.email.toLowerCase() : 'unknown'}`;
    },
    message: { error: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login', loginLimiter, AuthController.login);
router.post('/logout', requireAuth, AuthController.logout);

// Example to verify session
router.get('/me', requireAuth, (req, res) => {
    res.status(200).json({ user: req.user });
});

module.exports = router;