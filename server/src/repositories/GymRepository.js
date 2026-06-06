const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class GymRepository extends BaseRepository {
    constructor() {
        super('gyms');
    }

    // Gym operations often don't have a gym_id constraint (since they ARE the gym)
    // We override to allow Platform Admin operations
    async findAllGyms() {
        const query = `SELECT * FROM gyms ORDER BY created_at DESC`;
        const result = await db.query(query);
        return result.rows;
    }

    async updateGymStatus(id, status, subscription_end_date = null) {
        let query;
        let values;
        
        if (subscription_end_date) {
            query = `UPDATE gyms SET status = $1, subscription_end_date = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`;
            values = [status, subscription_end_date, id];
        } else {
            query = `UPDATE gyms SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
            values = [status, id];
        }
        
        const result = await db.query(query, values);
        return result.rows[0];
    }
}

module.exports = new GymRepository();