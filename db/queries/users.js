'use strict';

const pool = require('../../config/database');

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

module.exports = {
  createUser,
  getUserByEmail,
  getUserById
};

