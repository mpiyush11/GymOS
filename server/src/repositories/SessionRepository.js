const db = require('../config/db');
const crypto = require('crypto');

class SessionRepository {
    /**
     * Creates a secure, DB-backed session.
     * @param {string} userId - The user's UUID.
     * @param {number} durationHours - How long until the session expires.
     * @returns {Object} { token, session } The plaintext token to send via cookie, and the DB session record.
     */
    static async createSession(userId, durationHours = 24) {
        // Generate a 64-byte random hex string. Extremely secure against brute force.
        const plaintextToken = crypto.randomBytes(64).toString('hex');
        
        // Hash it before storing in DB (protects against DB leaks)
        const tokenHash = crypto.createHash('sha256').update(plaintextToken).digest('hex');
        
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + durationHours);

        const query = `
            INSERT INTO sessions (user_id, token_hash, expires_at)
            VALUES ($1, $2, $3)
            RETURNING id, user_id, expires_at
        `;

        const result = await db.query(query, [userId, tokenHash, expiresAt]);

        return {
            token: plaintextToken,
            session: result.rows[0]
        };
    }

    /**
     * Validates a plaintext token and returns the associated user if valid.
     */
    static async validateSession(plaintextToken) {
        const tokenHash = crypto.createHash('sha256').update(plaintextToken).digest('hex');
        
        const query = `
            SELECT s.id as session_id, s.user_id, u.gym_id, u.role, u.is_active, u.deleted_at
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token_hash = $1 
            AND s.expires_at > CURRENT_TIMESTAMP
            AND u.is_active = true
            AND u.deleted_at IS NULL
        `;

        const result = await db.query(query, [tokenHash]);
        return result.rows[0] || null;
    }

    /**
     * Instant revocation for security (e.g. logout or role demotion)
     */
    static async destroySession(plaintextToken) {
        const tokenHash = crypto.createHash('sha256').update(plaintextToken).digest('hex');
        const query = `DELETE FROM sessions WHERE token_hash = $1`;
        await db.query(query, [tokenHash]);
    }

    /**
     * Destroy ALL sessions for a user (Used when a user is fired or password changed)
     */
    static async destroyAllUserSessions(userId) {
        const query = `DELETE FROM sessions WHERE user_id = $1`;
        await db.query(query, [userId]);
    }
}

module.exports = SessionRepository;