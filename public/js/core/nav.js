'use strict';

import { $ } from '../utils/dom.js';
import { logout } from './auth.js';
import { getUserInfo } from '../utils/user.js';

/**
 * Get user initials from name
 * @param {string} name - User's full name
 * @returns {string} Initials (e.g., "John Doe" -> "JD", "John" -> "JO")
 */
function getUserInitials(name) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return 'U'; // Default to 'U' for User if no name
  }
  
  const trimmedName = name.trim();
  const parts = trimmedName.split(/\s+/);
  
  if (parts.length === 1) {
    // Single name - use first two letters
    return trimmedName.substring(0, 2).toUpperCase();
  } else {
    // Multiple names - use first letter of first and last name
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}

/**
 * Update avatar with user initials
 * Uses the name from userInfo stored in localStorage (set during login/register)
 * Never uses email - only uses the name field
 */
export function updateAvatarInitials() {
  const avatarIcon = $('#avatarIcon');
  if (!avatarIcon) return;
  
  try {
    const userInfo = getUserInfo();
    if (userInfo && userInfo.name) {
      // Use name field only - never use email
      const name = userInfo.name || '';
      const initials = getUserInitials(name);
      avatarIcon.textContent = initials;
    } else {
      // Fallback to 'U' if no user info
      avatarIcon.textContent = 'U';
    }
  } catch (error) {
    console.error('[Avatar] Error updating initials:', error);
    avatarIcon.textContent = 'U';
  }
}

/**
 * Initialize avatar dropdown functionality
 * Handles dropdown toggle and logout action
 */
export function initAvatarDropdown() {
  const avatarIcon = $('#avatarIcon');
  const avatarDropdown = $('#avatarDropdown');
  const logoutBtn = $('#logoutBtn');
  
  if (!avatarIcon || !avatarDropdown) return;
  
  // Update avatar initials from stored user info
  updateAvatarInitials();
  
  // Toggle dropdown on avatar click
  avatarIcon.addEventListener('click', function(e) {
    e.stopPropagation();
    avatarDropdown.classList.toggle('show');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (avatarDropdown && 
        !avatarIcon.contains(e.target) && 
        !avatarDropdown.contains(e.target)) {
      avatarDropdown.classList.remove('show');
    }
  });
  
  // Handle logout button click
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      avatarDropdown.classList.remove('show');
      logout();
    });
  }
}

