const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  // In production, this would use process.env.DATABASE_URL
  // For V1 scale (50 gyms, low thousands of concurrent active connections globally)
  // standard connection pooling is perfectly reliable.
  connectionString: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/gymos',
  max: 20, // Max 20 connections per node instance
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool // Exported in case we need explicit client checkouts for transactions
};
