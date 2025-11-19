'use strict';

import { api } from './api.js';
import { getUserInfo, setUserInfo, clearUserInfo } from '../utils/user.js';

/**
 * Register a new user
 * @param {string} email - User email address
 * @param {string} password - User password
 * @param {string} name - User name
 * @returns {Promise<object>} Response object with success status and user data
 * @throws {Error} If registration fails
 */
export async function register(email, password, name) {
  const response = await api.post('/auth/register', {
    email,
    password,
    name
  });
  
  if (response.success && response.data.token) {
    api.setToken(response.data.token);
    // Store user info in localStorage (including name from signup)
    if (response.data.user) {
      const userInfo = {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name || '' // Store the name entered during signup
      };
      setUserInfo(userInfo);
      // Avatar initials will be updated when dashboard loads via initAvatarDropdown()
    }
  }
  
  return response;
}

/**
 * Login user
 * @param {string} email - User email address
 * @param {string} password - User password
 * @returns {Promise<object>} Response object with success status and user data
 * @throws {Error} If login fails
 */
export async function login(email, password) {
  const response = await api.post('/auth/login', {
    email,
    password
  });
  
  if (response.success && response.data.token) {
    api.setToken(response.data.token);
    // Store user info in localStorage (including name from database)
    if (response.data.user) {
      const userInfo = {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name || '' // Store the name from database
      };
      setUserInfo(userInfo);
      // Avatar initials will be updated when dashboard loads via initAvatarDropdown()
    }
  }
  
  return response;
}

/**
 * Logout user
 * Clears authentication token and user info from localStorage
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Continue even if API call fails
  }
  api.setToken(null);
  // Clear user info from localStorage
  clearUserInfo();
}

/**
 * Update user profile (email and/or name)
 * @param {object} profileData - Profile data with email, name, and optional password for email change
 * @returns {Promise<object>} Updated user object
 * @throws {Error} If update fails
 */
export async function updateProfile(profileData) {
  const response = await api.put('/auth/profile', profileData);
  return response.data.user;
}

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<object>} Response object
 * @throws {Error} If password change fails
 */
export async function changePassword(currentPassword, newPassword) {
  const response = await api.put('/auth/password', {
    currentPassword,
    newPassword
  });
  return response;
}

