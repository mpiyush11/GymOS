const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class PaymentRepository extends BaseRepository {
    constructor() {
        super('payments');
    }

    // We DO NOT expose generic update/softDelete for payments to ensure immutability.
    // We override update to strictly limit what can be touched.
    async update(gymId, id, data) {
        throw new Error('CRITICAL SECURITY VIOLATION: Generic update on payments is strictly forbidden.');
    }

    async softDelete(gymId, id) {
        throw new Error('CRITICAL SECURITY VIOLATION: Soft deleting payments is strictly forbidden. Use VOID logic.');
    }

    async findByIdempotencyKey(gymId, idempotencyKey) {
        this._validateGymId(gymId);
        const query = `SELECT * FROM payments WHERE gym_id = $1 AND idempotency_key = $2 LIMIT 1`;
        const result = await db.query(query, [gymId, idempotencyKey]);
        return result.rows[0];
    }
}

module.exports = new PaymentRepository();