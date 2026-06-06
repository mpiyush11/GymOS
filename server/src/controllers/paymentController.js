const PaymentService = require('../services/PaymentService');

class PaymentController {
    
    static async create(req, res) {
        try {
            const { gym_id, id: user_id } = req.user;
            const { member_id, amount, payment_mode, idempotency_key, new_end_date } = req.body;

            if (!member_id || amount === undefined || !payment_mode || !idempotency_key || !new_end_date) {
                return res.status(400).json({ error: 'Missing required payment fields' });
            }

            // FIX 1: Zero / Invalid Amount Protection
            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 99999999) {
                return res.status(400).json({ error: 'Amount must be greater than zero and within reasonable limits' });
            }

            // Pass parsed amount to service to ensure no string injection bypasses DB typing weirdly
            const safePayload = { ...req.body, amount: parsedAmount };

            const payment = await PaymentService.processPayment(gym_id, user_id, safePayload);
            res.status(201).json({ message: 'Payment recorded successfully', payment });
        } catch (error) {
            console.error('Create Payment Error:', error);
            if (error.message.includes('Invalid payment method') || error.message.includes('not found')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async voidPayment(req, res) {
        try {
            const { gym_id, id: user_id } = req.user;
            const { void_reason } = req.body;

            const voided = await PaymentService.voidPayment(gym_id, user_id, req.params.id, void_reason);
            res.status(200).json({ message: 'Payment successfully voided', payment: voided });
        } catch (error) {
            console.error('Void Payment Error:', error);
            res.status(400).json({ error: error.message });
        }
    }

    static async getLedger(req, res) {
        try {
            const { gym_id } = req.user;
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;

            const payments = await PaymentService.getPayments(gym_id, limit, offset);
            res.status(200).json({ payments });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = PaymentController;