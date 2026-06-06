const db = require('../config/db');
const { format } = require('fast-csv');

class ReportService {
    
    // Revenue Report: Streams directly to response to avoid memory bloat
    static async streamRevenueReport(gymId, startDate, endDate, res) {
        // FIX 3 & 4: Timezone consistency and strict identity of financial truth
        // startDate and endDate come from frontend inputs (YYYY-MM-DD), so we cast them explicitly 
        // in the DB query against the AT TIME ZONE 'Asia/Kolkata' conversion.
        const query = `
            SELECT p.transaction_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' as "Date", 
                   m.name as "Member Name", m.phone as "Phone", 
                   p.amount as "Amount", p.payment_mode as "Method", u.name as "Collected By"
            FROM payments p
            JOIN members m ON p.member_id = m.id
            LEFT JOIN users u ON p.created_by = u.id
            WHERE p.gym_id = $1 
              AND p.status = 'SUCCESS'
              AND (p.transaction_date AT TIME ZONE 'Asia/Kolkata')::date >= $2::date 
              AND (p.transaction_date AT TIME ZONE 'Asia/Kolkata')::date <= $3::date
            ORDER BY p.transaction_date DESC
        `;
        
        const client = await db.pool.connect();
        try {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=revenue_report_${startDate}_to_${endDate}.csv`);

            const csvStream = format({ headers: true });
            csvStream.pipe(res);

            const result = await client.query(query, [gymId, startDate, endDate]);
            result.rows.forEach(row => csvStream.write(row));
            csvStream.end();

        } finally {
            client.release();
        }
    }

    static async getExpiringMembers(gymId, days = 7) {
        const query = `
            SELECT id, name, phone, membership_end_date 
            FROM members 
            WHERE gym_id = $1 
              AND status = 'ACTIVE' 
              AND deleted_at IS NULL
              AND membership_end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + $2::int)
            ORDER BY membership_end_date ASC
        `;
        const result = await db.query(query, [gymId, days]);
        return result.rows;
    }
}

module.exports = ReportService;