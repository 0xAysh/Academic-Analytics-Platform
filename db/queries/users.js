'use strict';

const pool = require('../pool');

/**
 * @param {string} email
 * @param {string} passwordHash
 * @param {string} name
 * @returns {Promise<object>}
 */
async function createUser(email, passwordHash, name) {
  const query = `
    INSERT INTO users (email, password_hash, name)
    VALUES ($1, $2, $3)
    RETURNING id, email, name
  `;
  const result = await pool.query(query, [email, passwordHash, name]);
  return result.rows[0];
}

/**
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function getUserByEmail(email) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}

/**
 * @param {number} userId
 * @returns {Promise<object|null>}
 */
async function getUserById(userId) {
  const query = 'SELECT id, email, name FROM users WHERE id = $1';
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
}

/**
 * @param {number} userId
 * @param {string} email
 * @param {string} name
 * @returns {Promise<object>}
 */
async function updateUserProfile(userId, email, name) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    if (email) {
      const existingUser = await getUserByEmail(email.trim().toLowerCase());
      if (existingUser && existingUser.id !== userId) {
        await client.query('ROLLBACK');
        throw new Error('Email already exists');
      }
    }
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (email) {
      updates.push(`email = $${paramCount}`);
      values.push(email.trim().toLowerCase());
      paramCount++;
    }
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name ? name.trim() : null);
      paramCount++;
    }
    
    if (updates.length === 0) {
      await client.query('ROLLBACK');
      throw new Error('No fields to update');
    }
    
    values.push(userId);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, name
    `;
    
    const result = await client.query(query, values);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      throw new Error('User not found');
    }
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * @param {number} userId
 * @param {string} newPasswordHash
 * @returns {Promise<void>}
 */
async function updateUserPassword(userId, newPasswordHash) {
  const query = `
    UPDATE users 
    SET password_hash = $1
    WHERE id = $2
  `;
  const result = await pool.query(query, [newPasswordHash, userId]);
  
  if (result.rowCount === 0) {
    throw new Error('User not found');
  }
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserProfile,
  updateUserPassword
};
