document.addEventListener('DOMContentLoaded', function() {
  if (!window.App) window.App = {};
  
  // Simple client-side auth gate (demo only)
  try {
    const path = window.location.pathname || '';
    const isAuthPage = /\/html\/(login|signup)\.html$/.test(path);
    const authUser = localStorage.getItem('authUser');
    if (!isAuthPage && !authUser) {
      window.location.replace('/html/login.html');
      return;
    }
  } catch (e) { /* noop */ }

  // Empty mode: hide data until transcript upload (demo persisted by localStorage)
  try {
    const loaded = !!localStorage.getItem('transcriptLoaded');
    window.App.emptyMode = !loaded;
    if (window.transcriptData && typeof transcriptData.getCompletedTerms === 'function') {
      if (!window.App._origGetTerms) window.App._origGetTerms = transcriptData.getCompletedTerms.bind(transcriptData);
      if (window.App.emptyMode) {
        transcriptData.getCompletedTerms = function() { return []; };
      } else {
        transcriptData.getCompletedTerms = window.App._origGetTerms;
      }
    }
  } catch (e) {}

  // Avatar dropdown functionality
  const avatarIcon = document.getElementById('avatarIcon');
  const avatarDropdown = document.getElementById('avatarDropdown');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (avatarIcon && avatarDropdown) {
    // Toggle dropdown on avatar click
    avatarIcon.addEventListener('click', function(e) {
      e.stopPropagation();
      avatarDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (avatarDropdown && !avatarIcon.contains(e.target) && !avatarDropdown.contains(e.target)) {
        avatarDropdown.classList.remove('show');
      }
    });
    
    // Handle logout button click
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        avatarDropdown.classList.remove('show');
        
        // TODO: Connect to backend logout endpoint. For now, redirect to login.
        // Example: await fetch('/api/logout', { method: 'POST' });
        try { localStorage.removeItem('authUser'); } catch (e) {}
        window.location.href = '/html/login.html';
      });
    }
  }
  
  if (window.App.loadDashboardMetrics) {
    window.App.loadDashboardMetrics();
  }
  
  // Upload transcript demo handler (file chooser + flag)
  try {
    const input = document.getElementById('transcriptFile');
    const nameEl = document.getElementById('uploadFileName');
    if (input) {
      input.addEventListener('change', function() {
        const file = input.files && input.files[0];
        if (!file) return;
        if (nameEl) nameEl.textContent = file.name;
        console.log('Selected transcript file:', file.name);
        try { localStorage.setItem('transcriptLoaded', '1'); } catch (e) {}
        window.location.reload();
      });
    }
  } catch (e) {}

  setTimeout(() => {
    if (window.App.renderGPATrendChart) window.App.renderGPATrendChart();
    if (window.App.renderCreditsChart) window.App.renderCreditsChart();
    if (window.App.renderCourseBreakdown) window.App.renderCourseBreakdown();
    if (window.App.renderGradeDistribution) window.App.renderGradeDistribution();
    if (window.App.renderStrengthSummary) window.App.renderStrengthSummary();
  }, 100);
  
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.App.renderGPATrendChart) window.App.renderGPATrendChart();
      if (window.App.renderCreditsChart) window.App.renderCreditsChart();
      if (window.App.renderGradeDistribution) window.App.renderGradeDistribution();
    }, 250);
  });
});
