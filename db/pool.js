'use strict';

/**
 * PostgreSQL connection pool
 * Uses environment variables as specified in requirements:
 * DB_USER, DB_PASS, DB_NAME, DB_HOST, DB_PORT
 */

const { Pool } = require('pg');
require('dotenv').config();

// Validate required environment variables
const requiredVars = ['DB_USER', 'DB_PASS', 'DB_NAME', 'DB_HOST'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file');
  console.error('Required variables: DB_USER, DB_PASS, DB_NAME, DB_HOST, DB_PORT (optional, defaults to 5432)');
}

// Create PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection on startup
pool.connect()
  .then(client => {
    console.log('✓ Connected to PostgreSQL database');
    console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`  Database: ${process.env.DB_NAME}`);
    console.log(`  User: ${process.env.DB_USER}`);
    client.release();
  })
  .catch(err => {
    console.error('✗ Failed to connect to PostgreSQL database');
    console.error('  Error:', err.message);
    console.error('  Code:', err.code);
    console.error('\n  Troubleshooting:');
    console.error('  1. Check if PostgreSQL is running');
    console.error('  2. Verify .env file has correct connection details');
    console.error('  3. Required variables: DB_USER, DB_PASS, DB_NAME, DB_HOST, DB_PORT');
    // Don't exit - let the app start but API calls will fail gracefully
  });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit on idle client errors - just log them
});

module.exports = pool;

