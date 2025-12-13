'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createUser, getUserByEmail, getUserById, updateUserProfile, updateUserPassword } = require('../db/queries/users');
const { createResetToken, verifyResetToken, markTokenAsUsed } = require('../db/queries/passwordReset');
const { hashPassword, verifyPassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { isValidEmail, validatePassword, sanitizeString } = require('../utils/validation');

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }
    
    const sanitizedName = name ? sanitizeString(name, 255) : '';
    
    const existingUser = await getUserByEmail(email.trim().toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists', code: 'DUPLICATE_EMAIL' });
    }
    
    const passwordHash = await hashPassword(password);
    
    const user = await createUser(email.trim().toLowerCase(), passwordHash, sanitizedName);
    
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

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const user = await getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
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

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    const userId = req.user.userId;
    
    if (email && email !== req.user.email) {
      if (!password) {
        return res.status(400).json({ error: 'Password confirmation required to change email' });
      }
      
      const user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userWithHash = await getUserByEmail(user.email);
      if (!userWithHash) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const isValid = await verifyPassword(password, userWithHash.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }
    
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const sanitizedName = name !== undefined ? sanitizeString(name, 255) : undefined;
    
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

router.put('/password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }
    
    const user = await getUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    const newPasswordHash = await hashPassword(newPassword);
    
    await updateUserPassword(userId, newPasswordHash);
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const user = await getUserByEmail(email.trim().toLowerCase());
    
    if (user) {
      const token = await createResetToken(user.id, 1);
      
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset token has been generated.',
        resetToken: token,
        resetLink: `/html/reset-password.html?token=${token}`
      });
    } else {
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset token has been generated.'
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }
    
    const tokenData = await verifyResetToken(token);
    if (!tokenData) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    const newPasswordHash = await hashPassword(newPassword);
    
    await updateUserPassword(tokenData.user_id, newPasswordHash);
    
    await markTokenAsUsed(token);
    
    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
