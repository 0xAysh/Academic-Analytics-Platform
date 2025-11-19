'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createUser, getUserByEmail, getUserById, updateUserProfile, updateUserPassword } = require('../db/queries/users');
const { hashPassword, verifyPassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { isValidEmail, validatePassword, sanitizeString } = require('../utils/validation');

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }
    
    // Sanitize name
    const sanitizedName = name ? sanitizeString(name, 255) : '';
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email.trim().toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists', code: 'DUPLICATE_EMAIL' });
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const user = await createUser(email.trim().toLowerCase(), passwordHash, sanitizedName);
    
    // Generate JWT token
    const token = generateToken(user.id, user.email);
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Get user by email (normalize to lowercase)
    const user = await getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = generateToken(user.id, user.email);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Logout (client-side token removal, but endpoint for consistency)
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * Update user profile (email and/or name)
 * PUT /api/auth/profile
 * Requires authentication
 */
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    const userId = req.user.userId;
    
    // If email is being changed, password confirmation is required
    if (email && email !== req.user.email) {
      if (!password) {
        return res.status(400).json({ error: 'Password confirmation required to change email' });
      }
      
      // Verify password
      const user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Get full user with password hash
      const userWithHash = await getUserByEmail(user.email);
      if (!userWithHash) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const isValid = await verifyPassword(password, userWithHash.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }
    
    // Validate email format if provided
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Sanitize name if provided
    const sanitizedName = name !== undefined ? sanitizeString(name, 255) : undefined;
    
    // Update user profile
    const updatedUser = await updateUserProfile(userId, email, sanitizedName);
    
    res.json({
      success: true,
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(409).json({ error: 'Email already exists', code: 'DUPLICATE_EMAIL' });
    }
    next(error);
  }
});

/**
 * Change user password
 * PUT /api/auth/password
 * Requires authentication
 */
router.put('/password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }
    
    // Get user with password hash
    const user = await getUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    
    // Update password
    await updateUserPassword(userId, newPasswordHash);
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

