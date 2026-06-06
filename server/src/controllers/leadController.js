const LeadService = require('../services/LeadService');

class LeadController {
    
    static async create(req, res) {
        try {
            const { gym_id, id: user_id } = req.user;
            const data = req.body;

            if (!data.name || !data.phone) {
                return res.status(400).json({ error: 'Name and phone are required' });
            }

            const lead = await LeadService.createLead(gym_id, user_id, data);
            res.status(201).json({ message: 'Lead created successfully', lead });
        } catch (error) {
            if (error.message.includes('already exists')) {
                return res.status(409).json({ error: error.message });
            }
            console.error('Create Lead Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async getAll(req, res) {
        try {
            const { gym_id } = req.user;
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;

            const leads = await LeadService.getLeads(gym_id, limit, offset);
            res.status(200).json({ leads });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async getById(req, res) {
        try {
            const { gym_id } = req.user;
            const lead = await LeadService.getLeadById(gym_id, req.params.id);
            res.status(200).json({ lead });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { gym_id, id: user_id } = req.user;
            const updated = await LeadService.updateLead(gym_id, user_id, req.params.id, req.body);
            res.status(200).json({ message: 'Lead updated', lead: updated });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async changeStatus(req, res) {
        try {
            const { gym_id, id: user_id } = req.user;
            const { status } = req.body;

            const updated = await LeadService.updateStatus(gym_id, user_id, req.params.id, status);
            res.status(200).json({ message: `Lead marked as ${status}`, lead: updated });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async convert(req, res) {
        try {
            const { gym_id, id: user_id } = req.user;
            const { membership_end_date, registration_id } = req.body;

            if (!membership_end_date) {
                return res.status(400).json({ error: 'membership_end_date is required to convert a lead to a member' });
            }

            const result = await LeadService.convertLead(gym_id, user_id, req.params.id, {
                membership_end_date,
                registration_id
            });
            
            res.status(200).json({ message: 'Lead successfully converted to Member', result });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = LeadController;