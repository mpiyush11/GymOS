const express = require('express');
const MemberController = require('../controllers/memberController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');
const { validateUUIDParam } = require('../utils/validators');

const router = express.Router();

router.use(requireAuth);

router.get('/', requireRole('RECEPTION'), MemberController.getAll);
router.get('/:id', validateUUIDParam('id'), requireRole('RECEPTION'), MemberController.getById);
router.post('/', requireRole('RECEPTION'), MemberController.create);

router.put('/:id', validateUUIDParam('id'), requireRole('MANAGER'), MemberController.update);
router.patch('/:id/status', validateUUIDParam('id'), requireRole('MANAGER'), MemberController.changeStatus);
router.post('/:id/renew', validateUUIDParam('id'), requireRole('MANAGER'), MemberController.renew);

module.exports = router;