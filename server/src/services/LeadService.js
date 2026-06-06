const leadRepo = require('../repositories/LeadRepository');
const memberRepo = require('../repositories/MemberRepository');
const AuditService = require('./AuditService');
const db = require('../config/db'); // For transaction control

const VALID_LEAD_STATUSES = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'LOST'];
const VALID_SOURCES = ['WALK_IN', 'REFERRAL', 'WHATSAPP', 'INSTAGRAM', 'OTHER'];

class LeadService {
    
    static async createLead(gymId, userId, data) {
        // Enforce phone uniqueness per gym
        const existing = await leadRepo.findByPhone(gymId, data.phone);
        if (existing) {
            throw new Error('An active lead with this phone number already exists.');
        }

        const source = VALID_SOURCES.includes(data.source) ? data.source : 'WALK_IN';

        const newLead = await leadRepo.create(gymId, {
            name: data.name,
            phone: data.phone,
            status: 'NEW',
            source: source,
            next_followup: data.next_followup || null
        });

        await AuditService.log(gymId, userId, 'CREATE', 'LEAD', newLead.id, { source });

        return newLead;
    }

    static async getLeads(gymId, limit, offset) {
        return await leadRepo.findAll(gymId, limit, offset);
    }

    static async getLeadById(gymId, leadId) {
        const lead = await leadRepo.findById(gymId, leadId);
        if (!lead) throw new Error('Lead not found');
        return lead;
    }

    static async updateLead(gymId, userId, leadId, data) {
        const lead = await this.getLeadById(gymId, leadId);
        
        if (lead.status === 'CONVERTED') {
            throw new Error('Cannot update a converted lead.');
        }

        if (data.phone && data.phone !== lead.phone) {
            const existing = await leadRepo.findByPhone(gymId, data.phone);
            if (existing) throw new Error('Phone number is already in use by another lead.');
        }

        const updateData = {
            name: data.name || lead.name,
            phone: data.phone || lead.phone,
            next_followup: data.next_followup !== undefined ? data.next_followup : lead.next_followup
        };

        const updatedLead = await leadRepo.update(gymId, leadId, updateData);

        await AuditService.log(gymId, userId, 'UPDATE', 'LEAD', leadId, {
            old_data: { phone: lead.phone, followup: lead.next_followup },
            new_data: updateData
        });

        return updatedLead;
    }

    static async updateStatus(gymId, userId, leadId, newStatus) {
        const lead = await this.getLeadById(gymId, leadId);
        
        if (!VALID_LEAD_STATUSES.includes(newStatus)) {
            throw new Error('Invalid lead status');
        }

        if (lead.status === 'CONVERTED') {
            throw new Error('Cannot change status of a converted lead.');
        }

        // Standard status change (Not conversion)
        if (newStatus !== 'CONVERTED') {
            const updated = await leadRepo.update(gymId, leadId, { status: newStatus });
            await AuditService.log(gymId, userId, 'STATUS_CHANGE', 'LEAD', leadId, {
                old_status: lead.status,
                new_status: newStatus
            });
            return updated;
        } else {
            throw new Error('Please use the dedicated conversion endpoint to convert a lead.');
        }
    }

    /**
     * Converts a lead into a member securely using a database transaction.
     * Prevents partial failures (e.g. Lead marked converted, but member creation fails).
     */
    static async convertLead(gymId, userId, leadId, memberData) {
        const lead = await this.getLeadById(gymId, leadId);
        
        if (lead.status === 'CONVERTED') {
            throw new Error('Lead is already converted.');
        }

        const existingMember = await memberRepo.findByPhone(gymId, lead.phone);
        if (existingMember) {
            throw new Error('A member with this phone number already exists.');
        }

        // Database Transaction
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Create Member using raw query to ensure transaction safety
            const memberInsertQuery = `
                INSERT INTO members (gym_id, name, phone, registration_id, status, membership_end_date)
                VALUES ($1, $2, $3, $4, 'ACTIVE', $5)
                RETURNING id
            `;
            const memberResult = await client.query(memberInsertQuery, [
                gymId, lead.name, lead.phone, memberData.registration_id || null, memberData.membership_end_date
            ]);
            const newMemberId = memberResult.rows[0].id;

            // 2. Mark Lead as Converted
            const updateLeadQuery = `
                UPDATE leads SET status = 'CONVERTED', updated_at = CURRENT_TIMESTAMP 
                WHERE id = $1 AND gym_id = $2 AND status != 'CONVERTED'
                RETURNING id
            `;
            const updateResult = await client.query(updateLeadQuery, [leadId, gymId]);

            // Idempotency / Race Condition Check:
            // If rows returned is 0, it means another transaction ALREADY converted this lead
            // a fraction of a millisecond ago. We must rollback the member creation.
            if (updateResult.rows.length === 0) {
                await client.query('ROLLBACK');
                throw new Error('Race Condition: Lead was already converted by another user.');
            }

            await client.query('COMMIT');

            // 3. Fire Audit Logs (Outside transaction, non-fatal if they fail)
            await AuditService.log(gymId, userId, 'CONVERT', 'LEAD', leadId, { new_member_id: newMemberId });
            await AuditService.log(gymId, userId, 'CREATE_FROM_LEAD', 'MEMBER', newMemberId, { lead_id: leadId });

            return { lead_id: leadId, member_id: newMemberId };

        } catch (e) {
            await client.query('ROLLBACK');
            console.error('Lead Conversion Transaction Failed:', e);
            throw new Error('Lead conversion failed due to a system error.');
        } finally {
            client.release();
        }
    }
}

module.exports = LeadService;