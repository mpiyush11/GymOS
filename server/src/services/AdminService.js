const gymRepo = require('../repositories/GymRepository');
const db = require('../config/db');

class AdminService {
    static async getAllGyms() {
        return await gymRepo.findAllGyms();
    }

    static async updateGymLifecycle(gymId, status, subscriptionEndDate) {
        const validStatuses = ['ACTIVE', 'GRACE', 'RESTRICTED', 'DISABLED'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        const updatedGym = await gymRepo.updateGymStatus(gymId, status, subscriptionEndDate);
        if (!updatedGym) throw new Error('Gym not found');
        return updatedGym;
    }
}

module.exports = AdminService;