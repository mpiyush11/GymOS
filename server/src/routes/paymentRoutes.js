const express = require('express');
const PaymentController = require('../controllers/paymentController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');
const { validateUUIDParam } = require('../utils/validators');

const router = express.Router();

router.use(requireAuth);

router.get('/', requireRole('RECEPTION'), PaymentController.getLedger);
router.post('/', requireRole('RECEPTION'), PaymentController.create);

router.post('/:id/void', validateUUIDParam('id'), requireRole('MANAGER'), PaymentController.voidPayment);

module.exports = router;