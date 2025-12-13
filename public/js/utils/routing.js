'use strict';

/**
 * @returns {boolean}
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
 */
export function redirectToLogin() {
  if (!isAuthPage()) {
    window.location.href = '/html/login.html';
  }
}
