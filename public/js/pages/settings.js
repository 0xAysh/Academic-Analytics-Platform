'use strict';

import { $ } from '../utils/dom.js';
import { getTranscriptData } from '../core/data.js';

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

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const current = $('#currentPassword');
    const next = $('#newPassword');
    const confirm = $('#confirmPassword');

    const currentVal = current ? current.value.trim() : '';
    const nextVal = next ? next.value.trim() : '';
    const confirmVal = confirm ? confirm.value.trim() : '';

    if (!currentVal || !nextVal || !confirmVal) {
      alert('Please fill in all password fields.');
      return;
    }
    if (nextVal.length < 8) {
      alert('New password must be at least 8 characters long.');
      return;
    }
    if (nextVal !== confirmVal) {
      alert('New password and confirmation do not match.');
      return;
    }

    // Placeholder: connect backend here
    form.reset();
    alert('Password updated (placeholder).');
  });
}

/**
 * Initialize profile editing functionality
 */
function initProfileEditing() {
  const editBtn = $('#editProfileBtn');
  const saveBtn = $('#saveChangesBtn');

  if (editBtn) {
    editBtn.addEventListener('click', function() {
      // Convert values to inputs for quick inline editing
      ['infoEmail', 'infoMajor', 'infoYear'].forEach(id => {
        const valueEl = document.getElementById(id);
        if (!valueEl) return;
        const currentText = valueEl.textContent || '';
        const input = document.createElement('input');
        input.className = 'form__input';
        input.type = id === 'infoEmail' ? 'email' : 'text';
        input.value = currentText;
        input.dataset.bind = id;
        valueEl.replaceWith(input);
      });
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      const inputs = document.querySelectorAll('input[data-bind]');
      inputs.forEach(input => {
        const id = input.dataset.bind;
        const div = document.createElement('div');
        div.className = 'info-tile__value';
        div.id = id;
        div.textContent = input.value;
        input.replaceWith(div);
      });
      alert('Profile changes saved (placeholder).');
    });
  }
}

/**
 * Populate account info from transcript data
 */
function populateAccountInfo() {
  try {
    const transcriptData = getTranscriptData();
    if (!transcriptData) return;

    // Email if present
    const emailEl = $('#infoEmail');
    const dataEmail = transcriptData.studentInfo && transcriptData.studentInfo.email;
    if (emailEl && dataEmail) {
      emailEl.textContent = dataEmail;
    }

    // Major from degree field
    const majorEl = $('#infoMajor');
    const degree = transcriptData.studentInfo && transcriptData.studentInfo.degree;
    if (majorEl && degree) {
      const normalized = degree.replace(/\s*Major$/i, '').trim();
      majorEl.textContent = normalized || majorEl.textContent;
    }

    // Year from earned credits
    const yearEl = $('#infoYear');
    const earned = transcriptData.cumulative && Number(transcriptData.cumulative.totalEarnedCredits || 0);
    if (yearEl && !Number.isNaN(earned)) {
      let label = 'Freshman';
      let yearNum = 1;
      if (earned >= 90) { label = 'Senior'; yearNum = 4; }
      else if (earned >= 60) { label = 'Junior'; yearNum = 3; }
      else if (earned >= 30) { label = 'Sophomore'; yearNum = 2; }
      else { label = 'Freshman'; yearNum = 1; }
      yearEl.textContent = `${label} (Year ${yearNum})`;
    }
  } catch (e) {
    // Silently fail if data is not available
  }
}

