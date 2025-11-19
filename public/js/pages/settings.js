'use strict';

import { $ } from '../utils/dom.js';
import { updateProfile, changePassword } from '../api/auth.js';
import { logout } from '../api/auth.js';
import { showError, showSuccess } from '../utils/notifications.js';
import { getUserInfo, setUserInfo } from '../utils/user.js';

/**
 * Initialize settings page
 */
export function initSettings() {
  initPasswordForm();
  initProfileEditing();
  populateAccountInfo();
}

/**
 * Initialize password change form
 */
function initPasswordForm() {
  const form = $('#passwordForm');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const current = $('#currentPassword');
    const next = $('#newPassword');
    const confirm = $('#confirmPassword');

    const currentVal = current ? current.value.trim() : '';
    const nextVal = next ? next.value.trim() : '';
    const confirmVal = confirm ? confirm.value.trim() : '';

    if (!currentVal || !nextVal || !confirmVal) {
      showError('Please fill in all password fields.');
      return;
    }
    
    if (nextVal.length < 8) {
      showError('New password must be at least 8 characters long.');
      return;
    }
    
    if (nextVal !== confirmVal) {
      showError('New password and confirmation do not match.');
      return;
    }

    try {
      await changePassword(currentVal, nextVal);
      showSuccess('Password updated successfully. You will be logged out.');
      
      // Logout and redirect after a short delay
      setTimeout(async () => {
        await logout();
        window.location.href = '/html/login.html';
      }, 1500);
    } catch (error) {
      showError(error.message || 'Failed to update password. Please try again.');
    }
  });
}

/**
 * Initialize profile editing functionality
 */
function initProfileEditing() {
  const editBtn = $('#editProfileBtn');
  const saveBtn = $('#saveChangesBtn');
  const cancelBtn = $('#cancelEditBtn');
  const passwordModal = $('#passwordConfirmModal');
  const emailPasswordInput = $('#emailChangePassword');

  let originalEmail = '';
  let originalName = '';

  if (editBtn) {
    editBtn.addEventListener('click', function() {
      // Get original values
      const emailEl = $('#infoEmail');
      const nameEl = $('#infoName');
      
      if (emailEl) originalEmail = emailEl.textContent.trim();
      if (nameEl) originalName = nameEl.textContent.trim();

      // Convert email to input
      if (emailEl) {
        const input = document.createElement('input');
        input.className = 'form__input';
        input.type = 'email';
        input.value = originalEmail;
        input.id = 'editEmail';
        input.dataset.original = originalEmail;
        emailEl.replaceWith(input);
      }

      // Convert name to input
      if (nameEl) {
        const input = document.createElement('input');
        input.className = 'form__input';
        input.type = 'text';
        input.value = originalName;
        input.id = 'editName';
        input.dataset.original = originalName;
        nameEl.replaceWith(input);
      }

      // Show/hide buttons
      editBtn.classList.add('hidden');
      saveBtn.classList.remove('hidden');
      cancelBtn.classList.remove('hidden');
      passwordModal.classList.add('hidden');
      if (emailPasswordInput) emailPasswordInput.value = '';
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      // Restore original values
      const emailInput = $('#editEmail');
      const nameInput = $('#editName');

      if (emailInput) {
        const div = document.createElement('div');
        div.className = 'info-tile__value';
        div.id = 'infoEmail';
        div.textContent = originalEmail;
        emailInput.replaceWith(div);
      }

      if (nameInput) {
        const div = document.createElement('div');
        div.className = 'info-tile__value';
        div.id = 'infoName';
        div.textContent = originalName;
        nameInput.replaceWith(div);
      }

      // Show/hide buttons
      editBtn.classList.remove('hidden');
      saveBtn.classList.add('hidden');
      cancelBtn.classList.add('hidden');
      passwordModal.classList.add('hidden');
      if (emailPasswordInput) emailPasswordInput.value = '';
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async function() {
      const emailInput = $('#editEmail');
      const nameInput = $('#editName');
      const emailPasswordInput = $('#emailChangePassword');

      if (!emailInput || !nameInput) {
        showError('Unable to read form data.');
        return;
      }

      const newEmail = emailInput.value.trim();
      const newName = nameInput.value.trim();
      const emailChanged = newEmail !== originalEmail;

      // Validate email
      if (!newEmail || !newEmail.includes('@')) {
        showError('Please enter a valid email address.');
        return;
      }

      // Validate name
      if (!newName) {
        showError('Please enter your name.');
        return;
      }

      // If email changed, require password
      if (emailChanged) {
        const password = emailPasswordInput ? emailPasswordInput.value.trim() : '';
        if (!password) {
          passwordModal.classList.remove('hidden');
          showError('Password confirmation required to change email.');
          return;
        }

        // Prepare update data with password
        try {
          const updatedUser = await updateProfile({
            email: newEmail,
            name: newName,
            password: password
          });

          // Update localStorage
          const userInfo = getUserInfo();
          if (userInfo) {
            userInfo.email = updatedUser.email;
            userInfo.name = updatedUser.name;
            setUserInfo(userInfo);
          }

          // Update UI
          const emailDiv = document.createElement('div');
          emailDiv.className = 'info-tile__value';
          emailDiv.id = 'infoEmail';
          emailDiv.textContent = updatedUser.email;
          emailInput.replaceWith(emailDiv);

          const nameDiv = document.createElement('div');
          nameDiv.className = 'info-tile__value';
          nameDiv.id = 'infoName';
          nameDiv.textContent = updatedUser.name || '';
          nameInput.replaceWith(nameDiv);

          // Reset UI
          editBtn.classList.remove('hidden');
          saveBtn.classList.add('hidden');
          cancelBtn.classList.add('hidden');
          passwordModal.classList.add('hidden');
          if (emailPasswordInput) emailPasswordInput.value = '';

          showSuccess('Profile updated successfully.');
        } catch (error) {
          showError(error.message || 'Failed to update profile. Please try again.');
        }
      } else {
        // Email not changed, no password needed
        try {
          const updatedUser = await updateProfile({
            name: newName
          });

          // Update localStorage
          const userInfo = getUserInfo();
          if (userInfo) {
            userInfo.name = updatedUser.name;
            setUserInfo(userInfo);
          }

          // Update UI
          const nameDiv = document.createElement('div');
          nameDiv.className = 'info-tile__value';
          nameDiv.id = 'infoName';
          nameDiv.textContent = updatedUser.name || '';
          nameInput.replaceWith(nameDiv);

          // Reset UI
          editBtn.classList.remove('hidden');
          saveBtn.classList.add('hidden');
          cancelBtn.classList.add('hidden');
          passwordModal.classList.add('hidden');

          showSuccess('Profile updated successfully.');
        } catch (error) {
          showError(error.message || 'Failed to update profile. Please try again.');
        }
      }
    });
  }
}

/**
 * Populate account info from user data and transcript
 */
function populateAccountInfo() {
  try {
    // Get email and name from userInfo (localStorage)
    const userInfo = getUserInfo();
    const emailEl = $('#infoEmail');
    const nameEl = $('#infoName');

    if (emailEl && userInfo && userInfo.email) {
      emailEl.textContent = userInfo.email;
    } else if (emailEl) {
      emailEl.textContent = 'Not available';
    }

    if (nameEl && userInfo && userInfo.name) {
      nameEl.textContent = userInfo.name;
    } else if (nameEl) {
      nameEl.textContent = 'Not available';
    }
  } catch (error) {
    console.error('[Settings] Error populating account info:', error);
  }
}
