'use strict';

const pool = require('../pool');

/**
 * Create a new user
 * @param {string} email - User email
 * @param {string} passwordHash - Hashed password
 * @param {string} name - User name
 * @returns {Promise<object>} Created user (without password)
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
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<object|null>} User object or null
 */
async function getUserByEmail(email) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<object|null>} User object or null
 */
async function getUserById(userId) {
  const query = 'SELECT id, email, name FROM users WHERE id = $1';
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
}

/**
 * Update user profile (email and/or name)
 * @param {number} userId - User ID
 * @param {string} email - New email (optional)
 * @param {string} name - New name (optional)
 * @returns {Promise<object>} Updated user (without password)
 * @throws {Error} If update fails or email already exists
 */
async function updateUserProfile(userId, email, name) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // If email is being changed, check if it already exists
    if (email) {
      const existingUser = await getUserByEmail(email.trim().toLowerCase());
      if (existingUser && existingUser.id !== userId) {
        await client.query('ROLLBACK');
        throw new Error('Email already exists');
      }
    }
    
    // Build update query dynamically based on what's being updated
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
 * Update user password
 * @param {number} userId - User ID
 * @param {string} newPasswordHash - New hashed password
 * @returns {Promise<void>}
 * @throws {Error} If update fails
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

