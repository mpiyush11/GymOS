const DashboardService = require('../services/DashboardService');

class DashboardController {
    static async getOverview(req, res) {
        try {
            const { gym_id } = req.user;
            const metrics = await DashboardService.getOverview(gym_id);
            res.status(200).json({ metrics });
        } catch (error) {
            console.error('Dashboard Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = DashboardController;