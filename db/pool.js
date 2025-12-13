'use strict';

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

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
  });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
