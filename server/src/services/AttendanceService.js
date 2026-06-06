const attendanceRepo = require('../repositories/AttendanceRepository');
const memberRepo = require('../repositories/MemberRepository');
const AuditService = require('./AuditService');
const db = require('../config/db');

class AttendanceService {

    static async checkIn(gymId, userId, memberId) {
        // 1. Verify Member Exists & Tenant Scope
        const member = await memberRepo.findById(gymId, memberId);
        if (!member) {
            throw new Error('Member not found.');
        }

        // 2. Member Status Validation
        if (member.status === 'FROZEN') {
            throw new Error('Cannot check in a FROZEN member. Please unfreeze first.');
        }

        if (member.status === 'EXPIRED') {
            throw new Error('Cannot check in an EXPIRED member. Please renew membership.');
        }

        // Active Date validation fallback (in case cron job failed to update status)
        const today = new Date();
        const endDate = new Date(member.membership_end_date);
        
        // Strip time from both dates for accurate comparison
        today.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);

        if (endDate < today) {
            throw new Error('Membership has expired based on end date. Please renew.');
        }

        // 3. Prevent duplicate check-ins for the same day
        // dateString format: 'YYYY-MM-DD'
        const dateString = new Date().toISOString().split('T')[0];
        
        const existingCheckIn = await attendanceRepo.findCheckInByDate(gymId, memberId, dateString);
        if (existingCheckIn) {
            throw new Error('Member has already checked in today.');
        }

        // 4. Create Check-in
        const checkIn = await attendanceRepo.create(gymId, {
            member_id: memberId,
            date: dateString,
            check_in_time: new Date().toISOString()
        });

        // We do NOT write to audit_logs for standard attendance check-ins to prevent DB bloat.
        // The attendance table itself is an immutable ledger in V1.

        return checkIn;
    }

    static async getAttendanceHistory(gymId, limit = 100, offset = 0, date = null) {
        let query = `
            SELECT a.id, a.member_id, a.date, a.check_in_time, m.name, m.phone 
            FROM attendance a
            JOIN members m ON a.member_id = m.id
            WHERE a.gym_id = $1
        `;
        const params = [gymId];

        if (date) {
            params.push(date);
            query += ` AND a.date = $2`;
        }

        query += ` ORDER BY a.check_in_time DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await db.query(query, params);
        return result.rows;
    }

    static async getMemberAttendance(gymId, memberId, limit = 30) {
        const query = `
            SELECT date, check_in_time 
            FROM attendance 
            WHERE gym_id = $1 AND member_id = $2
            ORDER BY date DESC
            LIMIT $3
        `;
        const result = await db.query(query, [gymId, memberId, limit]);
        return result.rows;
    }
}

module.exports = AttendanceService;