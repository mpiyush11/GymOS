const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class AttendanceRepository extends BaseRepository {
    constructor() {
        super('attendance');
    }

    async findCheckInByDate(gymId, memberId, dateString) {
        this._validateGymId(gymId);
        // Expects dateString in 'YYYY-MM-DD' format
        const query = `
            SELECT * FROM attendance 
            WHERE gym_id = $1 AND member_id = $2 AND date = $3 
            LIMIT 1
        `;
        const result = await db.query(query, [gymId, memberId, dateString]);
        return result.rows[0];
    }
}

module.exports = new AttendanceRepository();