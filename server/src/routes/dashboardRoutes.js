const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');

const router = express.Router();

router.use(requireAuth);

// Reception can view basic dashboard stats (revenue might be hidden on frontend based on role)
// But to ensure absolute safety, we could create a separate endpoint for revenue.
// For V1 simplicity, we return all stats and let frontend hide revenue from reception, 
// OR we strictly lock this to MANAGER if revenue is highly sensitive.
// Given Indian gym context, Reception shouldn't see total monthly revenue.

router.get('/', requireRole('MANAGER'), DashboardController.getOverview);

module.exports = router;