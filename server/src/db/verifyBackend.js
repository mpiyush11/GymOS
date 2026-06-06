const { pool } = require('../config/db');
const runMigrations = require('./runMigrations');
const bootstrap = require('../utils/bootstrap');
const fs = require('fs');
const path = require('path');

async function verifyBackend() {
    console.log('--- STARTING BACKEND VERIFICATION ---');
    try {
        // 1. Verify DB Connection
        const client = await pool.connect();
        console.log('[OK] Database Connection');
        client.release();

        // 2. Verify Migrations
        await runMigrations();
        console.log('[OK] Migrations Executed/Verified');

        // 3. Verify Bootstrap
        await bootstrap();
        console.log('[OK] Bootstrap Executed/Verified');

        // 4. Verify Route Compilation (Checks for missing requires/syntax errors)
        const app = require('../app');
        console.log('[OK] Express App Compilation');

        console.log('--- VERIFICATION SUCCESSFUL ---');
        process.exit(0);
    } catch (e) {
        console.error('--- VERIFICATION FAILED ---', e);
        process.exit(1);
    }
}

verifyBackend();