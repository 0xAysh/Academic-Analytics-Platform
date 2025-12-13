'use strict';

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '4h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

/**
 * @param {number} userId
 * @param {string} email
 * @returns {string}
 */
function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * @param {string} token
 * @returns {object}
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token is required');
  }
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
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
 * @param {string} authHeader
 * @returns {string|null}
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }
  
  const bearerPrefix = 'Bearer ';
  const lowerHeader = authHeader.toLowerCase();
  const lowerPrefix = bearerPrefix.toLowerCase();
  
  if (!lowerHeader.startsWith(lowerPrefix)) {
    return null;
  }
  
  return authHeader.substring(bearerPrefix.length);
}

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader
};
