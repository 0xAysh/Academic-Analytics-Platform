'use strict';

import { api } from '../api/api.js';
import { logout as apiLogout } from '../api/auth.js';

/**
 * Initialize auth gate - checks for JWT token
 * Redirects to login if user is not authenticated and not on auth pages
 */
export function initAuthGate() {
  try {
    const path = window.location.pathname || '';
    const isAuthPage = /\/html\/(login|signup)\.html$/.test(path);
    const token = api.getToken();
    
    if (!isAuthPage && !token) {
      window.location.replace('/html/login.html');
      return false;
    }
    return true;
  } catch (e) {
    // Silently fail if localStorage is not available
    return true;
  }
}

/**
 * Handle logout action
 */
export async function logout() {
  try {
    await apiLogout();
  } catch (error) {
    // Continue even if API call fails
  }
  window.location.href = '/html/login.html';
}

