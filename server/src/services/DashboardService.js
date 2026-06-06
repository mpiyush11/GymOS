const db = require('../config/db');

class DashboardService {
    static async getOverview(gymId) {
        // We use a single transaction/connection to run multiple fast aggregate queries
        const client = await db.pool.connect();
        try {
            // 1. Active Members Count
            const activeMembersResult = await client.query(`
                SELECT COUNT(*) as count FROM members 
                WHERE gym_id = $1 AND status = 'ACTIVE' AND deleted_at IS NULL
            `, [gymId]);

            // 2. Today's Check-ins
            const today = new Date().toISOString().split('T')[0];
            const attendanceResult = await client.query(`
                SELECT COUNT(*) as count FROM attendance 
                WHERE gym_id = $1 AND date = $2
            `, [gymId, today]);

            // 3. Pending Leads (New or Follow-up)
            const leadsResult = await client.query(`
                SELECT COUNT(*) as count FROM leads 
                WHERE gym_id = $1 AND status IN ('NEW', 'FOLLOW_UP') AND deleted_at IS NULL
            `, [gymId]);

            // 4. Monthly Revenue (Current Month, SUCCESS payments only)
            // FIX 3 & 4: Timezone consistency and strict identity of financial truth
            const revenueResult = await client.query(`
                SELECT COALESCE(SUM(amount), 0) as total FROM payments 
                WHERE gym_id = $1 
                AND status = 'SUCCESS'
                AND date_trunc('month', transaction_date AT TIME ZONE 'Asia/Kolkata') = date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
            `, [gymId]);

            return {
                active_members: parseInt(activeMembersResult.rows[0].count),
                todays_attendance: parseInt(attendanceResult.rows[0].count),
                pending_leads: parseInt(leadsResult.rows[0].count),
                monthly_revenue: parseFloat(revenueResult.rows[0].total)
            };
        } finally {
            client.release();
        }
    }
}

module.exports = DashboardService;