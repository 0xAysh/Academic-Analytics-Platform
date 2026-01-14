'use strict';

import { requireAuth } from './api.js';
import { initEmptyMode, initTranscriptUpload } from './core/upload.js';
import { initAvatarDropdown } from './core/nav.js';
import { initDashboard } from './pages/dashboard.js';
import { loadTranscriptData, getTranscriptData } from './core/data.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) {
    return;
  }

  await loadTranscriptData();

  initEmptyMode();
  initTranscriptUpload();

  initAvatarDropdown();

  function waitForData() {
    const transcriptData = getTranscriptData();
    if (transcriptData) {
      initDashboard();
    } else {
      setTimeout(waitForData, 50);
    }
  }

  waitForData();
});
