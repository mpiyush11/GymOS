const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class MemberRepository extends BaseRepository {
    constructor() {
        super('members');
    }

    async findByPhone(gymId, phone) {
        this._validateGymId(gymId);
        const query = `SELECT * FROM members WHERE gym_id = $1 AND phone = $2 AND deleted_at IS NULL LIMIT 1`;
        const result = await db.query(query, [gymId, phone]);
        return result.rows[0];
    }
}

module.exports = new MemberRepository();