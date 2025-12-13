'use strict';

import { api } from './api.js';
import { getUserInfo, setUserInfo, clearUserInfo } from '../utils/user.js';

/**
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @returns {Promise<object>}
 */
export async function register(email, password, name) {
  const response = await api.post('/auth/register', {
    email,
    password,
    name
  });
  
  if (response.success && response.data.token) {
    api.setToken(response.data.token);
    if (response.data.user) {
      const userInfo = {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name || ''
      };
      setUserInfo(userInfo);
    }
  }
  
  return response;
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>}
 */
export async function login(email, password) {
  const response = await api.post('/auth/login', {
    email,
    password
  });
  
  if (response.success && response.data.token) {
    api.setToken(response.data.token);
    if (response.data.user) {
      const userInfo = {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name || ''
      };
      setUserInfo(userInfo);
    }
  }
  
  return response;
}

/**
 * @returns {Promise<void>}
 */
export async function logout() {
  api.setToken(null);
  clearUserInfo();
  
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('[Auth] Logout API call failed, but token cleared locally:', error);
  }
}

/**
 * @param {object} profileData
 * @returns {Promise<object>}
 */
export async function updateProfile(profileData) {
  const response = await api.put('/auth/profile', profileData);
  return response.data.user;
}

/**
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<object>}
 */
export async function changePassword(currentPassword, newPassword) {
  try {
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword
    });
    
    if (!response) {
      throw new Error('No response from server');
    }
    
    if (response.error && !response.success) {
      throw new Error(response.error);
    }
    
    return response;
  } catch (error) {
    console.error('[Auth API] changePassword error:', error);
    throw error;
  }
}

/**
 * @param {string} email
 * @returns {Promise<object>}
 */
export async function requestPasswordReset(email) {
  const response = await api.post('/auth/forgot-password', {
    email
  });
  return response;
}

/**
 * @param {string} token
 * @param {string} newPassword
 * @returns {Promise<object>}
 */
export async function resetPassword(token, newPassword) {
  const response = await api.post('/auth/reset-password', {
    token,
    newPassword
  });
  return response;
}
