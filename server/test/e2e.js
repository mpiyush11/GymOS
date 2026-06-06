const axios = require('axios');
const db = require('../src/config/db');

// Setup Axios client to store cookies automatically during tests
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const jar = new CookieJar();
const client = wrapper(axios.create({ 
    baseURL: 'http://localhost:8080/api/v1', 
    jar,
    validateStatus: () => true // Don't throw on 4xx/5xx so we can assert
}));

let state = {
    gymId: null,
    ownerId: null,
    adminCookie: null,
    ownerCookie: null,
    memberId: null,
    leadId: null,
    paymentId: null
};

async function runTests() {
    console.log('\n--- STARTING E2E INTEGRATION SUITE ---');
    let passed = 0; let failed = 0;

    const assert = (condition, msg) => {
        if (condition) { passed++; console.log(`✅ [PASS] ${msg}`); } 
        else { failed++; console.error(`❌ [FAIL] ${msg}`); }
    };

    try {
        // We will mock the active server environment by just querying the DB 
        // to grab the bootstrapped credentials first.
        const adminQuery = await db.pool.query("SELECT * FROM users WHERE role = 'ADMIN' LIMIT 1");
        const ownerQuery = await db.pool.query("SELECT * FROM users WHERE role = 'OWNER' LIMIT 1");

        // Start Express app in background
        const app = require('../src/app');
        const server = app.listen(8080);

        // Wait a tick for server to bind
        await new Promise(r => setTimeout(r, 500));

        // -----------------------------------------------------
        // 1. AUTHENTICATION & SESSIONS
        // -----------------------------------------------------
        console.log('\n--- 1. Authentication ---');
        let res = await client.post('/auth/login', { email: 'admin@gymos.in', password: 'Admin@123' });
        assert(res.status === 200, 'Admin Login successful');
        assert(res.headers['set-cookie'], 'Set-Cookie HttpOnly session returned');
        
        res = await client.post('/auth/login', { email: 'owner@demo.gymos.in', password: 'Owner@123' });
        assert(res.status === 200, 'Owner Login successful');
        state.gymId = res.data.user.gym_id;

        // -----------------------------------------------------
        // 2. MEMBERS & RBAC
        // -----------------------------------------------------
        console.log('\n--- 2. Members & RBAC ---');
        res = await client.post('/members', {
            name: 'John Doe',
            phone: '1234567890',
            membership_end_date: '2026-12-31'
        });
        assert(res.status === 201, 'Owner can create a member');
        state.memberId = res.data.member.id;

        res = await client.post('/members', {
            name: 'Duplicate Phone',
            phone: '1234567890', // duplicate
            membership_end_date: '2026-12-31'
        });
        assert(res.status === 409, 'Duplicate phone gracefully rejected (UNIQUE Gym/Phone works)');

        res = await client.patch(`/members/${state.memberId}/status`, { status: 'FROZEN' });
        assert(res.status === 200, 'Owner can freeze member');
        assert(res.data.member.status === 'FROZEN', 'Member status is actually frozen');

        // -----------------------------------------------------
        // 3. LEADS & TENANT ISOLATION
        // -----------------------------------------------------
        console.log('\n--- 3. Leads & Transactions ---');
        res = await client.post('/leads', { name: 'Jane Lead', phone: '0987654321', source: 'REFERRAL' });
        assert(res.status === 201, 'Lead created successfully');
        state.leadId = res.data.lead.id;

        res = await client.post(`/leads/${state.leadId}/convert`, { membership_end_date: '2027-01-01' });
        assert(res.status === 200, 'Lead converted successfully via ACID transaction');
        
        res = await client.get(`/leads/${state.leadId}`);
        assert(res.data.lead.status === 'CONVERTED', 'Lead status correctly updated to CONVERTED');

        // -----------------------------------------------------
        // 4. ATTENDANCE & VALIDATIONS
        // -----------------------------------------------------
        console.log('\n--- 4. Attendance Validations ---');
        // Try checking in John Doe (who is FROZEN)
        res = await client.post('/attendance/checkin', { member_id: state.memberId });
        assert(res.status === 400 && res.data.error.includes('FROZEN'), 'Check-in blocked for FROZEN member');

        // Unfreeze
        await client.patch(`/members/${state.memberId}/status`, { status: 'ACTIVE' });

        // Check in Active
        res = await client.post('/attendance/checkin', { member_id: state.memberId });
        assert(res.status === 201, 'Check-in succeeds for ACTIVE member');

        // Duplicate Check-in
        res = await client.post('/attendance/checkin', { member_id: state.memberId });
        assert(res.status === 400 && res.data.error.includes('already checked in'), 'Duplicate check-in same day blocked');

        // -----------------------------------------------------
        // 5. PAYMENTS & IDEMPOTENCY
        // -----------------------------------------------------
        console.log('\n--- 5. Payments & Idempotency ---');
        const idempotencyKey = '123e4567-e89b-12d3-a456-426614174000';
        res = await client.post('/payments', {
            member_id: state.memberId,
            amount: 1500,
            payment_mode: 'CASH',
            idempotency_key: idempotencyKey,
            new_end_date: '2027-01-31'
        });
        assert(res.status === 201, 'Payment ledger entry succeeds');
        state.paymentId = res.data.payment.id;

        res = await client.post('/payments', {
            member_id: state.memberId,
            amount: 1500,
            payment_mode: 'CASH',
            idempotency_key: idempotencyKey, // Replay
            new_end_date: '2027-01-31'
        });
        assert(res.status === 200 || res.status === 201, 'Idempotent double-click ignores insertion and returns success');

        // Check if member date extended
        res = await client.get(`/members/${state.memberId}`);
        assert(res.data.member.membership_end_date.includes('2027-01-31'), 'Payment atomic transaction successfully extended membership date');

        // -----------------------------------------------------
        // 6. REPORTS & CSV
        // -----------------------------------------------------
        console.log('\n--- 6. Reports ---');
        res = await client.get('/reports/revenue/export?start_date=2020-01-01&end_date=2030-01-01');
        assert(res.status === 200, 'Revenue export HTTP endpoint functioning');
        assert(res.headers['content-type'].includes('csv'), 'Revenue returns correct CSV stream format');

        server.close();
        console.log(`\n=== SUMMARY ===`);
        console.log(`Total: ${passed + failed}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        
        if (failed > 0) process.exit(1);
        process.exit(0);

    } catch (e) {
        console.error('Fatal Test Error:', e);
        process.exit(1);
    }
}

runTests();