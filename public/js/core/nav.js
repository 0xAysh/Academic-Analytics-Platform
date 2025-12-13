'use strict';

import { $ } from '../utils/dom.js';
import { logout } from './auth.js';
import { getUserInfo } from '../utils/user.js';

function getUserInitials(name) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return 'U';
  }
  
  const trimmedName = name.trim();
  const parts = trimmedName.split(/\s+/);
  
  if (parts.length === 1) {
    return trimmedName.substring(0, 2).toUpperCase();
  } else {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}

export function updateAvatarInitials() {
  const avatarIcon = $('#avatarIcon');
  if (!avatarIcon) return;
  
  try {
    const userInfo = getUserInfo();
    if (userInfo && userInfo.name) {
      const name = userInfo.name || '';
      const initials = getUserInitials(name);
      avatarIcon.textContent = initials;
    } else {
      avatarIcon.textContent = 'U';
    }
  } catch (error) {
    console.error('[Avatar] Error updating initials:', error);
    avatarIcon.textContent = 'U';
  }
}

export function initAvatarDropdown() {
  const avatarIcon = $('#avatarIcon');
  const avatarDropdown = $('#avatarDropdown');
  const logoutBtn = $('#logoutBtn');
  
  if (!avatarIcon || !avatarDropdown) return;
  
  updateAvatarInitials();
  
  avatarIcon.addEventListener('click', function(e) {
    e.stopPropagation();
    avatarDropdown.classList.toggle('show');
  });
  
  document.addEventListener('click', function(e) {
    if (avatarDropdown && 
        !avatarIcon.contains(e.target) && 
        !avatarDropdown.contains(e.target)) {
      avatarDropdown.classList.remove('show');
    }
  });
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      avatarDropdown.classList.remove('show');
      logout();
    });
  }
}
