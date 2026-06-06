const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
    console.log('Starting DB migrations...');
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Ensure migrations tracking table exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir).sort();

        for (const file of files) {
            if (!file.endsWith('.sql')) continue;

            const { rows } = await client.query(
                'SELECT id FROM schema_migrations WHERE migration_name = $1',
                [file]
            );

            if (rows.length === 0) {
                console.log(`Executing migration: ${file}`);
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
                await client.query(sql);
                await client.query(
                    'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
                    [file]
                );
                console.log(`Successfully applied: ${file}`);
            } else {
                console.log(`Skipping already applied migration: ${file}`);
            }
        }
        
        await client.query('COMMIT');
        console.log('All migrations applied successfully.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed. Rolled back.', e);
        process.exit(1);
    } finally {
        client.release();
    }
}

// Run if called directly
if (require.main === module) {
    runMigrations().then(() => process.exit(0));
}

module.exports = runMigrations;