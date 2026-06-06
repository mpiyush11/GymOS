const MemberService = require('../services/MemberService');

class MemberController {
    
    static async create(req, res) {
        try {
            const { gym_id, id: user_id } = req.user;
            const data = req.body;

            if (!data.name || !data.phone || !data.membership_end_date) {
                return res.status(400).json({ error: 'Name, phone, and membership_end_date are required' });
            }

            const member = await MemberService.createMember(gym_id, user_id, data);
            res.status(201).json({ message: 'Member created successfully', member });
        } catch (error) {
            if (error.message.includes('already exists')) {
                return res.status(409).json({ error: error.message });
            }
            console.error('Create Member Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async getAll(req, res) {
        try {
            const { gym_id } = req.user;
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;

            const members = await MemberService.getMembers(gym_id, limit, offset);
            res.status(200).json({ members });
        } catch (error) {
            console.error('Get Members Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async getById(req, res) {
        try {
            const { gym_id } = req.user;
            const member = await MemberService.getMemberById(gym_id, req.params.id);
            res.status(200).json({ member });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { gym_id, id: user_id } = req.user;
            const updated = await MemberService.updateMember(gym_id, user_id, req.params.id, req.body);
            res.status(200).json({ message: 'Member updated', member: updated });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async changeStatus(req, res) {
        try {
            const { gym_id, id: user_id } = req.user;
            const { status } = req.body;

            if (!['ACTIVE', 'FROZEN', 'EXPIRED'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }

            const updated = await MemberService.updateStatus(gym_id, user_id, req.params.id, status);
            res.status(200).json({ message: `Member marked as ${status}`, member: updated });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async renew(req, res) {
        try {
            const { gym_id, id: user_id } = req.user;
            const { new_end_date } = req.body;

            if (!new_end_date) {
                return res.status(400).json({ error: 'new_end_date is required' });
            }

            const updated = await MemberService.renewMember(gym_id, user_id, req.params.id, new_end_date);
            res.status(200).json({ message: 'Membership renewed', member: updated });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = MemberController;