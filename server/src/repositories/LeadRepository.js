const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class LeadRepository extends BaseRepository {
    constructor() {
        super('leads');
    }

    async findByPhone(gymId, phone) {
        this._validateGymId(gymId);
        const query = `SELECT * FROM leads WHERE gym_id = $1 AND phone = $2 AND deleted_at IS NULL LIMIT 1`;
        const result = await db.query(query, [gymId, phone]);
        return result.rows[0];
    }
}

module.exports = new LeadRepository();