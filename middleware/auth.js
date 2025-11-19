'use strict';

const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');

/**
 * Middleware to verify JWT token and attach user info to request
 * All routes using this middleware require a valid JWT token
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'No authorization header provided',
        code: 'NO_AUTH_HEADER'
      });
    }
    
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ 
        error: 'Invalid authorization format. Expected: Bearer <token>',
        code: 'INVALID_AUTH_FORMAT'
      });
    }

    const decoded = verifyToken(token);
    
    // Verify required fields in token
    if (!decoded.userId || !decoded.email) {
      return res.status(401).json({ 
        error: 'Token missing required user information',
        code: 'INVALID_TOKEN_PAYLOAD'
      });
    }
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    // Error from verifyToken will have specific message
    return res.status(401).json({ 
      error: error.message || 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
}

module.exports = {
  authenticate
};

