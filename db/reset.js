#!/usr/bin/env node
'use strict';

require('dotenv').config();
const pool = require('./pool');
const fs = require('fs');
const path = require('path');

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔄 Starting database reset...\n');
    
    await client.query('BEGIN');
    
    console.log('Dropping existing tables...');
    
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
    
    const migrations = ['001_initial_schema.sql'];
    
    for (const migrationFile of migrations) {
      const migrationPath = path.join(__dirname, 'migrations', migrationFile);
      if (fs.existsSync(migrationPath)) {
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        await client.query(migrationSQL);
        console.log(`  ✓ Executed migration: ${migrationFile}`);
      } else {
        console.log(`  ⚠ Migration file not found: ${migrationFile}`);
      }
    }
    
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
    
    await client.query('COMMIT');
    
    console.log('\n✅ Database reset completed successfully!\n');
    console.log('All tables have been dropped and recreated.');
    console.log('The database is now ready for fresh data.\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error resetting database:', error.message);
    console.error('  Stack:', error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to reset database:', error);
    process.exit(1);
  });
