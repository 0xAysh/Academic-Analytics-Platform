'use strict';

import { $ } from '../utils/dom.js';
import { logout } from './auth.js';

/**
 * Initialize avatar dropdown functionality
 * Handles dropdown toggle and logout action
 */
export function initAvatarDropdown() {
  const avatarIcon = $('#avatarIcon');
  const avatarDropdown = $('#avatarDropdown');
  const logoutBtn = $('#logoutBtn');
  
  if (!avatarIcon || !avatarDropdown) return;
  
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

