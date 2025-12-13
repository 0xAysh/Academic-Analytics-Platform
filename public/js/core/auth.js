'use strict';

import { api } from '../api/api.js';
import { logout as apiLogout } from '../api/auth.js';
import { isAuthPage } from '../utils/routing.js';

/**
 * @returns {boolean}
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
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await apiLogout();
  } catch (error) {
    console.error('[Auth] Logout API call failed, token cleared locally:', error);
  }
  window.location.replace('/html/login.html');
}
