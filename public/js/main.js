'use strict';

import { initAuthGate } from './core/auth.js';
import { initEmptyMode, initTranscriptUpload } from './core/upload.js';
import { initAvatarDropdown } from './core/nav.js';
import { initDashboard } from './pages/dashboard.js';
import { loadTranscriptData, getTranscriptData } from './core/data.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!initAuthGate()) {
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
