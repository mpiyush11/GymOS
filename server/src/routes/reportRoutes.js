const express = require('express');
const ReportController = require('../controllers/reportController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');

const router = express.Router();

router.use(requireAuth);

// Strict financial RBAC
router.get('/revenue/export', requireRole('OWNER'), ReportController.exportRevenue);

// Manager can view expiring members to make sales calls
router.get('/members/expiring', requireRole('MANAGER'), ReportController.getExpiring);

module.exports = router;