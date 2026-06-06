const AdminService = require('../services/AdminService');

class AdminController {
    static async getGyms(req, res) {
        try {
            const gyms = await AdminService.getAllGyms();
            res.status(200).json({ gyms });
        } catch (error) {
            console.error('Admin Get Gyms Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async updateGym(req, res) {
        try {
            const { status, subscription_end_date } = req.body;
            
            if (!status) {
                return res.status(400).json({ error: 'Status is required' });
            }

            const gym = await AdminService.updateGymLifecycle(req.params.id, status, subscription_end_date);
            res.status(200).json({ message: 'Gym updated successfully', gym });
        } catch (error) {
            if (error.message.includes('Invalid status')) {
                return res.status(400).json({ error: error.message });
            }
            console.error('Admin Update Gym Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = AdminController;