/**
 * Sprint 2: Platform Bootstrap Script
 * Creates the Platform Admin and an initial Gym Owner for testing.
 */
const bcrypt = require('bcrypt');
const db = require('../config/db');

async function bootstrap() {
    console.log('Starting GymOS V1 Bootstrap...');
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Check if Platform Admin exists
        const adminCheck = await client.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['ADMIN']);
        if (adminCheck.rows.length === 0) {
            console.log('Creating Platform Admin...');
            const adminPassword = await bcrypt.hash('Admin@123', 12);
            await client.query(`
                INSERT INTO users (role, name, email, password_hash)
                VALUES ('ADMIN', 'System Admin', 'admin@gymos.in', $1)
            `, [adminPassword]);
        }

        // 2. Create a test Gym if none exists
        const gymCheck = await client.query('SELECT id FROM gyms LIMIT 1');
        let gymId;
        if (gymCheck.rows.length === 0) {
            console.log('Creating Demo Gym...');
            // Expiry date set to 30 days from now
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            
            const result = await client.query(`
                INSERT INTO gyms (name, phone, address, status, subscription_end_date)
                VALUES ('Iron Paradise Demo', '9999999999', 'Demo Address, India', 'ACTIVE', $1)
                RETURNING id
            `, [expiry]);
            gymId = result.rows[0].id;
        } else {
            gymId = gymCheck.rows[0].id;
        }

        // 3. Create a Gym Owner if none exists for that gym
        const ownerCheck = await client.query('SELECT id FROM users WHERE gym_id = $1 AND role = $2', [gymId, 'OWNER']);
        if (ownerCheck.rows.length === 0) {
            console.log('Creating Demo Gym Owner...');
            const ownerPassword = await bcrypt.hash('Owner@123', 12);
            await client.query(`
                INSERT INTO users (gym_id, role, name, email, phone, password_hash)
                VALUES ($1, 'OWNER', 'Demo Owner', 'owner@demo.gymos.in', '8888888888', $2)
            `, [gymId, ownerPassword]);
        }

        await client.query('COMMIT');
        console.log('Bootstrap completed successfully!');
        console.log('Admin Email: admin@gymos.in | Pass: Admin@123');
        console.log('Owner Email: owner@demo.gymos.in | Pass: Owner@123');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Bootstrap failed:', e);
    } finally {
        client.release();
        process.exit(0);
    }
}

if (require.main === module) {
    bootstrap();
}

module.exports = bootstrap;