'use strict';

const pool = require('../pool');
const crypto = require('crypto');

/**
 * @param {number} userId
 * @param {number} expiresInHours
 * @returns {Promise<string>}
 */
async function createResetToken(userId, expiresInHours = 1) {
  const token = crypto.randomBytes(32).toString('hex');
  
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);
  
  await pool.query(
    'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE',
    [userId]
  );
  
  const query = `
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING token
  `;
  const result = await pool.query(query, [userId, token, expiresAt]);
  
  return result.rows[0].token;
}

/**
 * @param {string} token
 * @returns {Promise<object|null>}
 */
async function verifyResetToken(token) {
  const query = `
    SELECT prt.user_id, prt.expires_at, prt.used, u.email
    FROM password_reset_tokens prt
    JOIN users u ON prt.user_id = u.id
    WHERE prt.token = $1
    AND prt.used = FALSE
    AND prt.expires_at > NOW()
  `;
  const result = await pool.query(query, [token]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

/**
 * @param {string} token
 * @returns {Promise<void>}
 */
async function markTokenAsUsed(token) {
  await pool.query(
    'UPDATE password_reset_tokens SET used = TRUE WHERE token = $1',
    [token]
  );
}

module.exports = {
  createResetToken,
  verifyResetToken,
  markTokenAsUsed
};
