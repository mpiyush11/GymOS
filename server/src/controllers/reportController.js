const ReportService = require('../services/ReportService');

class ReportController {
    
    static async exportRevenue(req, res) {
        try {
            const { gym_id } = req.user;
            const { start_date, end_date } = req.query;

            if (!start_date || !end_date) {
                return res.status(400).json({ error: 'start_date and end_date are required' });
            }

            // ReportService streams directly to res
            await ReportService.streamRevenueReport(gym_id, start_date, end_date, res);
            
        } catch (error) {
            console.error('Export Revenue Error:', error);
            // If headers are already sent, we can't send JSON. 
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }

    static async getExpiring(req, res) {
        try {
            const { gym_id } = req.user;
            const days = parseInt(req.query.days) || 7;
            const members = await ReportService.getExpiringMembers(gym_id, days);
            res.status(200).json({ members });
        } catch (error) {
            console.error('Get Expiring Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = ReportController;