const express = require('express');
const AttendanceController = require('../controllers/attendanceController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');
const { validateUUIDParam } = require('../utils/validators');

const router = express.Router();

router.use(requireAuth);

router.post('/checkin', requireRole('RECEPTION'), AttendanceController.checkIn);
router.get('/history', requireRole('RECEPTION'), AttendanceController.getHistory);
router.get('/member/:member_id', validateUUIDParam('member_id'), requireRole('RECEPTION'), AttendanceController.getMemberHistory);

module.exports = router;