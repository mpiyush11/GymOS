const paymentRepo = require('../repositories/PaymentRepository');
const memberRepo = require('../repositories/MemberRepository');
const AuditService = require('./AuditService');
const db = require('../config/db');

const VALID_PAYMENT_METHODS = ['CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'OTHER'];

class PaymentService {

    static async processPayment(gymId, userId, payload) {
        const { member_id, amount, payment_mode, idempotency_key, new_end_date } = payload;

        // 1. Enum Validation
        if (!VALID_PAYMENT_METHODS.includes(payment_mode)) {
            throw new Error(`Invalid payment method. Allowed: ${VALID_PAYMENT_METHODS.join(', ')}`);
        }

        // 2. Tenant Isolation & Member Validation
        const member = await memberRepo.findById(gymId, member_id);
        if (!member) {
            throw new Error('Member not found in this gym.');
        }

        // 3. Idempotency Check (Application level before DB level)
        const existingPayment = await paymentRepo.findByIdempotencyKey(gymId, idempotency_key);
        if (existingPayment) {
            return existingPayment; // Silently return success to the frontend
        }

        // 4. Strict DB Transaction
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // Insert Payment
            const paymentInsertQuery = `
                INSERT INTO payments (gym_id, member_id, amount, payment_mode, idempotency_key, created_by, status)
                VALUES ($1, $2, $3, $4, $5, $6, 'SUCCESS')
                RETURNING *
            `;
            const paymentResult = await client.query(paymentInsertQuery, [
                gymId, member_id, amount, payment_mode, idempotency_key, userId
            ]);
            const newPayment = paymentResult.rows[0];

            // Update Member End Date (Notice: We DO NOT change status/unfreeze)
            const memberUpdateQuery = `
                UPDATE members 
                SET membership_end_date = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2 AND gym_id = $3
            `;
            await client.query(memberUpdateQuery, [new_end_date, member_id, gymId]);

            await client.query('COMMIT');

            // Audit Logging
            await AuditService.log(gymId, userId, 'PAYMENT_CREATE', 'PAYMENT', newPayment.id, { amount, payment_mode });
            await AuditService.log(gymId, userId, 'PAYMENT_RENEWAL', 'MEMBER', member_id, {
                old_end_date: member.membership_end_date,
                new_end_date: new_end_date,
                payment_id: newPayment.id
            });

            return newPayment;
        } catch (e) {
            await client.query('ROLLBACK');
            // Catch DB-level idempotency collision if it sneaks past the app-level check
            if (e.constraint === 'payments_gym_id_idempotency_key_key') {
                return await paymentRepo.findByIdempotencyKey(gymId, idempotency_key);
            }
            console.error('Payment Transaction Failed:', e);
            throw new Error('Payment processing failed due to a system error.');
        } finally {
            client.release();
        }
    }

    static async voidPayment(gymId, userId, paymentId, voidReason) {
        if (!voidReason || voidReason.trim() === '') {
            throw new Error('A void reason is required.');
        }

        // FIX 2 & 5: VOID TRANSACTION ATOMIC SAFETY & SAFE FAILURE BEHAVIOR
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const voidQuery = `
                UPDATE payments 
                SET status = 'VOID', void_reason = $1, voided_by = $2, voided_at = CURRENT_TIMESTAMP
                WHERE id = $3 AND gym_id = $4 AND status = 'SUCCESS'
                RETURNING *
            `;
            const result = await client.query(voidQuery, [voidReason, userId, paymentId, gymId]);
            const voidedPayment = result.rows[0];

            if (!voidedPayment) {
                await client.query('ROLLBACK');
                throw new Error('Payment not found or already voided.');
            }

            // We must explicitly write the audit log using the active client transaction, 
            // not the separate AuditService connection pool, to guarantee ACID safety.
            const auditQuery = `
                INSERT INTO audit_logs (gym_id, user_id, action, entity, entity_id, details)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            await client.query(auditQuery, [
                gymId, 
                userId, 
                'PAYMENT_VOID', 
                'PAYMENT', 
                paymentId, 
                JSON.stringify({ amount: voidedPayment.amount, reason: voidReason })
            ]);

            await client.query('COMMIT');
            return voidedPayment;
        } catch (e) {
            await client.query('ROLLBACK');
            console.error('Void Payment Transaction Failed:', e);
            throw new Error(e.message.includes('A void reason') || e.message.includes('not found') ? e.message : 'System error during void.');
        } finally {
            client.release();
        }
    }

    static async getPayments(gymId, limit = 100, offset = 0) {
        const query = `
            SELECT p.id, p.amount, p.payment_mode, p.status, p.transaction_date, 
                   m.name as member_name, m.phone as member_phone, u.name as collected_by
            FROM payments p
            JOIN members m ON p.member_id = m.id
            LEFT JOIN users u ON p.created_by = u.id
            WHERE p.gym_id = $1
            ORDER BY p.transaction_date DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await db.query(query, [gymId, limit, offset]);
        return result.rows;
    }
}

module.exports = PaymentService;