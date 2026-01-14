'use strict';

import { $ } from '../utils/dom.js';
import { updateProfile, changePassword, logout, getUser, setUser } from '../api.js';
import { showError, showSuccess } from '../utils/notifications.js';

/**
 * @returns {void}
 */
export function initSettings() {
  initPasswordForm();
  initProfileEditing();
  populateAccountInfo();
}

function initPasswordForm() {
  const form = $('#passwordForm');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

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
    
    if (currentVal === nextVal) {
      showError('New password must be different from current password.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Updating...';
    }

    let passwordChangeSucceeded = false;
    
    try {
      console.log('[Settings] Attempting to change password...');
      console.log('[Settings] Current password length:', currentVal.length);
      console.log('[Settings] New password length:', nextVal.length);
      
      const response = await changePassword(currentVal, nextVal);
      console.log('[Settings] Password change response:', response);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      if (!response.success) {
        const errorMsg = response.error || response.message || 'Password change failed';
        console.error('[Settings] Password change failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      passwordChangeSucceeded = true;
      console.log('[Settings] Password change succeeded!');
      
      showSuccess('Password updated successfully. You will be logged out.');
      
      if (current) current.value = '';
      if (next) next.value = '';
      if (confirm) confirm.value = '';
      
      setTimeout(async () => {
        try {
          console.log('[Settings] Logging out after successful password change...');
          await logout();
          window.location.replace('/html/login.html');
        } catch (logoutError) {
          console.error('[Settings] Logout error:', logoutError);
          window.location.replace('/html/login.html');
        }
      }, 1500);
      
    } catch (error) {
      console.error('[Settings] Password change error caught:', error);
      console.error('[Settings] Error type:', typeof error);
      console.error('[Settings] Error message:', error.message);
      console.error('[Settings] Error stack:', error.stack);
      
      if (passwordChangeSucceeded) {
        console.error('[Settings] ERROR: passwordChangeSucceeded is true but we caught an error!');
        passwordChangeSucceeded = false;
      }
      
      const errorMessage = error.message || 'Failed to update password. Please check your current password and try again.';
      console.log('[Settings] Showing error message:', errorMessage);
      
      try {
        showError(errorMessage);
        console.log('[Settings] Error notification shown');
      } catch (notifError) {
        console.error('[Settings] Failed to show error notification:', notifError);
        alert('Error: ' + errorMessage);
      }
      
      console.log('[Settings] User will NOT be logged out - password change failed');
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Password';
      }
      
      if (next) next.value = '';
      if (confirm) confirm.value = '';
    }
  });
}

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
      const emailEl = $('#infoEmail');
      const nameEl = $('#infoName');
      
      if (emailEl) originalEmail = emailEl.textContent.trim();
      if (nameEl) originalName = nameEl.textContent.trim();

      if (emailEl) {
        const input = document.createElement('input');
        input.className = 'form__input';
        input.type = 'email';
        input.value = originalEmail;
        input.id = 'editEmail';
        input.dataset.original = originalEmail;
        emailEl.replaceWith(input);
      }

      if (nameEl) {
        const input = document.createElement('input');
        input.className = 'form__input';
        input.type = 'text';
        input.value = originalName;
        input.id = 'editName';
        input.dataset.original = originalName;
        nameEl.replaceWith(input);
      }

      editBtn.classList.add('hidden');
      saveBtn.classList.remove('hidden');
      cancelBtn.classList.remove('hidden');
      passwordModal.classList.add('hidden');
      if (emailPasswordInput) emailPasswordInput.value = '';
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
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

      if (!newEmail || !newEmail.includes('@')) {
        showError('Please enter a valid email address.');
        return;
      }

      if (!newName) {
        showError('Please enter your name.');
        return;
      }

      if (emailChanged) {
        const password = emailPasswordInput ? emailPasswordInput.value.trim() : '';
        if (!password) {
          passwordModal.classList.remove('hidden');
          showError('Password confirmation required to change email.');
          return;
        }

        try {
          const updatedUser = await updateProfile({
            email: newEmail,
            name: newName,
            password: password
          });

          const userInfo = getUser();
          if (userInfo) {
            userInfo.email = updatedUser.email;
            userInfo.name = updatedUser.name;
            setUser(userInfo);
          }

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
        try {
          const updatedUser = await updateProfile({
            name: newName
          });

          const userInfo = getUser();
          if (userInfo) {
            userInfo.name = updatedUser.name;
            setUser(userInfo);
          }

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

function populateAccountInfo() {
  try {
    const userInfo = getUser();
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
