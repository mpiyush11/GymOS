const SessionRepository = require('../repositories/SessionRepository');

/**
 * requireAuth Middleware
 * Validates the DB-backed session cookie, checks expiration, 
 * and injects `req.user` (containing gym_id and role).
 */
const requireAuth = async (req, res, next) => {
    try {
        // We will expect the token in a signed HttpOnly cookie named 'sessionId'
        // For API testing/fallback, we also check the Authorization header
        let token = null;
        
        if (req.cookies && req.cookies.sessionId) {
            token = req.cookies.sessionId;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await SessionRepository.validateSession(token);

        if (!user) {
            // Token is invalid, expired, or user was deleted/deactivated
            return res.status(401).json({ error: 'Session invalid or expired' });
        }

        // The sacred context injection.
        // Once this is set, controllers MUST pass req.user.gym_id to the Repository layer.
        req.user = {
            id: user.user_id,
            gym_id: user.gym_id,
            role: user.role
        };

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = requireAuth;