(function() {
  if (!window.App) window.App = {};

  function initSettings() {
    const form = document.getElementById('passwordForm');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();

        const current = document.getElementById('currentPassword');
        const next = document.getElementById('newPassword');
        const confirm = document.getElementById('confirmPassword');

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
        console.log('Password update requested');
        form.reset();
        alert('Password updated (placeholder).');
      });
    }

    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.getElementById('saveChangesBtn');
    const fields = ['infoEmail','infoMajor','infoYear']
      .map(id => document.getElementById(id));

    function setEditable(editable) {
      fields.forEach(node => {
        if (!node) return;
        if (editable) {
          const val = node.textContent;
          const input = document.createElement('input');
          input.className = 'form__input';
          input.type = 'text';
          input.value = val || '';
          node.replaceWith(input);
        } else if (node.tagName !== 'DIV') {
          // No-op: handled on save
        }
      });
    }

    if (editBtn) {
      editBtn.addEventListener('click', function() {
        // Convert values to inputs for quick inline editing
        ['infoEmail','infoMajor','infoYear'].forEach(id => {
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

    // Populate from transcriptData if available
    try {
      if (typeof transcriptData !== 'undefined') {
        // Email if present
        const emailEl = document.getElementById('infoEmail');
        const dataEmail = transcriptData.studentInfo && transcriptData.studentInfo.email;
        if (emailEl && dataEmail) emailEl.textContent = dataEmail;

        // Major from degree field
        const majorEl = document.getElementById('infoMajor');
        const degree = transcriptData.studentInfo && transcriptData.studentInfo.degree;
        if (majorEl && degree) {
          const normalized = degree.replace(/\s*Major$/i, '').trim();
          majorEl.textContent = normalized || majorEl.textContent;
        }

        // Year from earned credits
        const yearEl = document.getElementById('infoYear');
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
      }
    } catch (e) {
      console.warn('Settings: failed to populate from data', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettings);
  } else {
    initSettings();
  }

  window.App.initSettings = initSettings;
})();


