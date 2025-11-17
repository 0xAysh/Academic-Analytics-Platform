'use strict';

const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');

/**
 * Middleware to verify JWT token and attach user info to request
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: error.message || 'Invalid token' });
  }
}

module.exports = {
  authenticate
};

