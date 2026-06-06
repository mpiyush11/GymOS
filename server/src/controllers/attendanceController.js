const AttendanceService = require('../services/AttendanceService');

class AttendanceController {
    
    static async checkIn(req, res) {
        try {
            const { gym_id, id: user_id } = req.user;
            const { member_id } = req.body;

            if (!member_id) {
                return res.status(400).json({ error: 'member_id is required for check-in' });
            }

            const checkIn = await AttendanceService.checkIn(gym_id, user_id, member_id);
            res.status(201).json({ message: 'Check-in successful', checkIn });
        } catch (error) {
            // Distinguish between business logic errors (400) and system errors (500)
            if (error.message.includes('already checked in') || 
                error.message.includes('expired') || 
                error.message.includes('FROZEN') ||
                error.message.includes('not found')) {
                return res.status(400).json({ error: error.message });
            }
            console.error('Check-In Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async getHistory(req, res) {
        try {
            const { gym_id } = req.user;
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;
            const date = req.query.date; // Optional filter format YYYY-MM-DD

            const history = await AttendanceService.getAttendanceHistory(gym_id, limit, offset, date);
            res.status(200).json({ history });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async getMemberHistory(req, res) {
        try {
            const { gym_id } = req.user;
            const limit = parseInt(req.query.limit) || 30; // Default last 30 visits
            
            const history = await AttendanceService.getMemberAttendance(gym_id, req.params.member_id, limit);
            res.status(200).json({ history });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = AttendanceController;