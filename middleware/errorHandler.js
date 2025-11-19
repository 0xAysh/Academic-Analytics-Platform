'use strict';

/**
 * Centralized error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Database connection errors
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ 
      error: 'Database connection refused. Please check if PostgreSQL is running and connection settings are correct.',
      code: 'DB_CONNECTION_REFUSED'
    });
  }
  if (err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({ 
      error: 'Cannot connect to database. Please check your database host and network settings.',
      code: 'DB_CONNECTION_ERROR'
    });
  }
  if (err.code === '28P01') { // Invalid password
    return res.status(503).json({ 
      error: 'Database authentication failed. Please check your database credentials.',
      code: 'DB_AUTH_ERROR'
    });
  }
  if (err.code === '3D000') { // Database does not exist
    return res.status(503).json({ 
      error: 'Database does not exist. Please create the database first.',
      code: 'DB_NOT_FOUND'
    });
  }

  // Database constraint errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({ error: 'Resource already exists', code: 'DUPLICATE' });
  }
  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({ error: 'Invalid reference', code: 'FOREIGN_KEY' });
  }
  if (err.code === '22001' || (err.message && err.message.includes('too long'))) { // String data right truncated / value too long
    return res.status(400).json({ 
      error: 'One or more fields are too long. Please shorten course names, term names, or degree field.',
      code: 'VALUE_TOO_LONG'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({ 
    error: message,
    code: err.code || 'INTERNAL_ERROR'
  });
}

module.exports = errorHandler;

