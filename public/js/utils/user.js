'use strict';

/**
 * User utility functions
 * Centralized functions for accessing and managing user information
 */

/**
 * Get user info from localStorage
 * @returns {object|null} User info object with id, email, name, or null if not found
 */
export function getUserInfo() {
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      return null;
    }
    return JSON.parse(userInfoStr);
  } catch (error) {
    console.error('[User] Error reading userInfo from localStorage:', error);
    return null;
  }
}

/**
 * Set user info in localStorage
 * @param {object} userInfo - User info object with id, email, name
 */
export function setUserInfo(userInfo) {
  try {
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } else {
      localStorage.removeItem('userInfo');
    }
  } catch (error) {
    console.error('[User] Error storing userInfo in localStorage:', error);
  }
}

/**
 * Clear user info from localStorage
 */
export function clearUserInfo() {
  try {
    localStorage.removeItem('userInfo');
  } catch (error) {
    console.error('[User] Error clearing userInfo from localStorage:', error);
  }
}

