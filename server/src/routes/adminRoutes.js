const express = require('express');
const AdminController = require('../controllers/adminController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');
const { validateUUIDParam } = require('../utils/validators');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.get('/gyms', AdminController.getGyms);
router.put('/gyms/:id', validateUUIDParam('id'), AdminController.updateGym);

module.exports = router;