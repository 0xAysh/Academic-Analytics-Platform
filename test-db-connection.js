// Quick test script to check database connection
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  connectionTimeoutMillis: 5000,
});

console.log('Testing connection to:');
console.log(`  Host: ${process.env.PGHOST || 'localhost'}`);
console.log(`  Port: ${process.env.PGPORT || '5432'}`);
console.log(`  Database: ${process.env.PGDATABASE}`);
console.log(`  User: ${process.env.PGUSER}`);
console.log('');

pool.connect()
  .then(client => {
    console.log('✓ Connection successful!');
    return client.query('SELECT version()');
  })
  .then(result => {
    console.log('✓ PostgreSQL version:', result.rows[0].version.split(',')[0]);
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ Connection failed:');
    console.error('  Error:', err.message);
    console.error('  Code:', err.code);
    process.exit(1);
  });

