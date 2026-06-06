/**
 * RBAC Middleware Factory
 * Enforces route access based on req.user.role.
 * Assumes requireAuth has already run.
 */

const ROLE_HIERARCHY = {
    'ADMIN': 4,      // Platform Admin (Global)
    'OWNER': 3,      // Gym Owner
    'MANAGER': 2,    // Gym Manager
    'RECEPTION': 1   // Gym Receptionist
};

const requireRole = (minimumRole) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // SECURITY FIX #4: Platform Admin must not inherit tenant role access
        if (req.user.role === 'ADMIN' && minimumRole !== 'ADMIN') {
            return res.status(403).json({ 
                error: 'Forbidden', 
                message: 'Platform Admins cannot access tenant-specific operations.' 
            });
        }

        // Reverse protection: Gym roles cannot access Admin routes
        if (req.user.role !== 'ADMIN' && minimumRole === 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
        const requiredRoleLevel = ROLE_HIERARCHY[minimumRole] || 99;

        if (userRoleLevel < requiredRoleLevel) {
            return res.status(403).json({ 
                error: 'Forbidden', 
                message: `Requires ${minimumRole} access or higher.` 
            });
        }

        next();
    };
};

module.exports = requireRole;