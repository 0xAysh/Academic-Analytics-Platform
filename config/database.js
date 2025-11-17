'use strict';

const { Pool } = require('pg');
require('dotenv').config();

// Validate required environment variables
const requiredVars = ['PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file');
}

// Create PostgreSQL connection pool using standard environment variables
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Increased timeout for remote connections
});

// Test connection on startup
pool.connect()
  .then(client => {
    console.log('✓ Connected to PostgreSQL database');
    console.log(`  Host: ${process.env.PGHOST || 'localhost'}`);
    console.log(`  Database: ${process.env.PGDATABASE}`);
    console.log(`  User: ${process.env.PGUSER}`);
    client.release();
  })
  .catch(err => {
    console.error('✗ Failed to connect to PostgreSQL database');
    console.error('  Error:', err.message);
    console.error('  Code:', err.code);
    console.error('\n  Troubleshooting:');
    console.error('  1. Check if PostgreSQL is running');
    console.error('  2. Verify .env file has correct connection details');
    console.error('  3. If connecting to remote VM, check network/firewall settings');
    console.error('  4. Verify PostgreSQL is configured to accept connections');
    // Don't exit - let the app start but API calls will fail gracefully
  });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit on idle client errors - just log them
});

module.exports = pool;

