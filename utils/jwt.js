'use strict';

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '4h'; // 4 hours

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

/**
 * Generate JWT token for user
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @returns {string} JWT token
 */
function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token is required');
  }
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // Provide more specific error messages
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired. Please log in again.');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token format');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not yet valid');
    } else {
      throw new Error('Invalid or expired token');
    }
  }
}

/**
 * Extract token from Authorization header
 * Case-insensitive check for "Bearer" prefix
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }
  
  // Case-insensitive check for "Bearer " prefix
  const bearerPrefix = 'Bearer ';
  const lowerHeader = authHeader.toLowerCase();
  const lowerPrefix = bearerPrefix.toLowerCase();
  
  if (!lowerHeader.startsWith(lowerPrefix)) {
    return null;
  }
  
  // Extract token (preserve original case of token itself)
  return authHeader.substring(bearerPrefix.length);
}

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader
};

