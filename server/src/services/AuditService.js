const BaseRepository = require('../repositories/BaseRepository');

class AuditService {
    static async log(gymId, userId, action, entity, entityId, details = {}) {
        const repo = new BaseRepository('audit_logs');
        try {
            await repo.create(gymId, {
                user_id: userId,
                action,
                entity,
                entity_id: entityId,
                details: JSON.stringify(details)
            });
        } catch (error) {
            // We log but do not throw to prevent crashing the main transaction
            // in non-critical paths, though in a strict system we might want to.
            console.error('CRITICAL: Failed to write audit log', error);
        }
    }
}

module.exports = AuditService;