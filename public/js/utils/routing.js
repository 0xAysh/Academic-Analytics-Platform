'use strict';

/**
 * Routing utility functions
 */

/**
 * Check if current page is an authentication page (login or signup)
 * @returns {boolean} True if current page is login or signup
 */
export function isAuthPage() {
  try {
    const path = window.location.pathname || '';
    return /\/html\/(login|signup)\.html$/.test(path);
  } catch (error) {
    console.error('[Routing] Error checking auth page:', error);
    return false;
  }
}

/**
 * Redirect to login page if not already on auth page
 */
export function redirectToLogin() {
  if (!isAuthPage()) {
    window.location.href = '/html/login.html';
  }
}

