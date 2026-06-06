const bcrypt = require('bcrypt');
const db = require('../config/db');
const SessionRepository = require('../repositories/SessionRepository');

class AuthController {
    
    /**
     * POST /api/v1/auth/login
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password required' });
            }

            // Emails are platform-wide unique.
            const query = `
                SELECT id, gym_id, role, password_hash, is_active, deleted_at 
                FROM users 
                WHERE email = $1 AND deleted_at IS NULL
            `;
            const result = await db.query(query, [email.toLowerCase()]);
            const user = result.rows[0];

            if (!user) {
                // FIX: Dummy compare to prevent timing attacks (user enumeration)
                // Use a valid bcrypt hash to prevent runtime parsing errors
                await bcrypt.compare(password, '$2b$12$3ATnHLuM.mNeRX5RDKqQR.i/Luis2QwAj0Y7jyl3JH3XM6ME5ZzUu');
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            if (!user.is_active) {
                return res.status(403).json({ error: 'Account is deactivated. Contact Admin.' });
            }

            // Verify password using bcrypt
            const isValid = await bcrypt.compare(password, user.password_hash);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // FIX: Allow multi-session for real-world gym operations.
            // DO NOT destroy old sessions automatically on login.
            // await SessionRepository.destroyAllUserSessions(user.id);

            // Create DB session
            const { token, session } = await SessionRepository.createSession(user.id, 24);

            // Set secure, HttpOnly, SameSite cookie
            res.cookie('sessionId', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict', // Mitigates CSRF
                maxAge: 24 * 60 * 60 * 1000 // 24 hours in ms
            });

            // Return user details (without password hash)
            res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    gym_id: user.gym_id,
                    role: user.role
                }
            });

        } catch (error) {
            console.error('Login Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * POST /api/v1/auth/logout
     */
    static async logout(req, res) {
        try {
            let token = req.cookies && req.cookies.sessionId;
            if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
                token = req.headers.authorization.split(' ')[1];
            }

            if (token) {
                await SessionRepository.destroySession(token);
            }

            res.clearCookie('sessionId', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = AuthController;