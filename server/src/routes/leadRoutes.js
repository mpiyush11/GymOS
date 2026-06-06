const express = require('express');
const LeadController = require('../controllers/leadController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');
const { validateUUIDParam } = require('../utils/validators');

const router = express.Router();

router.use(requireAuth);

router.get('/', requireRole('RECEPTION'), LeadController.getAll);
router.get('/:id', validateUUIDParam('id'), requireRole('RECEPTION'), LeadController.getById);
router.post('/', requireRole('RECEPTION'), LeadController.create);
router.put('/:id', validateUUIDParam('id'), requireRole('RECEPTION'), LeadController.update);
router.patch('/:id/status', validateUUIDParam('id'), requireRole('RECEPTION'), LeadController.changeStatus);

router.post('/:id/convert', validateUUIDParam('id'), requireRole('MANAGER'), LeadController.convert);

module.exports = router;