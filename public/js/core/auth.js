'use strict';

import { api } from '../api/api.js';
import { logout as apiLogout } from '../api/auth.js';
import { isAuthPage } from '../utils/routing.js';

/**
 * Initialize auth gate - checks for JWT token
 * Redirects to login if user is not authenticated and not on auth pages
 * @returns {boolean} True if authenticated or on auth page, false if redirected
 */
export function initAuthGate() {
  try {
    const token = api.getToken();
    
    if (!isAuthPage() && !token) {
      window.location.replace('/html/login.html');
      return false;
    }
    return true;
  } catch (error) {
    console.error('[Auth] Error in initAuthGate:', error);
    return true;
  }
}

/**
 * Handle logout action
 * Logs out user and redirects to login page
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await apiLogout();
  } catch (error) {
    // Continue even if API call fails
  }
  window.location.href = '/html/login.html';
}

