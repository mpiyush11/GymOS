const memberRepo = require('../repositories/MemberRepository');
const AuditService = require('./AuditService');

class MemberService {
    
    static async createMember(gymId, userId, data) {
        // Enforce phone uniqueness per gym
        const existing = await memberRepo.findByPhone(gymId, data.phone);
        if (existing) {
            throw new Error('A member with this phone number already exists in this gym.');
        }

        const newMember = await memberRepo.create(gymId, {
            name: data.name,
            phone: data.phone,
            registration_id: data.registration_id || null,
            status: 'ACTIVE',
            membership_end_date: data.membership_end_date
        });

        await AuditService.log(gymId, userId, 'CREATE', 'MEMBER', newMember.id, {
            initial_end_date: data.membership_end_date
        });

        return newMember;
    }

    static async getMembers(gymId, limit, offset) {
        return await memberRepo.findAll(gymId, limit, offset);
    }

    static async getMemberById(gymId, memberId) {
        const member = await memberRepo.findById(gymId, memberId);
        if (!member) throw new Error('Member not found');
        return member;
    }

    static async updateMember(gymId, userId, memberId, data) {
        const member = await this.getMemberById(gymId, memberId);
        
        // Prevent phone duplication if changing phone
        if (data.phone && data.phone !== member.phone) {
            const existing = await memberRepo.findByPhone(gymId, data.phone);
            if (existing) throw new Error('Phone number is already in use by another member.');
        }

        // Strip out fields that shouldn't be updated via standard update (like end_date, status)
        const updateData = {
            name: data.name || member.name,
            phone: data.phone || member.phone,
            registration_id: data.registration_id !== undefined ? data.registration_id : member.registration_id
        };

        const updatedMember = await memberRepo.update(gymId, memberId, updateData);

        await AuditService.log(gymId, userId, 'UPDATE', 'MEMBER', memberId, {
            old_data: { name: member.name, phone: member.phone },
            new_data: updateData
        });

        return updatedMember;
    }

    static async updateStatus(gymId, userId, memberId, newStatus) {
        const member = await this.getMemberById(gymId, memberId);
        
        if (member.status === newStatus) return member;

        const updated = await memberRepo.update(gymId, memberId, { status: newStatus });

        await AuditService.log(gymId, userId, 'STATUS_CHANGE', 'MEMBER', memberId, {
            old_status: member.status,
            new_status: newStatus
        });

        return updated;
    }

    static async renewMember(gymId, userId, memberId, newEndDate) {
        const member = await this.getMemberById(gymId, memberId);

        // In Sprint 6 (Payments), this flow will also require payment creation.
        // For now, we update the date and log it immutably to preserve history.
        const updated = await memberRepo.update(gymId, memberId, {
            membership_end_date: newEndDate,
            status: 'ACTIVE' // Auto-unfreeze or auto-activate on renew
        });

        await AuditService.log(gymId, userId, 'RENEW', 'MEMBER', memberId, {
            old_end_date: member.membership_end_date,
            new_end_date: newEndDate
        });

        return updated;
    }
}

module.exports = MemberService;