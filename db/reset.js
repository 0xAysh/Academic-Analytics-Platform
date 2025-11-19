#!/usr/bin/env node
'use strict';

/**
 * Database Reset Script
 * Drops all tables and recreates them from migration
 * 
 * Usage: node db/reset.js
 * 
 * WARNING: This will delete all data in the database!
 */

require('dotenv').config();
const pool = require('./pool');
const fs = require('fs');
const path = require('path');

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔄 Starting database reset...\n');
    
    // Start transaction
    await client.query('BEGIN');
    
    console.log('Dropping existing tables...');
    
    // Drop tables in reverse order of dependencies (children first, then parents)
    const dropQueries = [
      'DROP TABLE IF EXISTS courses CASCADE',
      'DROP TABLE IF EXISTS terms CASCADE',
      'DROP TABLE IF EXISTS transcripts CASCADE',
      'DROP TABLE IF EXISTS users CASCADE'
    ];
    
    for (const query of dropQueries) {
      await client.query(query);
      const tableName = query.match(/DROP TABLE IF EXISTS (\w+)/)[1];
      console.log(`  ✓ Dropped table: ${tableName}`);
    }
    
    console.log('\nCreating tables from migration...');
    
    // Read and execute migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    await client.query(migrationSQL);
    console.log('  ✓ Executed migration: 001_initial_schema.sql');
    
    // Verify tables were created
    console.log('\nVerifying tables...');
    const tables = ['users', 'transcripts', 'terms', 'courses'];
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table]);
      
      if (result.rows[0].exists) {
        console.log(`  ✓ Table exists: ${table}`);
      } else {
        throw new Error(`Table ${table} was not created!`);
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n✅ Database reset completed successfully!\n');
    console.log('All tables have been dropped and recreated.');
    console.log('The database is now ready for fresh data.\n');
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('\n❌ Error resetting database:', error.message);
    console.error('  Stack:', error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
resetDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to reset database:', error);
    process.exit(1);
  });

